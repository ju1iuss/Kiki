import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface KeyDescription {
  description: string; // Simple text description of the key
}

interface MatchResult {
  key_id: string;
  title: string;
  similarity: number;
  reason: string; // Why this is a match
  description: string; // The description of the matched key
  image_url?: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Helper function to create response with CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const { mode, image, clerk_user_id } = await req.json();

    if (!mode || !image) {
      return new Response(
        JSON.stringify({ error: "mode and image are required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Prepare image URL (handle both base64 and URL)
    let imageUrl: string;
    if (image.startsWith("data:image")) {
      imageUrl = image; // base64 data URL
    } else if (image.startsWith("http")) {
      imageUrl = image; // external URL
    } else {
      // Assume base64 without data URL prefix
      imageUrl = `data:image/jpeg;base64,${image}`;
    }

    // Step 1: Describe the key in the image
    const description = await describeKeyImage(imageUrl);

    if (mode === "analyze") {
      return new Response(
        JSON.stringify({
          success: true,
          description: description.description, // Store as simple text string
        }),
        { headers: corsHeaders }
      );
    }

    if (mode === "match") {
      if (!clerk_user_id) {
        return new Response(
          JSON.stringify({ error: "clerk_user_id required for match mode" }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Get all keys for this user
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: userKeys, error } = await supabase
        .from("physical_keys")
        .select("id, title, description, image_url")
        .eq("clerk_user_id", clerk_user_id);

      if (error) {
        console.error("Error fetching user keys:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch user keys" }),
          { status: 500, headers: corsHeaders }
        );
      }

      // Step 2: Use AI to compare descriptions and find matches
      const matches = await findMatchesWithAI(description.description, userKeys || []);

      return new Response(
        JSON.stringify({
          success: true,
          description: description.description,
          matches,
        }),
        { headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid mode. Use 'analyze' or 'match'" }),
      { status: 400, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error in key function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function describeKeyImage(imageUrl: string): Promise<KeyDescription> {
  const prompt = `Look at this image and describe EXACTLY what you see. Be precise and accurate.

CRITICAL: Describe the ACTUAL color you see - black, white, silver, brass, etc. Do not guess or assume.

Describe the key in this order:
1. COLOR - What is the exact color? (black, white, silver, brass, gold, etc.)
2. TYPE - What type of key? (house key, car key, key fob, etc.)
3. SHAPE - Head shape and blade shape
4. TEETH - How many teeth/cuts on the blade?
5. FEATURES - Any grooves, markings, text, numbers, logos?
6. MATERIAL - What material does it appear to be made of?
7. SIZE - Approximate size (small, medium, large)

Be accurate and specific. Return ONLY plain text description, no JSON, no formatting.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high", // Changed to high for better color accuracy
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.1, // Lower temperature for more accurate descriptions
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  return { description: content.trim() };
}

async function findMatchesWithAI(
  newDescription: string,
  existingKeys: Array<{ id: string; title: string; description: string | null; image_url: string | null }>
): Promise<MatchResult[]> {
  // Filter out keys without descriptions
  const keysWithDescriptions = existingKeys.filter(k => k.description && k.description.trim());
  
  console.log(`Finding matches: ${keysWithDescriptions.length} keys with descriptions out of ${existingKeys.length} total`);
  
  if (keysWithDescriptions.length === 0) {
    console.log("No keys with descriptions found");
    return [];
  }

  // Build a list of existing key descriptions for comparison
  const keyDescriptions = keysWithDescriptions.map((key, index) => {
    // Try to parse JSON description (old format) or use as plain text (new format)
    let descriptionText = key.description || "";
    try {
      const parsed = JSON.parse(descriptionText);
      // If it's old JSON format, try to extract description_summary or create one
      if (parsed.description_summary) {
        descriptionText = parsed.description_summary;
      } else if (parsed.description) {
        descriptionText = parsed.description;
      } else {
        // Fallback: create a description from the JSON structure
        descriptionText = JSON.stringify(parsed);
      }
    } catch {
      // Already plain text, use as-is
    }
    return `Key ${index + 1} (ID: ${key.id}, Title: "${key.title || "Untitled"}"): ${descriptionText}`;
  }).join("\n\n");

  const prompt = `You are comparing a newly scanned key with existing keys in a collection.

NEW KEY DESCRIPTION:
${newDescription}

EXISTING KEYS IN COLLECTION:
${keyDescriptions}

Compare the new key description with each existing key description. For each existing key, determine:
1. How similar it is to the new key (0-100 similarity score)
2. Why it matches or doesn't match (brief reason)

IMPORTANT: You MUST return at least one match - the most similar key, even if similarity is low. Always include the best match.

Return a JSON object with a "matches" array in this exact format:
{
  "matches": [
    {
      "key_index": 0,
      "similarity": 85,
      "reason": "Both are house keys with 6 teeth, brass material, and same head shape"
    },
    {
      "key_index": 2,
      "similarity": 72,
      "reason": "Similar car key fob with same brand markings and button layout"
    }
  ]
}

Return ONLY valid JSON object, no markdown, no code blocks, no explanations.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Error in AI matching:", error);
    // Return fallback match instead of empty array
    if (keysWithDescriptions.length > 0) {
      const firstKey = keysWithDescriptions[0];
      let descriptionText = firstKey.description || "";
      try {
        const parsed = JSON.parse(descriptionText);
        if (parsed.description_summary) {
          descriptionText = parsed.description_summary;
        } else if (parsed.description) {
          descriptionText = parsed.description;
        }
      } catch {
        // Already plain text
      }
      return [{
        key_id: firstKey.id,
        title: firstKey.title || "Untitled Key",
        similarity: 0.3,
        reason: "Best available match (AI comparison unavailable)",
        description: descriptionText,
        image_url: firstKey.image_url,
      }];
    }
    return [];
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    console.error("No content in AI matching response");
    // Return fallback match instead of empty array
    if (keysWithDescriptions.length > 0) {
      const firstKey = keysWithDescriptions[0];
      let descriptionText = firstKey.description || "";
      try {
        const parsed = JSON.parse(descriptionText);
        if (parsed.description_summary) {
          descriptionText = parsed.description_summary;
        } else if (parsed.description) {
          descriptionText = parsed.description;
        }
      } catch {
        // Already plain text
      }
      return [{
        key_id: firstKey.id,
        title: firstKey.title || "Untitled Key",
        similarity: 0.3,
        reason: "Best available match (AI comparison unavailable)",
        description: descriptionText,
        image_url: firstKey.image_url,
      }];
    }
    return [];
  }

  try {
    // Parse the response - it should be wrapped in a JSON object
    let parsedResponse = JSON.parse(content);
    
    // Handle both direct array and wrapped object formats
    let matchesArray: Array<{ key_index: number; similarity: number; reason: string }> = [];
    if (Array.isArray(parsedResponse)) {
      matchesArray = parsedResponse;
    } else if (parsedResponse.matches && Array.isArray(parsedResponse.matches)) {
      matchesArray = parsedResponse.matches;
    } else if (parsedResponse.results && Array.isArray(parsedResponse.results)) {
      matchesArray = parsedResponse.results;
    }

    // Convert to MatchResult format
    let results: MatchResult[] = matchesArray
      .filter((match: any) => match.key_index >= 0 && match.key_index < keysWithDescriptions.length)
      .map((match: any) => {
        const key = keysWithDescriptions[match.key_index];
        let descriptionText = key.description || "";
        try {
          const parsed = JSON.parse(descriptionText);
          if (parsed.description_summary) {
            descriptionText = parsed.description_summary;
          } else if (parsed.description) {
            descriptionText = parsed.description;
          }
        } catch {
          // Already plain text
        }

        return {
          key_id: key.id,
          title: key.title || "Untitled Key",
          similarity: Math.round(match.similarity) / 100,
          reason: match.reason || "Similar key found",
          description: descriptionText,
          image_url: key.image_url,
        };
      })
      .sort((a, b) => b.similarity - a.similarity);

    // ALWAYS return at least the most similar match, even if similarity is low
    if (results.length === 0 && keysWithDescriptions.length > 0) {
      console.log("No matches found by AI, returning best match anyway");
      // If AI didn't return any matches, create a fallback match with the first key
      const firstKey = keysWithDescriptions[0];
      let descriptionText = firstKey.description || "";
      try {
        const parsed = JSON.parse(descriptionText);
        if (parsed.description_summary) {
          descriptionText = parsed.description_summary;
        } else if (parsed.description) {
          descriptionText = parsed.description;
        }
      } catch {
        // Already plain text
      }
      
      results = [{
        key_id: firstKey.id,
        title: firstKey.title || "Untitled Key",
        similarity: 0.3, // Low similarity but still shown
        reason: "Best available match from your collection",
        description: descriptionText,
        image_url: firstKey.image_url,
      }];
    }

    console.log(`Returning ${results.length} matches, top similarity: ${results[0]?.similarity || 0}`);
    return results;
  } catch (parseError) {
    console.error("Error parsing AI matching response:", parseError);
    console.error("Response content:", content);
    // Return fallback match instead of empty array
    if (keysWithDescriptions.length > 0) {
      const firstKey = keysWithDescriptions[0];
      let descriptionText = firstKey.description || "";
      try {
        const parsed = JSON.parse(descriptionText);
        if (parsed.description_summary) {
          descriptionText = parsed.description_summary;
        } else if (parsed.description) {
          descriptionText = parsed.description;
        }
      } catch {
        // Already plain text
      }
      return [{
        key_id: firstKey.id,
        title: firstKey.title || "Untitled Key",
        similarity: 0.3,
        reason: "Best available match (parsing error occurred)",
        description: descriptionText,
        image_url: firstKey.image_url,
      }];
    }
    return [];
  }
}



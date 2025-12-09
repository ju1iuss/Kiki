import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface KeyAnalysis {
  key_type: string; // "house_key", "car_key", "car_key_fob", "special_key", "unknown"
  color: {
    primary: string;
    secondary?: string;
    finish: string; // "matte", "shiny", "brushed", "painted"
  };
  shape: {
    head_shape: string; // "round", "oval", "rectangular", "square", "custom"
    head_size: string; // "small", "medium", "large"
    blade_shape: string; // "straight", "curved", "wavy", "serrated"
    blade_width: string; // "narrow", "medium", "wide"
    overall_length: string; // "short", "medium", "long"
  };
  teeth_pattern: {
    zacken_anzahl: number; // number of teeth/cuts
    cut_pattern: string; // "uniform", "varying", "deep_shallow_alternating"
    cut_depth_pattern: string; // description of depth variations
    spacing: string; // "even", "irregular", "grouped"
  };
  material: {
    type: string; // "brass", "steel", "nickel_silver", "aluminum", "plastic", "mixed"
    finish_type: string;
  };
  special_features: {
    markings: string[]; // text, logos, numbers found on key
    grooves: string; // "single_groove", "double_groove", "no_groove", "side_grooves"
    holes: boolean;
    transponder_chip: boolean; // for car keys
    remote_buttons: boolean; // for car key fobs
    switchblade: boolean; // foldable key
    laser_cut: boolean; // high security keys
    bitting_code_visible: boolean;
    manufacturer_markings: string[];
  };
  dimensions: {
    approximate_length_mm?: number;
    approximate_width_mm?: number;
    head_diameter_mm?: number;
  };
  condition: {
    wear_level: string; // "new", "slight_wear", "moderate_wear", "heavy_wear"
    damage: string[]; // any visible damage
  };
  unique_identifiers: {
    text_on_key: string[];
    numbers_on_key: string[];
    logos_brands: string[];
  };
  description_summary: string; // comprehensive text description
}

interface MatchResult {
  key_id: string;
  title: string;
  similarity: number;
  matched_features: string[];
  analysis: KeyAnalysis;
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

    // Analyze the key image using OpenAI Vision
    const analysis = await analyzeKeyImage(imageUrl);

    if (mode === "analyze") {
      return new Response(
        JSON.stringify({
          success: true,
          analysis,
          description: JSON.stringify(analysis), // Store as JSON string for database
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

      // Compare with existing keys
      const matches = await findMatches(analysis, userKeys || []);

      return new Response(
        JSON.stringify({
          success: true,
          analysis,
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

async function analyzeKeyImage(imageUrl: string): Promise<KeyAnalysis> {
  const prompt = `You are an expert locksmith and key identification specialist. Analyze ONLY the key object in this image - ignore everything else (background, hands, surfaces, other objects).

CRITICAL INSTRUCTIONS:
- Focus EXCLUSIVELY on the key itself
- Ignore background, hands, surfaces, or any other objects
- Analyze only the physical key object visible in the image
- If multiple keys are present, analyze only the most prominent/centered one
- Ignore shadows, reflections, or background details

CRITICAL: Return ONLY valid JSON, no markdown, no code blocks, no explanations. The response must be parseable JSON.

Analyze ONLY the key object and provide a comprehensive analysis in this EXACT JSON structure:

{
  "key_type": "house_key|car_key|car_key_fob|special_key|unknown",
  "color": {
    "primary": "exact color name",
    "secondary": "color if present",
    "finish": "matte|shiny|brushed|painted"
  },
  "shape": {
    "head_shape": "round|oval|rectangular|square|custom",
    "head_size": "small|medium|large",
    "blade_shape": "straight|curved|wavy|serrated",
    "blade_width": "narrow|medium|wide",
    "overall_length": "short|medium|long"
  },
  "teeth_pattern": {
    "zacken_anzahl": <number>,
    "cut_pattern": "uniform|varying|deep_shallow_alternating",
    "cut_depth_pattern": "detailed description",
    "spacing": "even|irregular|grouped"
  },
  "material": {
    "type": "brass|steel|nickel_silver|aluminum|plastic|mixed",
    "finish_type": "description"
  },
  "special_features": {
    "markings": ["list", "of", "all", "text", "logos", "numbers"],
    "grooves": "single_groove|double_groove|no_groove|side_grooves",
    "holes": true|false,
    "transponder_chip": true|false,
    "remote_buttons": true|false,
    "switchblade": true|false,
    "laser_cut": true|false,
    "bitting_code_visible": true|false,
    "manufacturer_markings": ["list", "of", "brands", "logos"]
  },
  "dimensions": {
    "approximate_length_mm": <number or null>,
    "approximate_width_mm": <number or null>,
    "head_diameter_mm": <number or null>
  },
  "condition": {
    "wear_level": "new|slight_wear|moderate_wear|heavy_wear",
    "damage": ["list", "of", "damage", "if", "any"]
  },
  "unique_identifiers": {
    "text_on_key": ["all", "text", "found"],
    "numbers_on_key": ["all", "numbers", "found"],
    "logos_brands": ["all", "brands", "logos"]
  },
  "description_summary": "comprehensive 2-3 sentence description of the entire key"
}

IMPORTANT ANALYSIS GUIDELINES:
- Focus ONLY on the key object itself - ignore background, hands, surfaces, shadows
- For HOUSE KEYS: Focus on blade cuts, grooves, head shape, manufacturer markings visible ON THE KEY
- For CAR KEYS: Identify if it's mechanical key, transponder key, or key fob. Note buttons, chips, switchblade features ON THE KEY
- For CAR KEY FOBS: Identify remote buttons, transponder presence, removable blade, brand visible ON THE KEY
- For SPECIAL KEYS: Identify unique features like laser cuts, side grooves, unusual shapes ON THE KEY
- Count teeth/cuts accurately (zacken_anzahl) - only count what's visible on the key blade
- Extract ALL visible text, numbers, and logos that appear ON THE KEY itself
- Note material and finish details of the key object only
- Assess wear and condition of the key only
- Ignore any text, objects, or features that are not part of the key itself
- Be extremely detailed about the key object only - this analysis will be used for key matching`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o", // Using gpt-4o for best accuracy
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
                detail: "low", // Low detail reduces cost by ~88% (85 tokens vs 765) with minimal quality loss for key analysis
              },
            },
          ],
        },
      ],
      max_tokens: 1500, // Reduced from 2000 to prevent over-generation and reduce costs
      temperature: 0.1, // Low temperature for consistent, accurate output
      response_format: { type: "json_object" }, // Force JSON output
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

  try {
    // Parse JSON response
    const analysis = JSON.parse(content);
    return analysis as KeyAnalysis;
  } catch (parseError) {
    // If JSON parsing fails, try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) ||
      content.match(/(\{[\s\S]*\})/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as KeyAnalysis;
    }
    
    throw new Error(`Failed to parse JSON from OpenAI response: ${content}`);
  }
}

async function findMatches(
  newAnalysis: KeyAnalysis,
  existingKeys: Array<{ id: string; title: string; description: string | null; image_url: string | null }>
): Promise<MatchResult[]> {
  const matches: MatchResult[] = [];

  for (const key of existingKeys) {
    if (!key.description) continue;

    try {
      const existingAnalysis: KeyAnalysis = JSON.parse(key.description);
      const similarity = calculateSimilarity(newAnalysis, existingAnalysis);
      
      if (similarity > 0) {
        const matchedFeatures = getMatchedFeatures(newAnalysis, existingAnalysis);
        matches.push({
          key_id: key.id,
          title: key.title || "Untitled Key",
          similarity: Math.round(similarity * 100) / 100,
          matched_features: matchedFeatures,
          analysis: existingAnalysis,
          image_url: key.image_url,
        });
      }
    } catch (error) {
      console.error(`Error parsing description for key ${key.id}:`, error);
      continue;
    }
  }

  // Sort by similarity (highest first)
  matches.sort((a, b) => b.similarity - a.similarity);

  return matches;
}

function calculateSimilarity(
  analysis1: KeyAnalysis,
  analysis2: KeyAnalysis
): number {
  let score = 0;
  let maxScore = 0;

  // Key type match (20% weight)
  maxScore += 20;
  if (analysis1.key_type === analysis2.key_type) {
    score += 20;
  }

  // Color match (10% weight)
  maxScore += 10;
  if (analysis1.color.primary === analysis2.color.primary) {
    score += 8;
  }
  if (analysis1.color.finish === analysis2.color.finish) {
    score += 2;
  }

  // Shape match (15% weight)
  maxScore += 15;
  if (analysis1.shape.head_shape === analysis2.shape.head_shape) score += 5;
  if (analysis1.shape.blade_shape === analysis2.shape.blade_shape) score += 5;
  if (analysis1.shape.blade_width === analysis2.shape.blade_width) score += 3;
  if (analysis1.shape.overall_length === analysis2.shape.overall_length) score += 2;

  // Teeth pattern match (25% weight - most important for physical keys)
  maxScore += 25;
  const teethDiff = Math.abs(
    analysis1.teeth_pattern.zacken_anzahl - analysis2.teeth_pattern.zacken_anzahl
  );
  if (teethDiff === 0) {
    score += 15;
  } else if (teethDiff <= 1) {
    score += 10;
  } else if (teethDiff <= 2) {
    score += 5;
  }
  if (analysis1.teeth_pattern.cut_pattern === analysis2.teeth_pattern.cut_pattern) {
    score += 5;
  }
  if (analysis1.teeth_pattern.spacing === analysis2.teeth_pattern.spacing) {
    score += 5;
  }

  // Material match (10% weight)
  maxScore += 10;
  if (analysis1.material.type === analysis2.material.type) {
    score += 10;
  }

  // Special features match (15% weight)
  maxScore += 15;
  if (analysis1.special_features.grooves === analysis2.special_features.grooves) {
    score += 5;
  }
  if (
    analysis1.special_features.transponder_chip ===
    analysis2.special_features.transponder_chip
  ) {
    score += 3;
  }
  if (
    analysis1.special_features.remote_buttons ===
    analysis2.special_features.remote_buttons
  ) {
    score += 3;
  }
  if (
    analysis1.special_features.laser_cut === analysis2.special_features.laser_cut
  ) {
    score += 2;
  }
  if (analysis1.special_features.switchblade === analysis2.special_features.switchblade) {
    score += 2;
  }

  // Unique identifiers match (5% weight)
  maxScore += 5;
  const commonMarkings = analysis1.special_features.markings.filter((m) =>
    analysis2.special_features.markings.includes(m)
  );
  if (commonMarkings.length > 0) {
    score += Math.min(5, commonMarkings.length * 2);
  }

  // Calculate percentage
  return maxScore > 0 ? score / maxScore : 0;
}

function getMatchedFeatures(
  analysis1: KeyAnalysis,
  analysis2: KeyAnalysis
): string[] {
  const features: string[] = [];

  if (analysis1.key_type === analysis2.key_type) {
    features.push("key_type");
  }
  if (analysis1.color.primary === analysis2.color.primary) {
    features.push("color");
  }
  if (
    analysis1.teeth_pattern.zacken_anzahl === analysis2.teeth_pattern.zacken_anzahl
  ) {
    features.push("teeth_count");
  }
  if (analysis1.shape.head_shape === analysis2.shape.head_shape) {
    features.push("head_shape");
  }
  if (analysis1.shape.blade_shape === analysis2.shape.blade_shape) {
    features.push("blade_shape");
  }
  if (analysis1.material.type === analysis2.material.type) {
    features.push("material");
  }
  if (analysis1.special_features.grooves === analysis2.special_features.grooves) {
    features.push("grooves");
  }

  return features;
}


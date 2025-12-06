# Design & Copy Guidelines

This document serves as the single source of truth for design patterns, styling, and copywriting guidelines for the Tasy Viral AI Mockup Tool project.

---

## 🎨 Design System

### Color Palette

#### Primary Colors (Dark Theme)
- **Background**: `#191919` (main app background)
- **Foreground/Text**: `#FFFFFF` (white) for primary text
- **Secondary Text**: `#9CA3AF` (gray-400) for secondary/subtle text
- **Muted Text**: `#6B7280` (gray-500) for disabled/tertiary text

#### UI Element Colors
- **Borders**: `rgba(255, 255, 255, 0.1)` or `border-white/10` for subtle dividers
- **Input Background**: `#1F2937` (gray-800) with `border-gray-700`
- **Card Background**: `rgba(31, 41, 55, 0.5)` or `bg-gray-800/50` for elevated surfaces
- **Sidebar**: `#191919` with `border-r border-white/10`

#### Semantic Colors
- **Primary Button**: Gradient from `primary` to `primary/90` with white text
- **Outline Button**: Transparent with border, hover: `bg-accent/80`
- **Destructive**: Red tones for delete/error actions

### Typography

#### Font Family
- **Primary Font**: `font-marlinsoft` (Marlinsoft) - Used for all headings and UI text
- **Fallback**: System fonts for monospace

#### Type Scale
- **Page Title (H1)**: `text-3xl font-bold text-white font-marlinsoft` - Centered with subtitle
- **Section Headings**: `text-sm font-semibold text-gray-400 uppercase tracking-wide` - Left-aligned
- **Body Text**: `text-sm` or `text-base` with appropriate color
- **Labels**: `text-sm font-medium text-gray-300` - Left-aligned
- **Subtitle**: `text-gray-400 mt-2` - Below main heading

#### Font Weights
- **Bold**: `font-bold` (headings)
- **Semibold**: `font-semibold` (navigation, important labels)
- **Medium**: `font-medium` (labels, buttons)
- **Regular**: Default (body text)

### Spacing

#### Standard Spacing Scale
- **Page Container**: `space-y-8` for main content sections
- **Section Spacing**: `space-y-6` for form groups
- **Form Field Spacing**: `space-y-4` for input groups
- **Small Gaps**: `gap-2`, `gap-3`, `gap-4` for flex/grid items

#### Padding Patterns
- **Page Padding**: `px-4 sm:px-6 lg:px-8 py-8` in AppLayout content area
- **Card Padding**: `p-4` or `p-6` depending on content density
- **Button Padding**: `px-4 py-2` (default), `px-3` (small), `px-6` (large)

### Border Radius
- **Standard**: `rounded-2xl` (buttons, cards)
- **Small**: `rounded-lg` (inputs, small elements)
- **Base Radius**: `0.625rem` (10px)

---

## 📐 Layout Patterns

### App Layout Structure

#### Protected Pages (Dashboard, Settings, etc.)
```tsx
<AppLayout>
  <div className="space-y-8">
    {/* Centered Header */}
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white font-marlinsoft">
        Page Title
      </h1>
      <p className="text-gray-400 mt-2">
        Subtitle description
      </p>
    </div>
    
    {/* Content */}
    <div className="space-y-6">
      {/* Form fields, cards, etc. */}
    </div>
  </div>
</AppLayout>
```

#### Layout Constraints
- **Max Width**: `900px` for main container
- **Content Width**: `400px` max-width for centered content
- **Sidebar**: Fixed `w-56` (224px) width, full height
- **Height**: `h-screen` with `overflow-hidden` on outer container
- **Main Content**: `overflow-y-auto` for scrollable content

### Component Patterns

#### Buttons
- **Default**: Gradient background, rounded-2xl, `h-11` height
- **Outline**: Transparent with border, same height
- **Full Width**: `w-full` for forms
- **With Icons**: `gap-2` spacing, icon size `w-4 h-4`

#### Form Inputs
- **Background**: `bg-gray-800`
- **Border**: `border-gray-700`
- **Text**: `text-white` for active, `text-gray-400` for disabled
- **Labels**: Left-aligned, `text-sm font-medium text-gray-300 mb-2`

#### Cards/Sections
- **Background**: `bg-gray-800/50` for subtle elevation
- **Padding**: `p-4` or `p-6`
- **Border**: `border-white/10` for dividers

#### Navigation (Sidebar)
- **Active State**: `text-white` with filled icon
- **Inactive State**: `text-gray-400`
- **Hover**: Subtle background change
- **Spacing**: `px-4 py-3` for nav items

---

## 🎯 Design Principles

### Minimalism
- **Keep it simple**: Avoid unnecessary decorative elements
- **Less is more**: Remove verbose text, focus on essential actions
- **Clean hierarchy**: Clear visual hierarchy with spacing and typography

### Consistency
- **Centered headers**: All page titles follow the same centered pattern with subtitle
- **Left-aligned forms**: Form labels and inputs are left-aligned
- **Consistent spacing**: Use the spacing scale consistently

### Dark Theme First
- **Background**: Always `#191919` for main app areas
- **Contrast**: Ensure sufficient contrast for readability
- **Subtle borders**: Use low-opacity white borders for separation

### Responsive Design
- **Mobile-first**: Sidebar becomes overlay on mobile (`lg:` breakpoint)
- **Content width**: Adapts with responsive padding
- **Touch-friendly**: Adequate tap targets (min 44x44px)

---

## 📝 Copy Guidelines

### Core Value Propositions & Positioning

#### Primary Hook
**"Turn any brand into an aesthetic Instagram feed in 30 seconds—no designer needed."**

### Target Audiences & Their Pain Points

#### 1. Freelance Social Media Managers
- **Pain**: Spending 5–10 hours/week creating client mockups and pitch decks
- **Pain**: Clients want to "see" the aesthetic before approving
- **Pain**: Can't afford full Adobe Suite or dedicated designers

#### 2. Small Brand Owners / Solopreneurs
- **Pain**: Instagram feed looks inconsistent and unprofessional
- **Pain**: Know aesthetic matters but lack design skills
- **Pain**: Can't justify hiring an agency for €500+/month

#### 3. Content Creators / Influencers
- **Pain**: Need cohesive feed to attract brand deals
- **Pain**: Brands judge them by their grid aesthetic in 5 seconds
- **Pain**: Spending hours on Canva for each post

#### 4. Marketing Agencies (Growth Opportunity)
- **Pain**: White-labeling mockups for multiple clients is manual work
- **Pain**: Client presentation decks need fast turnaround
- **Pain**: Junior staff lack design chops for pitch visuals

---

### Ad Angles That Work

#### Angle 1: Time-Saving (Efficiency)
**Hook:** "5 hours of mockup work → 30 seconds with AI"  
**Body:** Social media managers waste entire afternoons creating client presentations. Now you upload a logo, pick a vibe, and get 12 on-brand mockups instantly.  
**CTA:** "Try it free—no credit card"

#### Angle 2: Zero Design Skills Required (Democratization)
**Hook:** "No Photoshop. No Canva struggles. Just your logo + AI."  
**Body:** You shouldn't need a design degree to make your brand look aesthetic. Upload your logo, choose your vibe (minimal, luxury, bold), and get Instagram-ready mockups in seconds.  
**CTA:** "See your brand aesthetic now"

#### Angle 3: Client-Winning Tool (For Freelancers/Agencies)
**Hook:** "Close more clients by showing them their aesthetic before they sign"  
**Body:** Freelance SMM Sarah used to pitch with boring PDFs. Now she shows prospects their Instagram feed, fully mocked up with their logo. She closed 3/5 pitches last month.  
**CTA:** "Win your next pitch"

#### Angle 4: Aesthetic = Algorithm (Trend-Jacking)
**Hook:** "Instagram's 2025 grid update killed your feed. Fix it in 60 seconds."  
**Body:** The new 3:4 ratio broke everyone's carefully curated grids. Our AI instantly adapts your mockups to the new format—stay aesthetic without the headache.  
**CTA:** "Update my feed aesthetic"

#### Angle 5: Comparison (Before/After Transformation)
**Hook:** "Left: Your current grid. Right: What it could be."  
**Visual:** Split-screen showing messy feed vs. cohesive aesthetic grid  
**Body:** Upload your logo. We'll generate 15 on-brand visuals that make your feed look like a top-tier brand.  
**CTA:** "Transform my feed"

#### Angle 6: Cost Savings (Budget-Conscious)
**Hook:** "Designer: €300/month. Our AI: €9.99/month."  
**Body:** You don't need to hire a designer or spend hours on Canva Pro. Get unlimited aesthetic mockups for less than a coffee subscription.  
**CTA:** "Start for €9.99"

#### Angle 7: Social Proof / Bandwagon
**Hook:** "1,200+ social media managers already switched to AI mockups"  
**Body:** While you're wrestling with Canva templates, your competitors are generating 50 mockups a day. Join the wave.  
**CTA:** "See why they switched"

---

### Headlines for Landing Page / Ads

#### Problem-Aware Headlines
1. "Your Instagram feed is costing you followers—fix it in 30 seconds"
2. "Stop spending 5 hours on mockups that could take 30 seconds"
3. "Why do competitor brands look so aesthetic? (Hint: AI)"

#### Solution-Aware Headlines
4. "AI that turns your logo into an aesthetic Instagram feed"
5. "Upload logo → Pick vibe → Get 15 mockups. That's it."
6. "The fastest way to create on-brand Instagram mockups"

#### Most-Aware Headlines (For Retargeting)
7. "Your aesthetic pack is ready—edit and export in 2 clicks"
8. "Create unlimited mockups for less than a designer costs per hour"
9. "Join 1,200+ creators who switched to AI mockups"

---

### Testimonial Framework

**Formula:** **[Name + Role] + Specific Pain → Specific Result + Emotion/Time Saved**

#### Example Testimonials

**Freelance Social Media Managers:**
- "I used to spend 6–8 hours creating mockups for client pitches. Now I upload their logo, pick a vibe, and have a full aesthetic feed ready in under 5 minutes. I closed 2 clients in one week because they could **see** their brand instead of imagining it." — Jess Martinez, Freelance Social Media Manager

**Small Brand Owners:**
- "I'm not a designer, so my Instagram always looked…random. I uploaded my logo, picked 'minimal,' and suddenly my feed looks like a real brand. People started asking if I hired an agency." — Emma Larsson, Jewelry Brand Founder

**Content Creators:**
- "Brands DM me way more now. A cohesive feed is literally the first thing they check. I went from 0 brand deals to 3 paid collabs in 2 months after fixing my aesthetic." — Zoe Kim, Lifestyle Influencer (12k followers)

---

### Onboarding Questions

#### Step 1: Goal/Intent
**Question:** "What are you creating?"  
**Options:**
- My own brand's content
- Client projects (I'm a freelancer/SMM)
- Influencer / creator content
- Agency / team projects
- Just exploring

#### Step 2: Platform Focus
**Question:** "Where do you post most?"  
**Options:**
- Instagram (Stories, Posts, Reels)
- Pinterest
- Both
- Other (Facebook, TikTok)

#### Step 3: Aesthetic Taste
**Question:** "Pick your vibe—which aesthetic speaks to you?"  
**Options:**
- Minimal / Clean (whites, grays, simple lines)
- Bold / High-Contrast (blacks, neons, dramatic)
- Luxury / Editorial (golds, serif fonts, elegant)
- Cozy / Lifestyle (warm tones, candid photos)
- Playful / Colorful (bright pops, fun fonts)
- Earthy / Natural (greens, browns, organic textures)

#### Step 4: Content Type
**Question:** "What do you post most?"  
**Options (multi-select):**
- Product photos / mockups
- Quotes / tips / educational
- Behind-the-scenes / lifestyle
- Fashion / beauty / style
- Food / beverage
- Services / B2B
- Other

#### Step 5: Current Pain Point
**Question:** "What's your biggest Instagram struggle right now?"  
**Options:**
- My feed looks inconsistent
- Creating mockups takes forever
- I don't have design skills
- I can't afford a designer
- I need to pitch clients with visuals
- My aesthetic doesn't match my brand

---

### Copywriting Formulas

#### 1. PAS (Problem-Agitate-Solution)
- **Problem:** "Your Instagram feed looks inconsistent."
- **Agitate:** "Potential followers judge your brand in 5 seconds. A messy grid = instant unfollow."
- **Solution:** "Upload your logo, pick your vibe, get 15 on-brand mockups. Done."

#### 2. Before-After-Bridge
- **Before:** "You spend 6 hours wrestling with Canva templates."
- **After:** "Imagine generating 20 aesthetic mockups in 2 minutes."
- **Bridge:** "That's what AI does. Upload your logo and watch."

#### 3. Feature-Advantage-Benefit (FAB)
- **Feature:** "One-click logo swap on any template"
- **Advantage:** "No manual editing or design skills needed"
- **Benefit:** "Save 5 hours/week and pitch clients faster"

#### 4. Social Proof Stacking
- "1,200+ social media managers trust this"
- "Rated 4.8/5 by freelancers"
- "Used to close $50k+ in client deals last month"

---

### Email Sequence Copy

#### Email 1: Immediate (Welcome + Quick Win)
**Subject:** "Your aesthetic pack is ready 🎨"

**Body:**
Hey [Name],

Your [Minimal/Bold/Luxury] pack is live. Here's what's inside:
- 6 Instagram post concepts
- 3 story cover templates
- 3 Pinterest pin mockups

All with your logo, ready to edit and export.

**[Click here to open your workspace →]**

Takes 2 minutes to customize your first mockup.

Cheers,
[Your Name]

#### Email 2: 4 Hours Later (Social Proof + Use Case)
**Subject:** "How Marcus closed 3 clients with AI mockups"

**Body:**
[Name],

Marcus is a freelance social media manager. He used to pitch clients with boring strategy decks.

Now? He shows them their Instagram feed—fully mocked up with their logo—before they even sign.

Result: 3 new retainers in one week.

**[See how he did it →]**
(Link to 60-second walkthrough video)

Want the same results? Your mockups are waiting.

---

### Pricing Page Copy

#### Headline
"Unlock unlimited aesthetic packs for your brand"

#### Subheadline
"You've already created [X] mockups. Keep the momentum going with a plan that fits your workflow."

#### Plan 1: Starter (€9.99/mo)
**Tagline:** "For solo creators & new brands"

**Features:**
- 50 exports/month
- 10 aesthetic pack styles
- 1 brand/logo
- Standard templates
- Email support

**Best for:** "You're building your own brand and want consistent visuals"

#### Plan 2: Pro (€29.99/mo) ⭐ Most Popular
**Tagline:** "For freelancers & growing brands"

**Features:**
- **Unlimited exports**
- All aesthetic packs
- 5 brands/logos
- No watermarks
- Priority support
- Custom color palettes

**Best for:** "You manage multiple clients or post daily"

#### Plan 3: Agency (€69.99/mo)
**Tagline:** "For agencies & power users"

**Features:**
- **Everything in Pro, plus:**
- Unlimited brands/logos
- White-label exports
- Team collaboration (5 seats)
- API access
- Dedicated account manager

**Best for:** "You're pitching clients and need fast, scalable mockup creation"

---

### Exit-Intent Popup Copy

#### Popup 1: Discount Offer
**Headline:** "Wait! Get 40% off for 3 months 🎉"

**Body:**
Most people who try this save 5+ hours/week.

Lock in your plan now:
- Starter: €5.99/mo (was €9.99)
- Pro: €17.99/mo (was €29.99)
- Agency: €41.99/mo (was €69.99)

**CTA:** "Claim my 40% off"  
**Secondary link:** "No thanks, I'll stick with free"

#### Popup 2: Free Tier Fallback
**Headline:** "No problem! Try 3 free generations on us"

**Body:**
Create 3 mockups—no credit card, no catch.

✅ Full access to all aesthetic packs  
✅ Your logo saved  
⚠️ Small watermark on exports

**CTA:** "Start my free plan"  
**Secondary:** "Or go back to pricing"

---

## 🚫 What NOT to Do

### Design Don'ts
- ❌ Don't use light backgrounds in the app (always `#191919`)
- ❌ Don't center form labels (always left-align)
- ❌ Don't add excessive decorative elements
- ❌ Don't use multiple font families (stick to Marlinsoft)
- ❌ Don't create pages that scroll when they shouldn't (use fixed heights)
- ❌ Don't add unnecessary sections or toggles (keep it minimal)

### Copy Don'ts
- ❌ Don't use jargon or technical terms unnecessarily
- ❌ Don't write long paragraphs (keep it scannable)
- ❌ Don't make claims without social proof
- ❌ Don't use generic CTAs like "Click here" (be specific)
- ❌ Don't ignore the user's pain point in messaging

---

## 📚 Reference Files

### Key Components
- `src/components/app-layout.tsx` - Main layout wrapper
- `src/components/sidebar.tsx` - Navigation sidebar
- `src/components/ui/button.tsx` - Button component
- `src/app/globals.css` - Global styles and theme

### Example Pages
- `src/app/dashboard/page.tsx` - Dashboard pattern
- `src/app/settings/page.tsx` - Settings page pattern
- `src/app/discover/page.tsx` - Content listing pattern

---

## 🎯 Quick Reference Checklist

When creating new pages/components:

- [ ] Use `#191919` background
- [ ] Center page titles with `text-center`
- [ ] Left-align form labels
- [ ] Use `space-y-8` for page sections
- [ ] Use `space-y-6` for form groups
- [ ] Use `font-marlinsoft` for headings
- [ ] Use `text-gray-400` for subtitles
- [ ] Use `border-white/10` for dividers
- [ ] Keep copy minimal and focused on user benefit
- [ ] Follow PAS or Before-After-Bridge formula for copy
- [ ] Include social proof when possible

---

**Last Updated:** [Current Date]  
**Version:** 1.0


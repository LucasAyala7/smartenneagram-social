---
title: Image prompt blueprint (Nano Banana / Flux / Midjourney)
scope: always
---

# Image Prompt Blueprint — Ultra-Realistic

Every image prompt must include ALL these axes. Shallow prompts produce shallow images.

## Required axes (in this order)

1. **Subject** — who/what is in the frame, what they're doing, their emotion
2. **Composition** — framing (close-up / medium / wide), rule of thirds, negative space
3. **Camera + Lens** — e.g., "shot on Leica Q2, 28mm f/1.7" / "Canon R5, 85mm f/1.4" / "iPhone 15 Pro Max" — pick one, commit
4. **Lighting** — direction, quality, source ("side window light, golden hour, soft bounce from left")
5. **Color palette** — 3-5 dominant tones, muted vs saturated
6. **Materials & textures** — fabric, skin, glass, paper texture (if relevant)
7. **Environment** — location, props, atmosphere
8. **Mood / aesthetic reference** — e.g., "Wes Anderson symmetry" / "A24 color grade" / "Kinfolk editorial"
9. **Exclusions (negative)** — what NOT to include (if risk exists)

## Template

```
[subject doing X with emotion], [composition framing],
shot on [camera + lens specs], [lighting — direction + quality + time of day],
[color palette — 3 tones], [materials / textures],
[environment + props], [aesthetic reference],
photorealistic, highly detailed, natural skin tones, no text, no logos.

Avoid: [list of things to exclude]
```

## Example — Model M1 for Type 4 post

❌ Weak: "Sad woman at window"

✅ Strong:
```
A woman in her late 20s sitting on a window sill, gazing out at a rainy city skyline,
expression: melancholic but composed, one hand holding a half-empty ceramic mug,
medium close-up framing her torso and the window, rule of thirds with her face
in the upper-left third;
shot on Leica Q2, 28mm f/1.7, shallow depth of field;
side window light from camera-left, overcast diffused quality, late afternoon blue hour;
muted palette: deep forest green sweater, cold gray skyline, warm amber lamp glow;
natural skin texture with subtle pore visibility, soft wool sweater fabric,
condensation on the window glass;
cozy urban apartment interior, unmade bed softly out of focus in the background,
worn leather-bound book on the windowsill;
aesthetic reference: Kinfolk magazine meets Wong Kar-wai color grading;
photorealistic, highly detailed, natural skin tones, no text, no logos, no branding.

Avoid: heavy makeup, fake-looking lighting, stock photo vibes, over-saturation,
hands with wrong number of fingers, any visible brand, text overlays.
```

## By model (quick modifiers)

- **M1 Photo + Headline**: cinematic realism, natural lighting, shallow DOF — leave visual breathing room at the bottom-left (for headline overlay)
- **M2 Torn Paper**: editorial magazine aesthetic, grainy newspaper texture, muted sepia tones — composition framed like a news photo
- **M3 Carousel cover**: bold focal subject, minimal background, high contrast — title will be overlaid
- **M5 Citation Card**: NO people/places — textured paper background, warm off-white, subtle stains, editorial typography-only aesthetic
- **M6 Split-screen**: two distinct color zones, symmetrical subjects or contrasting poses
- **M7 Celebrity**: stylized abstract portrait or SILHOUETTE (we don't render real faces to avoid likeness/rights issues) — focus on posture, silhouette, signature setting
- **M9 Data Viz**: clean minimalist chart rendering, sans-serif labels, limited palette (2-3 brand-aligned colors)

## Safety rules

- Never describe minors
- Never render identifiable celebrities (abstract/silhouette only)
- No brand logos or trademarks
- No weapons, sexualization, or graphic content
- Diverse representation default (don't always default to one ethnicity/gender without cause)

## Language

- Prompts are ALWAYS in English (Nano Banana, Flux, MJ all perform best in EN)
- Use commas, not periods, inside the prompt chain
- End with exclusions after "Avoid:"

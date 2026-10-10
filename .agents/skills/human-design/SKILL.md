---
name: human-design
description: Use whenever building or editing UI (pages, components, icons, imagery, typography, color) so the result looks hand-designed and not AI-generated or template-like.
---

# Human Design

Design rules to ensure all UI looks hand-crafted, deliberate, and free of AI templates, clichéd gradients, and generic tropes.

## Icons
- Use ONE icon library project-wide: Phosphor (`@phosphor-icons/react`, or the CDN build for plain HTML). Lucide with strokeWidth 1.5 is the fallback.
- Pick a single weight (`duotone` or `light`) and use it everywhere. Never mix libraries or weights.
- No emoji as icons or bullets.
- Never put an icon inside a rounded colored square above a card title. Use inline icons, or no icon.

## Typography
- One distinctive display font (Fraunces, Instrument Serif, Space Grotesk, Satoshi, or General Sans) plus one clean body font.
- Do not use Inter or system fonts alone.
- Define a type scale and use it consistently.

## Color and effects
- Maximum 3 colors (1 neutral, 1 primary, 1 accent), defined as CSS variables or Tailwind tokens.
- Forbidden: purple-to-blue gradients, glowing blobs, glassmorphism, neon shadows, gradient text.
- Prefer flat color, subtle borders, and generous whitespace.

## Layout and copy
- Avoid the symmetrical 3-card feature grid. Use asymmetry, varied section layouts, and real content hierarchy.
- No generic copy ("Revolutionize your workflow", "Seamless", "Unlock the power of"). Write specific, concrete text based on what the project actually does.

## Imagery
- Prefer real photos from the project's context (Cameroon, Yaoundé, actual team and product screenshots).
- Otherwise use Unsplash/Pexels with a consistent color treatment, or recolored SVG illustrations (unDraw, Open Peeps) matching the palette.
- Backgrounds and patterns: Haikei or Hero Patterns, recolored to the palette.
- Always include alt text and use lazy loading.

## Pre-delivery checklist (run on every UI task)
1. Any emoji icons? Remove them.
2. Any default AI gradients or glass effects? Remove them.
3. Is only one icon library and weight used?
4. Is there a distinctive display font?
5. Is the copy specific, not generic?
6. Is the palette limited to 3 colors?

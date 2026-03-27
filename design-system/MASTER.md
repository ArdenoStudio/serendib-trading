# Serendib Trading Design System - MASTER

## 1. Product Context
- **Product Type**: Luxury Automotive Trading & Premium Service
- **Industry**: Automotive / Luxury / Retail
- **Tone**: Professional, Exclusive, High-Performance, Heritage-driven ("Since 2010")

## 2. Global Style: "Automotive Precision & Glassmorphism"
- **Theme**: Dark Mode (Deep Obsidian)
- **Aesthetic**: Minimalist but feature-rich, using subtle glows, blur effects (glassmorphism), and gold accents.
- **Core Elements**:
  - Border Radius: 8px (Precise) or Full (Pill/Circular) for interactive elements
  - Spacing System: 8dp incremental rhythm (4, 8, 16, 24, 32, 48, 64)
  - Shadows: Subtle layered glows (Gold Bloom) instead of traditional drop shadows

## 3. Color Palette
| Token | Hex | Role | Usage |
|-------|-----|------|-------|
| `primary` | `#D4AF37` | Brand Gold | CTA, Highlights, Icons, Progress Fills |
| `surface-deep` | `#0d0b09` | Deep Obsidian | Background, Main Shell |
| `surface-mid` | `#1a1715` | Dark Clay | Cards, Secondary Backgrounds |
| `on-surface` | `#FFFFFF` | Clear White | Primary Text (95% Opacity) |
| `on-surface-subtle` | `rgba(255,255,255,0.6)` | Soft White | Secondary Text, Labels |
| `accent-gold` | `rgba(212,175,55,0.2)` | Gold Glow | Hover states, Borders, Glow effects |

## 4. Typography System
- **Heading**: Inter / Outfit (Modern Sans Serif) - Bold (700) - Tracking 0.05em
- **Tagline**: Sans Serif - Heavy (900) - Tracking 0.6em (Premium Automotive)
- **Body**: Inter - Regular (400) - Line-height 1.6
- **Label**: Bold (600) - Tracking 0.02em - Small CAPS for specific headers

## 5. Visual Effects & Animation
- **Transitions**: 250ms - 400ms for page transitions.
- **Micro-interactions**: 150ms spring-physics based curves for button presses.
- **Loader Specifics**:
  - Mechanical easing (acceleration curves).
  - Trailing glow effects.
  - Logo shimmer/glint.

## 6. Accessibility (WCAG 2.1 AA)
- Gold on Black contrast must be >= 4.5:1.
- All interactive elements must have >= 44x44pt touch area.
- Loading states must provide screen-reader notification (`status` or `alert` role).

## 7. Anti-Patterns to Avoid
- **No Emoji icons**: Use vector SVGs exclusively.
- **No instant state snaps**: Always handle state changes with transitions.
- **No mixed stroke weights**: Standardize on 1.5pt or 2pt strokes.

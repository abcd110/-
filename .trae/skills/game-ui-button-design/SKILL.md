---
name: "game-ui-button-design"
description: "Designs sci-fi game UI buttons with premium styling, gradients, and hover effects. Invoke when user needs to optimize game action buttons, create new button styles, or improve button visual hierarchy."
---

# Game UI Button Design

This skill specializes in creating high-quality, sci-fi themed game UI buttons with modern design principles.

## Design Principles

### 1. Visual Hierarchy
- Primary actions: Bright, saturated colors with strong gradients
- Secondary actions: Muted, darker tones
- Disabled states: Grayscale with reduced opacity

### 2. Color Palette (Sci-Fi Theme)
| Function | Primary | Secondary | Accent |
|----------|---------|-----------|--------|
| Exploration | #0D7377 → #14FFEC | Teal/Cyan | Neon glow |
| Rest/Recovery | #1A3A5C → #4A90E2 | Deep Blue | Soft pulse |
| Enhancement | #2D1B4E → #9D4EDD | Purple | Energy shimmer |
| Crafting | #8B4513 → #FFD700 | Gold/Orange | Sparkle |
| Decompose | #2D3748 → #6B7280 | Gray | Dissolve |
| Skills | #1A365D → #00D4FF | Cyan | Data flow |
| Character | #5D4037 → #D4A574 | Bronze | Warmth |
| Ship Status | #1E293B → #64748B | Steel | Mechanical |
| Sublimation | #4A148C → #E040FB | Magenta | Ascension |
| Shop | #1B4332 → #4ADE80 | Green | Wealth |
| Test | #7F1D1D → #FF5722 | Red/Orange | Alert |

### 3. Button Styles

#### Style A: Gradient Card (Current)
```
- Border radius: 12-16px
- Background: linear-gradient(135deg, dark 0%, light 100%)
- Shadow: 0 4px 15px rgba(0,0,0,0.3)
- Hover: scale(1.02) + enhanced shadow
```

#### Style B: Glassmorphism (Modern)
```
- Background: rgba(255,255,255,0.05)
- Backdrop-filter: blur(10px)
- Border: 1px solid rgba(255,255,255,0.1)
- Inner glow on hover
```

#### Style C: Neon Outline (Cyberpunk)
```
- Background: transparent
- Border: 2px solid color
- Box-shadow: 0 0 10px color
- Fill on hover
```

#### Style D: Minimal Icon (Clean)
```
- No background
- Icon + text only
- Color-coded icons
- Subtle hover highlight
```

### 4. Layout Patterns

#### Grid Layouts
- 4x3: Standard grid for many actions
- 3x4: Portrait orientation
- 2x6: Two columns, scrollable
- Honeycomb: Hexagonal arrangement

#### List Layouts
- Horizontal scroll: Quick access
- Vertical list: Detailed actions
- Grouped: By category with headers

### 5. Animation Guidelines
- Duration: 200-300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Hover: Scale 1.02-1.05, translateY -2px
- Active: Scale 0.98
- Disabled: Grayscale, opacity 0.5

### 6. Typography
- Font size: 12-14px
- Font weight: 500-600
- Color: White with text-shadow
- Letter-spacing: 0.5px for sci-fi feel

## Implementation Tips

1. Use CSS custom properties for theme colors
2. Implement consistent spacing (8px grid)
3. Ensure touch targets are at least 44px
4. Add loading states for async actions
5. Use semantic HTML (button element)
6. Include proper focus states for accessibility

## Common Patterns

### Primary Action Button
```jsx
<button style={{
  background: 'linear-gradient(135deg, #0D7377 0%, #14FFEC 100%)',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  transition: 'all 0.3s ease'
}} />
```

### Icon Container
```jsx
<div style={{
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.2)'
}} />
```

### Hover Effect
```jsx
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,212,255,0.3)';
}}
```

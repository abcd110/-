---
name: svg
description: Create professional, optimized SVG graphics and illustrations. Use this skill when the user asks to create icons, logos, illustrations, diagrams, charts, or any vector graphics. Generates clean, scalable SVG code with proper structure and best practices.
---

# SVG Creator

This skill guides the creation of professional, optimized SVG graphics that are clean, scalable, and follow best practices.

## When to Use

Use this skill when the user needs:
- Icons (UI icons, app icons, favicons)
- Logos and brand marks
- Illustrations and decorative graphics
- Diagrams and flowcharts
- Data visualizations (charts, graphs)
- Background patterns and textures
- Animated SVG graphics
- SVG sprites and symbol libraries

## SVG Creation Guidelines

### Core Principles

1. **Semantic Structure**: Use appropriate SVG elements (`<path>`, `<circle>`, `<rect>`, `<g>`, `<defs>`, etc.)
2. **Optimization**: Create clean code without unnecessary elements or attributes
3. **Accessibility**: Include `title`, `desc`, and `aria-label` attributes when appropriate
4. **Responsiveness**: Use `viewBox` for scaling, avoid fixed dimensions when possible
5. **Performance**: Minimize path complexity, reuse elements with `<use>` and `<symbol>`

### Best Practices

#### ViewBox and Dimensions
```svg
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <!-- Content scales to container -->
</svg>
```

#### Optimization Rules
- Use relative coordinates where possible
- Combine paths when logical
- Remove unnecessary decimal precision
- Use CSS for styling instead of inline attributes when appropriate
- Minimize transform attributes

#### Accessibility
```svg
<svg role="img" aria-label="Description">
  <title>Descriptive Title</title>
  <desc>Longer description if needed</desc>
  <!-- Content -->
</svg>
```

### Design Considerations

#### Icons (16x16 to 48x48)
- Keep simple and recognizable at small sizes
- Use consistent stroke widths
- Align to pixel grid when possible
- Fill vs stroke: choose based on context

#### Illustrations
- Layer elements with `<g>` groups
- Use gradients and patterns for depth
- Consider animation possibilities
- Optimize for file size

#### Logos
- Ensure scalability from favicon to billboard
- Use brand colors accurately
- Maintain clear space and proportions
- Create monochrome versions

### Color and Styling

- Use `currentColor` for icons to inherit text color
- Define gradients in `<defs>` section
- Consider dark/light mode variants
- Use CSS custom properties for theming

### Animation (Optional)

When animation is requested:
- Prefer CSS animations/transitions for performance
- Use SMIL for complex path animations
- Keep animations subtle and purposeful
- Respect `prefers-reduced-motion`

## Output Format

Provide SVG code that is:
- Properly formatted and indented
- Optimized for the use case
- Ready to use inline or as a file
- Compatible with modern browsers

Always include:
- XML declaration (optional but recommended)
- xmlns attribute
- viewBox attribute
- Appropriate accessibility attributes

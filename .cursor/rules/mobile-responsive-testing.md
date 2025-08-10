# Mobile Responsive Testing

## Coverage Requirements

All new components and form steps must be tested across multiple device breakpoints:

### Required Breakpoints
- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px  
- **Mobile Large**: 481px - 767px
- **Mobile Medium**: 421px - 480px
- **Mobile Small**: 320px - 420px

### CSS Overflow Prevention Patterns

When implementing responsive designs, follow these patterns to prevent overflow:

```css
/* Container constraints */
.container {
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  overflow: hidden;
}

/* Mobile breakpoints */
@media (max-width: 767px) {
  .container {
    max-width: 100vw !important;
    padding: var(--spacing-sm);
  }
}

@media (max-width: 420px) {
  .container {
    padding: var(--spacing-xs);
  }
}
```

### Testing Checklist

Before committing mobile-responsive changes:
1. Test on iPhone 14 Pro Max (430px width)
2. Test on Pixel 7 (412px width) 
3. Test on Samsung Galaxy S8+ (360px width)
4. Test on iPhone SE (375px width)
5. Verify no horizontal scrollbars appear
6. Confirm text remains readable and not truncated
7. Check that interactive elements remain accessible

### Common Issues to Avoid

- **Grid overflow**: Use `grid-template-columns: repeat(auto-fit, minmax(80px, 1fr))` for flexible layouts
- **Text truncation**: Remove `text-overflow: ellipsis` and `white-space: nowrap` on mobile
- **Fixed widths**: Use `min-width: 0` and `max-width: 100%` for flexible elements
- **Padding issues**: Reduce padding on smaller screens with `!important` overrides when needed

### Implementation Rules

1. Always use `box-sizing: border-box` for consistent sizing
2. Apply `max-width: 100vw` to prevent viewport overflow
3. Use `overflow: hidden` on containers to prevent content spillover
4. Test with actual device dimensions, not just browser resizing
5. Document any device-specific workarounds in component comments

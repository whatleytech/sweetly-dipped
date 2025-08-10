# Iterative Problem-Solving

## Edge Case Discovery and Documentation

When user feedback reveals unexpected behavior, document and test the edge cases discovered:

### Common Edge Cases to Document

#### Form Input Behavior
- **Radio button unselect**: Native HTML radio buttons don't trigger `onChange` when clicking already selected option
  ```typescript
  // Solution: Add onClick handler alongside onChange
  <input
    type="radio"
    onChange={() => handleSelect(key, value)}
    onClick={() => handleSelect(key, value)} // Required for unselect
  />
  ```

#### Date and Time Validation
- **Past date prevention**: Prevent selection of today's date and past dates
- **Unavailable periods**: Handle both date ranges and single-day unavailability
- **Rush order detection**: Identify orders within 2-week notice period
- **Timezone safety**: Use `toISOString().split('T')[0]` for consistent date formatting

#### Mobile Responsiveness
- **CSS overflow**: Prevent horizontal scrolling with `max-width: 100vw` and `overflow: hidden`
- **Text truncation**: Remove `text-overflow: ellipsis` on mobile for readability
- **Grid layout**: Use flexible `grid-template-columns` for responsive grids

#### State Management
- **localStorage persistence**: Handle data migration when interface changes
- **Conditional rendering**: Track visible vs. total step indices for progress calculation

### Documentation Pattern

For each edge case discovered, document:

```typescript
/**
 * EDGE CASE: Radio button unselect behavior
 * 
 * Problem: Native HTML radio buttons don't trigger onChange when clicking
 * already selected option, preventing unselect functionality.
 * 
 * Solution: Add onClick handler alongside onChange to capture all clicks.
 * 
 * Test: Verify clicking selected radio button sets value to 0 (unselected).
 */
```

### Testing Edge Cases

Create specific test cases for discovered edge cases:

```typescript
describe("Edge Cases", () => {
  it("unselects when clicking on already selected option", () => {
    // Test implementation
  });
  
  it("prevents selection of past dates", () => {
    // Test implementation
  });
  
  it("handles single-day unavailability", () => {
    // Test implementation
  });
});
```

### Implementation Rules

1. **Document immediately**: When user reports unexpected behavior, document the edge case
2. **Test thoroughly**: Create specific tests for edge cases to prevent regression
3. **Consider alternatives**: Explore multiple solutions before implementing
4. **User feedback loop**: Test solutions with user to ensure they work as expected
5. **Update documentation**: Keep edge case documentation current with code changes

### Common Patterns

#### Form Validation Edge Cases
- Empty string handling
- Invalid format detection
- Cross-field validation
- Async validation timing

#### UI Interaction Edge Cases
- Double-click prevention
- Keyboard navigation
- Screen reader compatibility
- Touch vs. mouse interactions

#### Data Persistence Edge Cases
- Corrupted data recovery
- Missing property handling
- Version migration
- Storage quota exceeded

### Best Practices

1. **Root cause analysis**: Don't just patch symptoms, understand why the edge case occurs
2. **Defensive programming**: Handle edge cases gracefully with clear error messages
3. **User experience**: Ensure edge case handling doesn't degrade normal user flow
4. **Testing strategy**: Use both unit tests and integration tests for edge cases
5. **Documentation**: Keep edge case documentation in sync with code implementation

# Remove Duplicate Content in Component Size Rule

**Priority:** Medium  
**Type:** Content Cleanup  
**Estimated Effort:** 15 minutes

## Problem

The `component-size.mdc` rule contains duplicated content that makes it confusing and harder to maintain:

- Lines 7-11 are repeated at lines 32-35
- The same component guidelines appear twice with slightly different wording
- This creates maintenance burden and potential inconsistencies

## Current State

### Duplicated Content (lines 7-11):
```markdown
- A React component should:
  • Have ≤ 250 LOC (including types and styles).  
  • Receive **typed props** and export those props for reuse (`export type { FooProps }`).  
  • Contain no more than one `useEffect` (split into custom hooks when logic grows).  
  • Extract reusable logic into `src/hooks/` and pure helpers into `src/utils/`.
```

### Duplicated Content (lines 32-35):
```markdown
  • Receive **typed props** and export those props for reuse (`export type { FooProps }`).  
  • Contain no more than one `useEffect` (split into custom hooks when logic grows).  
  • Extract reusable logic into `src/hooks/` and pure helpers into `src/utils/`.
- A function should do ONE thing; if it's > 40 LOC or has nested conditionals, break it up.
```

## Solution

Clean up the `component-size.mdc` file by:

1. **Remove duplicate lines** (lines 32-35)
2. **Consolidate component guidelines** into a single, clear section
3. **Improve clarity** of the 250 LOC limit with examples
4. **Maintain all unique content** from both sections

## Implementation Steps

1. **Checkout new branch:**
   ```bash
   git checkout -b rules/remove-duplicate-content-component-size
   ```

2. **Read the current file:**
   ```bash
   cat .cursor/rules/component-size.mdc
   ```

3. **Identify unique content** in each duplicated section

4. **Create cleaned version** with:
   - Single component guidelines section
   - Clear LOC examples (imports, types, styles, JSX)
   - All unique utility extraction patterns
   - All unique CSS modularization guidelines

5. **Replace the file** with the cleaned version

6. **Verify content** is complete and clear

## Expected Outcome

- Single, clear component size guidelines
- No duplicated content
- Better maintainability
- Clearer LOC counting examples

## Files to Modify

- `.cursor/rules/component-size.mdc` (edit)

## Validation

After implementation, verify:
- [ ] No duplicate content remains
- [ ] All unique guidelines are preserved
- [ ] LOC limit is clearly explained with examples
- [ ] File is easier to read and maintain
- [ ] All component architecture guidelines are present
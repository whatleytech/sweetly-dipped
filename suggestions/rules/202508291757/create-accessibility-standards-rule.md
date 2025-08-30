# Create Accessibility Standards Rule

**Priority:** High  
**Type:** New Rule Creation  
**Estimated Effort:** 60 minutes
**Status:** ✅ COMPLETED

## Problem

The current Cursor rules lack comprehensive accessibility standards, which is critical for a public-facing web application. This gap leads to:

- Inconsistent ARIA implementation
- Missing keyboard navigation patterns
- No screen reader testing requirements
- Lack of accessibility testing standards
- Inconsistent focus management

## Current State

- No accessibility-specific rules exist
- Form validation patterns mention ARIA but don't enforce it
- No keyboard navigation guidelines
- No screen reader testing requirements
- No focus management patterns

## Solution

Create a new `accessibility-standards.mdc` rule that covers:

1. **ARIA Implementation Patterns**
2. **Keyboard Navigation Standards**
3. **Screen Reader Testing Requirements**
4. **Focus Management Patterns**
5. **Accessibility Testing Standards**
6. **Color Contrast Requirements**

## Implementation Steps

1. **Checkout new branch:**
   ```bash
   git checkout -b rules/create-accessibility-standards-rule
   ```

2. **Create new rule file:**
   ```bash
   touch .cursor/rules/accessibility-standards.mdc
   ```

3. **Define ARIA implementation patterns:**
   - Required ARIA attributes for common components
   - ARIA live regions for dynamic content
   - ARIA labels and descriptions
   - ARIA roles and states

4. **Add keyboard navigation standards:**
   - Tab order requirements
   - Keyboard shortcuts
   - Focus trap patterns
   - Skip links

5. **Include screen reader testing:**
   - Required testing tools
   - Testing scenarios
   - Screen reader compatibility
   - Voice-over testing

6. **Add focus management patterns:**
   - Focus restoration
   - Focus indicators
   - Focus trap implementation
   - Focus management in modals

7. **Include accessibility testing standards:**
   - Automated testing tools
   - Manual testing requirements
   - Accessibility audit checklist
   - WCAG compliance levels

## Rule Content Structure

```markdown
---
description: Enforce accessibility standards including ARIA, keyboard navigation, and screen reader compatibility
globs: ["src/**/*.{tsx,ts}", "**/*.test.{ts,tsx}"]
alwaysApply: true
---

# Accessibility Standards

## ARIA Implementation
- Required ARIA attributes for interactive elements
- ARIA live regions for dynamic content
- Proper ARIA labels and descriptions
- ARIA roles and states

## Keyboard Navigation
- Tab order requirements
- Keyboard shortcuts
- Focus trap patterns
- Skip links for main content

## Screen Reader Testing
- Required testing tools (axe-core, jest-axe)
- Testing scenarios for common interactions
- Screen reader compatibility requirements
- Voice-over testing on macOS

## Focus Management
- Focus restoration patterns
- Focus indicators
- Focus trap implementation
- Focus management in modals and overlays

## Testing Requirements
- Automated accessibility testing
- Manual testing checklist
- WCAG 2.1 AA compliance
- Accessibility audit requirements
```

## Expected Outcome

- Consistent accessibility implementation across the project
- Better user experience for users with disabilities
- WCAG 2.1 AA compliance
- Comprehensive accessibility testing
- Clear accessibility patterns for developers

## Files to Create

- `.cursor/rules/accessibility-standards.mdc` (create)

## Validation

After implementation, verify:
- [ ] Rule covers all accessibility aspects
- [ ] ARIA patterns are comprehensive
- [ ] Keyboard navigation is well-defined
- [ ] Screen reader testing is required
- [ ] Focus management patterns are clear
- [ ] Testing standards are comprehensive
- [ ] Rule integrates with existing testing rules
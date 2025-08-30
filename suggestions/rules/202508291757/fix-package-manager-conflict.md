# Fix Package Manager Conflict

**Priority:** High  
**Type:** Rule Consolidation  
**Estimated Effort:** 30 minutes
**Status:** ✅ COMPLETED

## Problem

There are conflicting package manager rules in the Cursor configuration:

- `package-preferences.mdc` mentions using `pnpm add pkg@latest` 
- `package-manager.mdc` enforces Yarn usage exclusively

This creates confusion and potential errors when adding dependencies.

## Current State

### package-preferences.mdc
```markdown
- Every new dependency must be added with `pnpm add pkg@latest` and properly typed (use `@types/*` if needed).
```

### package-manager.mdc
```markdown
- Use Yarn commands, never `npm` or `pnpm`:
  • Install: `yarn add` / `yarn add -D`  
  • Remove: `yarn remove`  
  • Upgrade: `yarn up <pkg>@latest`
```

## Solution

Consolidate both rules into a single `dependency-management.mdc` file that:

1. **Detects package manager** by checking for `yarn.lock` or `.yarnrc.yml` at repo root
2. **Uses consistent commands** based on detected package manager
3. **Includes package preferences** (battle-tested libraries, health evaluation)
4. **Maintains type safety** requirements

## Implementation Steps

1. **Checkout new branch:**
   ```bash
   git checkout -b rules/fix-package-manager-conflict
   ```

2. **Create new consolidated rule:**
   ```bash
   # Create new file
   touch .cursor/rules/dependency-management.mdc
   ```

3. **Merge content from both files:**
   - Package manager detection logic from `package-manager.mdc`
   - Library preferences and health evaluation from `package-preferences.mdc`
   - Consistent command structure based on detected manager

4. **Remove conflicting files:**
   ```bash
   rm .cursor/rules/package-preferences.mdc
   rm .cursor/rules/package-manager.mdc
   ```

5. **Test the new rule** by adding a dependency to ensure it works correctly

## Expected Outcome

- Single source of truth for dependency management
- Consistent commands regardless of package manager
- Clear library selection criteria
- No more conflicting instructions

## Files to Modify

- `.cursor/rules/package-preferences.mdc` (delete)
- `.cursor/rules/package-manager.mdc` (delete)
- `.cursor/rules/dependency-management.mdc` (create)

## Validation

After implementation, verify:
- [ ] New rule detects package manager correctly
- [ ] Commands are consistent with detected manager
- [ ] Library preferences are preserved
- [ ] Type safety requirements are maintained
- [ ] No conflicting instructions remain
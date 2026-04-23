---
name: verify
description: Run full verification suite (typecheck, lint, test) to ensure code quality before committing
---

Run the full verification suite in the correct order:

1. **Typecheck**: `npm run typecheck`
2. **Lint**: `npm run lint`
3. **Test**: `npm run test`

If any step fails, stop and report the issue. Do not proceed to the next step until the current one passes.

Report a summary at the end with:

- ✅ or ❌ for each step
- Total time taken
- Any errors or warnings that need attention

# Security Policy

## Supported Version

Only the latest published version is supported.

## Reporting a Vulnerability

If you discover a security issue:

1. Prefer GitHub private vulnerability reporting if it is available for this repository.
2. If private reporting is unavailable, contact the maintainer through GitHub before opening a public issue.
3. Only use a public issue when the report is low risk and does not expose users to harm.

Please include:

- a short description of the issue
- steps to reproduce
- impact and affected surface
- any mitigation ideas you already validated

## Security Notes

Bookmarks Manager is a client-side application:

- bookmark data stays in the browser unless the user explicitly sends data to an AI provider
- API keys are stored locally in IndexedDB
- there is no project backend, account system, or server-side storage

When AI features are enabled, the selected provider may receive bookmark content according to the user’s configuration. Review the provider’s privacy policy before enabling AI features.

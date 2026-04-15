# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Bookmarks Manager seriously. If you believe you've found a security vulnerability, please follow these steps:

### Please DO NOT:

- Open a public issue describing the vulnerability
- Submit a pull request with the fix before discussing with maintainers
- Share the vulnerability details publicly

### Please DO:

1. **Email the maintainers directly** at [security@example.com] (replace with actual contact)
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (if you have them)

### What to Expect

- **Acknowledgment** within 48 hours
- **Initial assessment** within 1 week
- **Regular updates** on our progress
- **Credit** when the issue is resolved (if you wish)

## Security Considerations

This project is a client-side only application. Your bookmarks:
- Never leave your browser
- Are stored in browser's IndexedDB
- Are not uploaded to any server

However, if you use AI features:
- Your API key is stored locally
- Bookmark data may be sent to AI providers (based on your settings)
- Please review your AI provider's privacy policy

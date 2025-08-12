# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Please ensure you are using the latest version.

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Fully supported |
| < 1.0   | ❌ Not supported   |

## Reporting a Vulnerability

If you discover a security vulnerability, please do the following:

1. Email: khelendra.guptarauniyar@gmail.com
2. Use the subject line: SECURITY: <short description>
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a timeline for the fix.

## Handling Process

1. Triage and validation
2. Severity classification (Low / Medium / High / Critical)
3. Patch development
4. Coordinated release
5. Public disclosure (after fix)

## Best Practices for Users

- Always update to the latest release
- Do not expose the admin endpoints publicly
- Use HTTPS in production
- Rotate API keys regularly
- Limit file upload size and types

## Security Hardening Checklist

- [ ] HTTPS enforced
- [ ] Environment secrets not committed
- [ ] JWT secrets strong and rotated
- [ ] Input validation implemented
- [ ] Rate limiting enabled
- [ ] File upload validation
- [ ] Dependency scanning performed
- [ ] Regular backups configured

## Hall of Fame

We appreciate responsible disclosure. Security researchers who report valid vulnerabilities may be acknowledged here (with permission).

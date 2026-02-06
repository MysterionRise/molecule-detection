# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email security concerns to the project maintainers
3. Include detailed information about the vulnerability:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Resolution Timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Within 60 days

### After Reporting

1. We will investigate and validate the issue
2. We will work on a fix and coordinate disclosure
3. You will be credited in the security advisory (if desired)
4. A CVE may be requested for significant vulnerabilities

## Security Measures

### Code Security

- **Static Analysis**: Bandit SAST scanning for Python code
- **Dependency Scanning**: pip-audit (Python), pnpm audit (Node.js)
- **Secret Detection**: detect-secrets pre-commit hook
- **Type Safety**: MyPy strict mode, TypeScript strict mode

### Container Security

- **Non-root User**: Backend container runs as unprivileged user
- **Image Scanning**: Trivy vulnerability scanner in CI
- **Minimal Base Images**: python:3.11-slim, node:20-slim

### CI/CD Security

- **Automated Scans**: Weekly security scans via GitHub Actions
- **Dependency Updates**: Dependabot configured for all ecosystems
- **Branch Protection**: Required checks before merging

### Application Security

- **CORS Configuration**: Strict origin validation
- **Input Validation**: Pydantic v2 with strict type coercion
- **Error Handling**: No sensitive information in error responses
- **Correlation IDs**: Request tracing without exposing internals

## Security Best Practices for Contributors

1. **Never commit secrets**
   - Use environment variables
   - Check `.gitignore` for sensitive files
   - Use detect-secrets pre-commit hook

2. **Validate all inputs**
   - Use Pydantic models for API inputs
   - Use Zod schemas for frontend forms
   - Sanitize file uploads

3. **Keep dependencies updated**
   - Review Dependabot PRs promptly
   - Check security advisories

4. **Follow least privilege**
   - Minimal permissions in Docker
   - Scoped API keys and tokens

## Known Security Considerations

### Phase 1 (Current)

- Image upload endpoint accepts files up to 10MB
- No authentication/authorization (demo phase)
- CORS allows localhost origins only

### Future Phases

- Add authentication (JWT/OAuth)
- Implement rate limiting
- Add audit logging
- Enable HTTPS in production

## Security Tools

### Running Security Scans Locally

```bash
# Python SAST
cd backend
bandit -c pyproject.toml -r app

# Python dependency audit
pip-audit

# Node.js audit
cd frontend
pnpm audit

# Secret detection
detect-secrets scan
```

### Updating Security Baseline

```bash
# Regenerate secrets baseline after addressing false positives
detect-secrets scan --baseline .secrets.baseline
```

## Acknowledgments

We appreciate the security research community's efforts to improve software security. Responsible disclosure helps us protect our users.

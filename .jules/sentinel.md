## 2024-05-15 - [CRITICAL] Hardcoded Firebase Credentials in Source Code
**Vulnerability:** Firebase API Key and configuration details were hardcoded directly in `splitm-v2/src/core/config/firebase.ts` as fallback values.
**Learning:** Hardcoding API keys and configuration in frontend source code exposes them to anyone who accesses the client application. They should only be loaded from environment variables and configured correctly on deployment.
**Prevention:** Always rely strictly on `import.meta.env` (or similar environment variable injecters) with empty string or securely handled fallbacks. Add automated checks (like `trufflehog` or similar secret scanning) in CI/CD to prevent hardcoded secrets from being merged.

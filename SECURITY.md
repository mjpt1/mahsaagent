# Security notes

## HTTP MCP (`serve-http`)

- Prefer binding to `127.0.0.1`.
- Non-loopback binds **require** `MAHSAAGENT_TOKEN` unless you explicitly set `MAHSAAGENT_ALLOW_INSECURE=1`.
- Always set a token before exposing the server through a tunnel.
- Optional: `MAHSAAGENT_REQUIRE_AUTH=1` forces a token even on loopback.
- Optional: `MAHSAAGENT_CORS_ORIGIN` (default `*` only when a token is set).
- Optional: `MAHSAAGENT_HTTP_MAX_INFLIGHT` limits concurrent MCP requests (default `16`).

## Reporting issues

Open a GitHub issue for security-sensitive bugs. Do not publish exploit PoCs against third-party systems.

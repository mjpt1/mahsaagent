# اتصال به کلاینت‌های مختلف

Mahsaagent یک **سرور ابزار استاندارد MCP** است. با هر کلاینتی که stdio یا Streamable HTTP را پشتیبانی کند کار می‌کند — محدود به یک ادیتور نیست.

بعد از `npm install && npm run build` یکی از روش‌های زیر را انتخاب کن.

---

## ۱) Cursor

فایل تنظیمات MCP (مثلاً `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "mahsaagent": {
      "command": "node",
      "args": ["ABS_PATH/mahsaagent/dist/index.js"]
    }
  }
}
```

نمونه: [`config/mcp.local.example.json`](../config/mcp.local.example.json)

---

## ۲) Claude Desktop

فایل تنظیمات دسکتاپ (ویندوز معمولاً):

`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mahsaagent": {
      "command": "node",
      "args": ["ABS_PATH/mahsaagent/dist/index.js"]
    }
  }
}
```

نمونه کامل: [`config/claude_desktop.example.json`](../config/claude_desktop.example.json)

اپ را یک‌بار کامل ببند و دوباره باز کن تا ابزارها لود شوند.

---

## ۳) ChatGPT (دسکتاپ / Codex) — stdio محلی

ChatGPT Desktop و Codex از `~/.codex/config.toml` استفاده می‌کنند:

```toml
[mcp_servers.mahsaagent]
command = "node"
args = ["ABS_PATH/mahsaagent/dist/index.js"]
```

نمونه: [`config/codex.config.example.toml`](../config/codex.config.example.toml)

در اپ: Settings → MCP servers → Add server → STDIO، یا همان `config.toml` را ویرایش کن، بعد Restart.

---

## ۴) ChatGPT (وب / Custom connector) — HTTP

وب ChatGPT فقط **endpoint عمومی HTTPS** را می‌پذیرد (stdio محلی را مستقیم نمی‌تواند اجرا کند).

### الف) سرور HTTP محلی

```bash
npx mahsaagent serve-http --port 3847
# یا با توکن:
# set MAHSAAGENT_TOKEN=secret
# npx mahsaagent serve-http --port 3847
```

آدرس محلی: `http://127.0.0.1:3847/mcp`

### ب) تونل HTTPS (برای connector وب)

با cloudflared / ngrok / مشابه، پورت را عمومی کن، مثلاً:

`https://YOUR-TUNNEL.example/mcp`

سپس در ChatGPT: Settings → Connectors → Developer mode → Add custom connector → همان URL.

اگر `MAHSAAGENT_TOKEN` گذاشتی، در connector همان مقدار را به‌عنوان Bearer بفرست.

---

## مسیرها

| حالت | دستور | مناسب برای |
|------|--------|------------|
| stdio | `mahsaagent` / `mahsaagent serve` | Cursor، Claude Desktop، Codex/ChatGPT Desktop |
| HTTP | `mahsaagent serve-http` | Connector وب، تونل، کلاینت‌های remote |

`ABS_PATH` را با مسیر واقعی کلون عوض کن (در ویندوز مثل `C:/Users/.../mahsaagent`).

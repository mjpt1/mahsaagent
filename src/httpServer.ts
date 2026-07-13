import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.js";

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => {
      if (!chunks.length) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function unauthorized(res: ServerResponse) {
  res.writeHead(401, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "unauthorized" }));
}

function checkAuth(req: IncomingMessage, token?: string): boolean {
  if (!token) return true;
  const header = req.headers.authorization ?? "";
  if (header === `Bearer ${token}`) return true;
  const alt = req.headers["x-mahsaagent-token"];
  return alt === token;
}

/**
 * Streamable HTTP MCP endpoint for clients that speak remote MCP
 * (ChatGPT connectors / Codex HTTP, tunnels, etc.).
 */
export async function startHttpMcpServer(opts: {
  host?: string;
  port?: number;
  token?: string;
} = {}) {
  const host = opts.host ?? process.env.MAHSAAGENT_HOST ?? "127.0.0.1";
  const port = opts.port ?? Number(process.env.MAHSAAGENT_PORT ?? 3847);
  const token = opts.token ?? process.env.MAHSAAGENT_TOKEN;

  const http = createHttpServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${host}:${port}`);

    // CORS for browser-based connectors / local tooling
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, x-mahsaagent-token, mcp-session-id");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, name: "mahsaagent", transport: "streamable-http" }));
      return;
    }

    if (url.pathname !== "/mcp") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "not_found", hint: "POST/GET /mcp" }));
      return;
    }

    if (!checkAuth(req, token)) {
      unauthorized(res);
      return;
    }

    const mcp = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    try {
      await mcp.connect(transport);
      const body = req.method === "POST" ? await readJsonBody(req) : undefined;
      await transport.handleRequest(req, res, body);
    } catch (err) {
      console.error("[mahsaagent http]", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32603, message: "Internal server error" },
            id: null,
          })
        );
      }
    } finally {
      res.on("close", () => {
        void transport.close();
        void mcp.close();
      });
    }
  });

  await new Promise<void>((resolve, reject) => {
    http.listen(port, host, () => resolve());
    http.on("error", reject);
  });

  const base = `http://${host}:${port}`;
  console.error(`Mahsaagent HTTP tools server listening on ${base}/mcp`);
  if (token) console.error("Bearer token auth enabled (MAHSAAGENT_TOKEN)");
  console.error(`Health: ${base}/health`);

  return http;
}

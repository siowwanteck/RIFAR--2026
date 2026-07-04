import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { confirmRecommendedAction, getApiPayload } from "./services/mockApi.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const publicDir = join(root, "public");
const sourceDir = join(root, "src");
const port = Number(process.env.PORT ?? 4173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
  });
  response.end(JSON.stringify(payload, null, 2));
}

async function serveFile(baseDir, pathname, response) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(baseDir, requested));

  if (!filePath.startsWith(baseDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, { "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

async function serveStatic(pathname, response) {
  if (pathname.startsWith("/src/")) {
    await serveFile(sourceDir, pathname.replace(/^\/src/, ""), response);
    return;
  }

  await serveFile(publicDir, pathname, response);
}

async function handleRequest(request, response) {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
    });
    response.end();
    return;
  }

  if (request.method === "POST" && url.pathname.startsWith("/api/flood/actions/") && url.pathname.endsWith("/confirm")) {
    const actionId = url.pathname.split("/").at(-2);
    const result = confirmRecommendedAction(actionId);
    sendJson(response, 200, result);
    return;
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/flood/")) {
    const payload = getApiPayload(url.pathname);
    if (!payload) {
      sendJson(response, 404, { error: "Unknown FIaaS API endpoint" });
      return;
    }
    sendJson(response, 200, payload);
    return;
  }

  if (request.method === "GET") {
    await serveStatic(url.pathname, response);
    return;
  }

  sendJson(response, 405, { error: "Method not allowed" });
}

export function createFiassServer() {
  return createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      sendJson(response, 500, { error: error.message });
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createFiassServer().listen(port, () => {
    console.log(`FIaaS MVP running at http://localhost:${port}`);
  });
}

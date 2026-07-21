import * as http from "http";
import { AspSpec } from "./types";
import { generateServerCode } from "./generators/generateServer";
import { generateListing } from "./generators/generateListing";
import { generatePrompts } from "./generators/generatePrompts";
import { generateDemoScript } from "./generators/generateDemoScript";

// This turns ASPad from a local CLI into a real A2MCP service.
// Any agent can send an idea as JSON and get a full ASP scaffold
// back in the response, no local install needed on their end.
//
// Price: 1 USDT per call, same placeholder pattern as every ASP
// ASPad itself generates. Plug in the real OKX Payment SDK where
// marked before you go live with real money.

const PRICE_USDT = 1;

async function checkPayment(req: http.IncomingMessage): Promise<boolean> {
  // TODO: replace with a real check against the OKX Payment SDK.
  // See https://web3.okx.com/onchainos/dev-docs/okxai/howtomcp
  //
  // ASPAD_DEV=true skips this check so you can test locally.
  // Never set that in a real deployment, it means free service
  // for anyone who calls it.
  if (process.env.ASPAD_DEV === "true") {
    return true;
  }
  return false;
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function isValidSpec(spec: any): spec is AspSpec {
  return (
    spec &&
    typeof spec.name === "string" &&
    typeof spec.tagline === "string" &&
    typeof spec.description === "string" &&
    typeof spec.category === "string" &&
    (spec.serviceType === "A2MCP" || spec.serviceType === "A2A") &&
    (spec.pricingModel === "free" || spec.pricingModel === "paid") &&
    typeof spec.endpointPath === "string" &&
    typeof spec.inputDescription === "string" &&
    typeof spec.outputDescription === "string"
  );
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ status: "ok", name: "ASPad", price: PRICE_USDT }));
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!DOCTYPE html>
<html>
<head><title>ASPad</title>
<style>body{font-family:sans-serif;max-width:600px;margin:80px auto;padding:20px;background:#0a0908;color:#F5F1EA;}
h1{color:#C9A86A;}code{background:#1a1a1a;padding:4px 8px;border-radius:4px;color:#C9A86A;}
.badge{background:#1a1a1a;border:1px solid #C9A86A;border-radius:8px;padding:16px;margin:16px 0;}
</style></head>
<body>
<h1>⚡ ASPad</h1>
<p>Turn an idea into a live, compliant ASP for OKX.AI in seconds.</p>
<div class="badge">
<strong>Endpoint:</strong> <code>POST /build</code><br><br>
<strong>Price:</strong> 0.50 USDT per call (x402)<br><br>
<strong>Agent ID:</strong> #6738 on OKX.AI
</div>
<h3>How to use</h3>
<p>Send a POST request to <code>/build</code> with a spec JSON:</p>
<pre><code>{
  "name": "MyASP",
  "tagline": "One line description",
  "description": "What it does",
  "category": "Software services",
  "serviceType": "A2MCP",
  "pricingModel": "paid",
  "priceUsdt": 0.10,
  "endpointPath": "/run",
  "inputDescription": "What you send",
  "outputDescription": "What you get back"
}</code></pre>
<p>Get back: server code, marketplace listing, registration prompts, and demo script.</p>
<p style="color:#6b6058;font-size:13px;">Built for the OKX.AI Genesis Hackathon · #OKXAI</p>
</body>
</html>`);
    return;
  }

  if (req.method !== "POST" || req.url !== "/build") {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "not found, POST to /build" }));
    return;
  }

  const paid = await checkPayment(req);
  if (!paid) {
    const x402Challenge = {
      version: "1.0",
      scheme: "exact",
      network: "eip155:196",
      asset: "0x779ded0c9e1022225f8e0630b35a9b54be713736",
      amount: "500000",
      decimals: 6,
      payTo: "0x2c84b6a3af7aeab3fdd368088f5840cee338a4d7",
      description: "ASPad Build Service - " + PRICE_USDT + " USDT per call"
    };
    res.writeHead(402, {
      'Content-Type': 'application/json',
      'WWW-Authenticate': 'x402 realm="ASPad Build Service"',
      'X-Payment-Required': JSON.stringify(x402Challenge)
    });
    res.end(JSON.stringify({ error: "payment required", x402: x402Challenge }));
    return;
  }

  try {
    const body = await readBody(req);
    const spec = JSON.parse(body);

    if (!isValidSpec(spec)) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "spec is missing required fields" }));
      return;
    }

    const result = {
      name: spec.name,
      files: {
        "server.ts": generateServerCode(spec),
        "listing.md": generateListing(spec),
        "registration-prompts.md": generatePrompts(spec),
        "demo-script.md": generateDemoScript(spec),
      },
    };

    res.writeHead(200);
    res.end(JSON.stringify(result, null, 2));
  } catch (err) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "bad request, could not read spec" }));
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("ASPad service listening on port " + port);
  console.log("POST a spec to /build to generate an ASP scaffold");
});

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

  if (req.method !== "POST" || req.url !== "/build") {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "not found, POST to /build" }));
    return;
  }

  const paid = await checkPayment(req);
  if (!paid) {
    res.writeHead(402);
    res.end(JSON.stringify({ error: "payment required, " + PRICE_USDT + " USDT" }));
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

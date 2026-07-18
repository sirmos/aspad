import { AspSpec } from "../types";

// Builds the source code for a small Express server that matches the
// A2MCP shape described in the OKX.AI docs: a free endpoint that just
// returns the result, or a paid endpoint that checks payment first.
//
// The payment check is left as a clearly marked spot to plug in the
// real OKX Payment SDK. We do not guess at that SDK's exact functions
// since the public docs do not list them yet, so wiring it in is left
// to you, the builder, once you have SDK access.

export function generateServerCode(spec: AspSpec): string {
  const paymentCheck =
    spec.pricingModel === "paid"
      ? `
  // This service is paid: ${spec.priceUsdt ?? 0} USDT per call.
  // Plug in the real OKX Payment SDK / x402 check here before you
  // let the request through. Until then this is a placeholder that
  // blocks every call, so you cannot ship this endpoint by accident
  // without wiring up real payment first.
  const paid = await checkPayment(req);
  if (!paid) {
    res.status(402).json({ error: "payment required" });
    return;
  }
`
      : `
  // This service is free. No payment check needed, just return the result.
`;

  return `import express from "express";

const app = express();
app.use(express.json());

// TODO: replace this with a real payment check once you have
// access to the OKX Payment SDK. See the A2MCP docs:
// https://web3.okx.com/onchainos/dev-docs/okxai/howtomcp
async function checkPayment(req: express.Request): Promise<boolean> {
  return false;
}

// Input: ${spec.inputDescription}
// Output: ${spec.outputDescription}
app.post("${spec.endpointPath}", async (req, res) => {
${paymentCheck}
  // Your actual logic goes here. Replace this stub with the real work.
  const result = await handleRequest(req.body);
  res.json(result);
});

async function handleRequest(input: unknown): Promise<unknown> {
  // TODO: write the real logic for ${spec.name} here.
  return { status: "not implemented yet" };
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("${spec.name} listening on port " + port);
});
`;
}

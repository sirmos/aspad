import express from "express";

const app = express();
app.use(express.json());

// TODO: replace this with a real payment check once you have
// access to the OKX Payment SDK. See the A2MCP docs:
// https://web3.okx.com/onchainos/dev-docs/okxai/howtomcp
async function checkPayment(req: express.Request): Promise<boolean> {
  return false;
}

// Input: A URL or base64-encoded image, video, audio, or text content to verify.
// Output: An AI-generation likelihood score 0-100, a provenance stamp hash, confidence level, and plain English verdict.
app.post("/verify", async (req, res) => {

  // This service is paid: 0.15 USDT per call.
  // Plug in the real OKX Payment SDK / x402 check here before you
  // let the request through. Until then this is a placeholder that
  // blocks every call, so you cannot ship this endpoint by accident
  // without wiring up real payment first.
  const paid = await checkPayment(req);
  if (!paid) {
    res.status(402).json({ error: "payment required" });
    return;
  }

  // Your actual logic goes here. Replace this stub with the real work.
  const result = await handleRequest(req.body);
  res.json(result);
});

async function handleRequest(input: unknown): Promise<unknown> {
  // TODO: write the real logic for Provenance here.
  return { status: "not implemented yet" };
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Provenance listening on port " + port);
});


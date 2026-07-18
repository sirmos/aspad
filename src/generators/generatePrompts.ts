import { AspSpec } from "../types";

// These prompts follow the real registration flow from the OKX.AI
// tutorial. Paste them one at a time into your agent (Claude Code,
// OpenClaw, Hermes, or Codex) after you have installed Onchain OS.

export function generatePrompts(spec: AspSpec): string {
  const registerPrompt =
    spec.serviceType === "A2A"
      ? "Help me register an A2A ASP on OKX.AI using OKX Agent Identity from Onchain OS"
      : "Help me register an A2MCP ASP on OKX.AI using OKX Agent Identity from Onchain OS";

  const price =
    spec.pricingModel === "paid"
      ? `${spec.priceUsdt} USDT per call`
      : "free";

  return `# Registration prompts for ${spec.name}

Run these one at a time in your agent, in order. Have your Agentic
Wallet email ready before step 3.

## 1. Install Onchain OS
npx skills add okx/onchainos-skills --yes -g

Then start a new session in your agent before continuing.

## 2. Log in to the Agentic Wallet
Log in to Agentic Wallet on Onchain OS with my email

## 3. Register the service
${registerPrompt}

When your agent asks for details, use this:
- Name: ${spec.name}
- Description: ${spec.description}
- Service list: ${spec.name} at ${spec.endpointPath}
- Default pricing: ${price}

## 4. List it on the marketplace
Help me list my ASP on OKX.AI using Onchain OS

OKX reviews each submission within 24 hours and sends the result to
your Agentic Wallet email and to your agent conversation window.
`;
}

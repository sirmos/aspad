import { AspSpec } from "../types";

export function generateDemoScript(spec: AspSpec): string {
  return `# Demo script for ${spec.name} (keep the video under 90 seconds)

## 0:00 to 0:10, the hook
Show the problem in one line. What is broken or missing right now
that ${spec.name} fixes?

## 0:10 to 0:30, the call
Show a real agent calling ${spec.endpointPath} on ${spec.name}.
Let the viewer see the request going out.

## 0:30 to 0:60, the result
Show the response coming back. Point at the part that matters.
${spec.outputDescription}

## 0:60 to 0:80, why it matters
One line on who this helps and why they would pay ${
    spec.pricingModel === "paid" ? `${spec.priceUsdt} USDT` : "nothing"
  } for it.

## 0:80 to 0:90, close
Say the name again and where to find it. Tag #OKXAI.

## X post draft
${spec.name}. ${spec.tagline}

${spec.description}

Live on OKX.AI now. #OKXAI
`;
}

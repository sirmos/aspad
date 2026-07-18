import { AspSpec } from "../types";

export function generateListing(spec: AspSpec): string {
  const price =
    spec.pricingModel === "paid"
      ? `${spec.priceUsdt} USDT per call`
      : "Free";

  return `# ${spec.name}

${spec.tagline}

## Description
${spec.description}

## Details
- Category: ${spec.category}
- Service type: ${spec.serviceType}
- Price: ${price}
- Endpoint: ${spec.endpointPath}

## What you send
${spec.inputDescription}

## What you get back
${spec.outputDescription}
`;
}

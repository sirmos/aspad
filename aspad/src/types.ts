// This is the shape of the spec file a builder writes to describe their idea.
// One spec file in, a full ASP scaffold out.

export type ServiceType = "A2MCP" | "A2A";
export type PricingModel = "free" | "paid";

export interface AspSpec {
  // Short name of the ASP, shown on the marketplace.
  name: string;

  // Two beat tagline in the marketplace style, for example:
  // "One prompt, agent reads 180 chains."
  tagline: string;

  // Longer description for the listing page.
  description: string;

  // Which OKX.AI category this fits under.
  category:
    | "Finance"
    | "Software services"
    | "Lifestyle"
    | "Art creation"
    | "Others";

  // A2MCP for a fixed, pay per call service. A2A for a negotiated task.
  serviceType: ServiceType;

  pricingModel: PricingModel;

  // Price in USDT, only used when pricingModel is "paid".
  priceUsdt?: number;

  // The route your endpoint will live on, for example "/verdict".
  endpointPath: string;

  // Plain description of what the caller sends in and what they get back.
  inputDescription: string;
  outputDescription: string;
}

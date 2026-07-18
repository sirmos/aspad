# Registration prompts for ContractDoctor

Run these one at a time in your agent, in order. Have your Agentic
Wallet email ready before step 3.

## 1. Install Onchain OS
npx skills add okx/onchainos-skills --yes -g

Then start a new session in your agent before continuing.

## 2. Log in to the Agentic Wallet
Log in to Agentic Wallet on Onchain OS with my email

## 3. Register the service
Help me register an A2MCP ASP on OKX.AI using OKX Agent Identity from Onchain OS

When your agent asks for details, use this:
- Name: ContractDoctor
- Description: An agent about to sign or deploy a transaction calls ContractDoctor first. It scans the contract address or bytecode for common vulnerability patterns, checks verification status on-chain, and returns a risk score plus plain-language flags the calling agent can act on before greenlighting the transaction. Prevents autonomous agents from losing funds to malicious or vulnerable contracts.
- Service list: ContractDoctor at /scan
- Default pricing: 0.1 USDT per call

## 4. List it on the marketplace
Help me list my ASP on OKX.AI using Onchain OS

OKX reviews each submission within 24 hours and sends the result to
your Agentic Wallet email and to your agent conversation window.


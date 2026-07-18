# ContractDoctor

Pre-deployment risk scanner for autonomous agents on EVM chains.

## Description
An agent about to sign or deploy a transaction calls ContractDoctor first. It scans the contract address or bytecode for common vulnerability patterns, checks verification status on-chain, and returns a risk score plus plain-language flags the calling agent can act on before greenlighting the transaction. Prevents autonomous agents from losing funds to malicious or vulnerable contracts.

## Details
- Category: Software services
- Service type: A2MCP
- Price: 0.1 USDT per call
- Endpoint: /scan

## What you send
A contract address and chain name, or raw bytecode for pre-deployment scanning.

## What you get back
A risk score 0-100, list of vulnerability flags, a SAFE/CAUTION/REJECT recommendation, and a plain English summary.


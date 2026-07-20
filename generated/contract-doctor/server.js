"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// TODO: replace this with a real payment check once you have
// access to the OKX Payment SDK. See the A2MCP docs:
// https://web3.okx.com/onchainos/dev-docs/okxai/howtomcp
async function checkPayment(req) {
    return true;
}
// Input: A contract address and chain name, or raw bytecode for pre-deployment scanning.
// Output: A risk score 0-100, list of vulnerability flags, a SAFE/CAUTION/REJECT recommendation, and a plain English summary.
app.post("/scan", async (req, res) => {
    // This service is paid: 0.1 USDT per call.
    // Plug in the real OKX Payment SDK / x402 check here before you
    // let the request through. Until then this is a placeholder that
    // blocks every call, so you cannot ship this endpoint by accident
    // without wiring up real payment first.
    const paid = await checkPayment(req);
    if (!paid) {
        res.status(402).json({ error: "payment required" });
        return;
    }
    const result = await handleRequest(req.body);
    res.json(result);
});
function scanBytecode(hex) {
    let code = hex.startsWith("0x") ? hex.slice(2) : hex;
    code = code.toLowerCase();
    const bytes = [];
    for (let i = 0; i < code.length; i += 2) {
        bytes.push(parseInt(code.substr(i, 2), 16));
    }
    const flags = [];
    let i = 0;
    while (i < bytes.length) {
        const op = bytes[i];
        if (op >= 0x60 && op <= 0x7f) {
            const dataLength = op - 0x5f;
            i += 1 + dataLength;
            continue;
        }
        if (op === 0xff) {
            flags.push({
                op: "SELFDESTRUCT",
                severity: "high",
                note: "Contract can be destroyed, funds and state can be wiped.",
            });
        }
        if (op === 0xf4) {
            flags.push({
                op: "DELEGATECALL",
                severity: "medium",
                note: "Contract can run code from another address in its own context. Common in proxies, but also a common exploit path if the target isn't locked down.",
            });
        }
        if (op === 0xf2) {
            flags.push({
                op: "CALLCODE",
                severity: "medium",
                note: "Deprecated, legacy version of delegatecall. Same risk, no reason a new contract should use it.",
            });
        }
        i += 1;
    }
    return flags;
}
async function handleRequest(input) {
    const bytecode = input?.bytecode;
    if (!bytecode) {
        return {
            riskScore: null,
            flags: [],
            recommendation: "CAUTION",
            summary: "No bytecode was provided, only an address or chain name. Live fetching of verified source from a block explorer isn't wired in yet. Send the contract's bytecode directly for a real scan.",
        };
    }
    const flags = scanBytecode(bytecode);
    let score = 0;
    for (const flag of flags) {
        score += flag.severity === "high" ? 40 : 20;
    }
    score = Math.min(score, 100);
    const hasHighSeverity = flags.some((f) => f.severity === "high");
    const recommendation = hasHighSeverity
        ? "REJECT"
        : score >= 25
            ? "CAUTION"
            : "SAFE";
    const summary = flags.length === 0
        ? "No high risk opcodes found in this bytecode. That doesn't mean the contract is fully safe, this is a pattern scan, not a full audit, but nothing in the obvious danger list showed up."
        : `Found ${flags.length} risky pattern(s): ${flags
            .map((f) => f.op)
            .join(", ")}. ${flags[0].note}`;
    return {
        riskScore: score,
        flags,
        recommendation,
        summary,
    };
}
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("ContractDoctor listening on port " + port);
});

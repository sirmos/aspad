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
    return false;
}
// Input: Payment details including ASP name, category, amount in USDT, and agent wallet address.
// Output: Cumulative spend summary, duplicate service warnings, price benchmark against similar ASPs, and a budget status flag.
app.post("/track", async (req, res) => {
    // This service is paid: 0.05 USDT per call.
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
// In memory for now, so this resets if the service restarts. A real
// deployment would want this backed by a database instead.
const walletHistory = new Map();
const aspAverages = new Map();
const budgetStore = new Map();
async function handleRequest(input) {
    const { aspName, category, amountUsdt, walletAddress, budgetLimitUsdt } = input || {};
    if (!aspName || !category || typeof amountUsdt !== "number" || !walletAddress) {
        return { error: "aspName, category, amountUsdt, and walletAddress are required" };
    }
    if (typeof budgetLimitUsdt === "number") {
        budgetStore.set(walletAddress, budgetLimitUsdt);
    }
    // Benchmark against this ASP's average price seen so far, before
    // this call gets folded into the average.
    const priorAvg = aspAverages.get(aspName);
    let benchmark;
    if (!priorAvg || priorAvg.count === 0) {
        benchmark = "first recorded price for this ASP, no benchmark yet";
    }
    else {
        const avg = priorAvg.total / priorAvg.count;
        const diffPct = ((amountUsdt - avg) / avg) * 100;
        if (diffPct > 15) {
            benchmark = `above average (${diffPct.toFixed(1)}% higher than the ${avg.toFixed(4)} USDT average seen for ${aspName})`;
        }
        else if (diffPct < -15) {
            benchmark = `below average (${Math.abs(diffPct).toFixed(1)}% lower than the ${avg.toFixed(4)} USDT average seen for ${aspName})`;
        }
        else {
            benchmark = `in line with average (${avg.toFixed(4)} USDT average seen for ${aspName})`;
        }
    }
    const newAvg = priorAvg
        ? { total: priorAvg.total + amountUsdt, count: priorAvg.count + 1 }
        : { total: amountUsdt, count: 1 };
    aspAverages.set(aspName, newAvg);
    const history = walletHistory.get(walletAddress) || [];
    history.push({ aspName, category, amountUsdt, timestamp: Date.now() });
    walletHistory.set(walletAddress, history);
    const cumulativeSpend = history.reduce((sum, r) => sum + r.amountUsdt, 0);
    const categoryBreakdown = {};
    for (const r of history) {
        categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + r.amountUsdt;
    }
    const aspNamesInCategory = new Set(history.filter((r) => r.category === category).map((r) => r.aspName));
    const duplicateWarning = aspNamesInCategory.size > 1
        ? `paying ${aspNamesInCategory.size} different ASPs for "${category}": ${[...aspNamesInCategory].join(", ")}`
        : null;
    const budgetLimit = budgetStore.get(walletAddress);
    let budgetStatus = "no budget set";
    if (typeof budgetLimit === "number") {
        const pct = (cumulativeSpend / budgetLimit) * 100;
        budgetStatus =
            pct >= 100
                ? `OVER budget (${pct.toFixed(0)}% of ${budgetLimit} USDT)`
                : pct >= 80
                    ? `WARNING, near budget (${pct.toFixed(0)}% of ${budgetLimit} USDT)`
                    : `OK (${pct.toFixed(0)}% of ${budgetLimit} USDT)`;
    }
    return { cumulativeSpend, categoryBreakdown, duplicateWarning, benchmark, budgetStatus };
}
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Ledger listening on port " + port);
});

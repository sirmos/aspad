# ASPad

Bring an idea. Ship a live ASP.

ASPad turns a short spec file into a full scaffold for an OKX.AI
Agent Service Provider: the server code, the marketplace listing
copy, the exact prompts you paste into your agent to register it,
and a 90 second demo script for your X post.

## Two ways to use it

### As a live service (this is what you submit)
ASPad now runs as a real service, not just a CLI on your machine.
Any agent can send it a spec over HTTP and get a scaffold back.

Start it:
```
ASPAD_DEV=true npm run serve
```
(ASPAD_DEV skips the payment check so you can test locally. Never
set that in a real deployment.)

Call it:
```
curl -X POST http://localhost:3000/build \
  -H "Content-Type: application/json" \
  -d @examples/arbiter.spec.json
```
You get back JSON with the four generated files inside it, server
code, listing, registration prompts, and demo script. No install
needed on the caller's side, that is the whole point of an A2MCP
service.

To actually go live, deploy `src/server.ts` somewhere public (any
small host works, Railway, Render, Fly.io, a VPS, anything that can
run Node and expose a port), then register that public URL with
OKX.AI the same way any other ASP registers, see the registration
prompts it generates for itself as an example.

### As a CLI (for your own use while building)

1. Write a spec file describing your ASP. See `examples/arbiter.spec.json`
   for a full example.
2. Run:

```
npx ts-node --transpile-only src/index.ts build path/to/your.spec.json
```

3. Look in `generated/<your-asp-name>/` for the same four files.


## What ASPad does not do

It does not talk to OKX.AI for you. Registration still happens
through your own agent (Claude Code, OpenClaw, Hermes, or Codex)
using the Onchain OS skills, the same way it works for any ASP.
ASPad just gets you to that point fast, with the boring parts
already done, so you spend your time on the part that actually
needs to be good: your service's real logic.

It also does not wire up real payments. The payment check in
`server.ts` is a placeholder that blocks every call until you
connect the real OKX Payment SDK, so you cannot accidentally ship
an unpaid paid endpoint.

## Try it now

The repo ships with a working example: it builds Arbiter, a
dispute resolution ASP, from `examples/arbiter.spec.json`.

```
npm install
npm run example:arbiter
```

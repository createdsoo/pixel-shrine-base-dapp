# Pixel Shrine

A small lab specimen for **pixel keepsakes**. The app is intentionally narrow: one wallet-facing action, one visible outcome, one trail that a reviewer can inspect without asking for private email proof.

### Experiment note

Input: a user wants to placing a small pixel mark.  
Output: a `pixel`.  
Control surface: Base, Vercel, GitHub, Builder Wallet.

### Public coordinates

| Field | Value |
| --- | --- |
| Base Developer Dashboard | Registered |
| Build ID / Base App ID | `6a07357ba2a59fb180a8ed58` |
| Builder Wallet | `0x92b8d04dd7D932Cf789F519B080c11990B1c98E7` |
| Builder Code | `bc_e2e2z3yi` |
| Live Demo | https://pixel-shrine.vercel.app |
| GitHub Repository | https://github.com/createdsoo/pixel-shrine-base-dapp |
| Network | Base |
| Deployment | Vercel |

### Running the specimen

```bash
npm install
npm run dev
```

### Materials

Next.js UI plus wagmi/viem for wallet and Base chain behavior.

### Handling rule

Do not commit `.env`, private keys, seed phrases, RPC keys, GitHub tokens, or Vercel tokens. Use `.env.example` only for placeholders.

MIT License.

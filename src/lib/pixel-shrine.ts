import type { Address } from "viem";

export const MAX_TITLE_LENGTH = 32;
export const MAX_SYMBOL_LENGTH = 12;
export const MAX_COLOR_LENGTH = 16;
export const MAX_NOTE_LENGTH = 180;

export const pixelShrineAbi = [
  {
    type: "function",
    name: "mintCharm",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "symbol", type: "string" },
      { name: "colorA", type: "string" },
      { name: "colorB", type: "string" },
      { name: "note", type: "string" },
    ],
    outputs: [{ name: "charmId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getCharm",
    stateMutability: "view",
    inputs: [{ name: "charmId", type: "uint256" }],
    outputs: [
      { name: "keeper", type: "address" },
      { name: "title", type: "string" },
      { name: "symbol", type: "string" },
      { name: "colorA", type: "string" },
      { name: "colorB", type: "string" },
      { name: "note", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "nextCharmId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const pixelShrineContractAddress = process.env
  .NEXT_PUBLIC_PIXEL_SHRINE_CONTRACT_ADDRESS as Address | undefined;

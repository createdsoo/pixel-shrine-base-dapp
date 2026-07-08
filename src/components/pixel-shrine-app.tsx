"use client";

import { Gem, Loader2, Search, Sparkles, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  MAX_COLOR_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_SYMBOL_LENGTH,
  MAX_TITLE_LENGTH,
  pixelShrineAbi,
  pixelShrineContractAddress,
} from "@/lib/pixel-shrine";

const SYMBOLS = ["SUN", "MOON", "KEY", "STAR", "SEED"] as const;
const PALETTES = [
  ["#ff5d8f", "#ffd166", "#7bf1a8"],
  ["#70d6ff", "#ffffff", "#be95ff"],
  ["#f7b801", "#f35b04", "#2ec4b6"],
  ["#c6ff6b", "#17140f", "#ffb49a"],
] as const;

function shortAddress(address?: Address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(createdAt?: bigint) {
  if (!createdAt) return "--";
  return new Date(Number(createdAt) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PixelCharm({
  colors,
  symbol,
}: {
  colors: readonly string[];
  symbol: string;
}) {
  const cells = Array.from({ length: 64 }, (_, index) => {
    const x = index % 8;
    const y = Math.floor(index / 8);
    if (x === 0 || y === 0 || x === 7 || y === 7) return colors[1];
    if (x === y || x + y === 7) return colors[2];
    if (x >= 2 && x <= 5 && y >= 2 && y <= 5) return colors[0];
    return "#101827";
  });

  return (
    <div className="mx-auto aspect-square w-full max-w-[360px] border-4 border-[#101827] bg-[#101827] p-2 shadow-[10px_10px_0_#101827]">
      <div className="grid h-full w-full grid-cols-8 gap-1">
        {cells.map((color, index) => (
          <div key={index} style={{ backgroundColor: color }} />
        ))}
      </div>
      <div className="mt-3 border-4 border-[#101827] bg-[#f8f3df] px-3 py-2 text-center font-mono text-xl font-black">
        {symbol}
      </div>
    </div>
  );
}

export function PixelShrineApp() {
  const [charmIdInput, setCharmIdInput] = useState("1");
  const [title, setTitle] = useState("Lucky Build");
  const [symbol, setSymbol] = useState<(typeof SYMBOLS)[number]>("STAR");
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [note, setNote] = useState(
    "A tiny pixel charm for shipping with focus, luck, and a little color on Base.",
  );
  const [status, setStatus] = useState(
    "Create one pixel charm with colors, symbol, and note.",
  );
  const [walletStatus, setWalletStatus] = useState("");

  const colors = PALETTES[paletteIndex];
  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync, isPending: disconnecting } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const {
    data: hash,
    writeContract,
    isPending: writing,
    error: writeError,
  } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash });

  const availableConnectors = useMemo(
    () =>
      connectors
        .filter((item) => item.type !== "mock")
        .sort((a, b) => {
          const score = (item: (typeof connectors)[number]) => {
            if (item.id === "baseAccount" || item.name === "Base Account") {
              return 0;
            }
            if (item.type === "injected") return 1;
            return 2;
          };

          return score(a) - score(b);
        }),
    [connectors],
  );

  async function connectWallet() {
    const errors: string[] = [];
    setWalletStatus("Opening wallet...");

    for (const item of availableConnectors) {
      try {
        await connectAsync({ connector: item, chainId: base.id });
        setWalletStatus("");
        return;
      } catch (error) {
        errors.push(
          error instanceof Error
            ? `${item.name}: ${error.message}`
            : `${item.name}: connection failed`,
        );
      }
    }

    setWalletStatus(
      errors[0] ??
        "No wallet connector is available. Open this app inside Base App or install a wallet.",
    );
  }

  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
      setWalletStatus("Wallet disconnected. Tap Connect to reconnect.");
    } catch (error) {
      setWalletStatus(
        error instanceof Error ? error.message : "Could not disconnect wallet.",
      );
    }
  }
  const parsedCharmId = BigInt(Math.max(1, Number(charmIdInput || "1")));

  const charmQuery = useReadContract({
    abi: pixelShrineAbi,
    address: pixelShrineContractAddress,
    functionName: "getCharm",
    args: [parsedCharmId],
    query: {
      enabled: Boolean(pixelShrineContractAddress),
      refetchInterval: 12000,
    },
  });

  const totalQuery = useReadContract({
    abi: pixelShrineAbi,
    address: pixelShrineContractAddress,
    functionName: "nextCharmId",
    query: {
      enabled: Boolean(pixelShrineContractAddress),
      refetchInterval: 12000,
    },
  });

  const charmTuple = charmQuery.data as
    | readonly [Address, string, string, string, string, string, bigint]
    | undefined;

  const liveCharm = useMemo(
    () =>
      charmTuple
        ? {
            keeper: charmTuple[0],
            title: charmTuple[1],
            symbol: charmTuple[2],
            colorA: charmTuple[3],
            colorB: charmTuple[4],
            note: charmTuple[5],
            createdAt: charmTuple[6],
          }
        : undefined,
    [charmTuple],
  );

  const totalCharms = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const displayColors = liveCharm ? [liveCharm.colorA, liveCharm.colorB, "#7bf1a8"] : colors;
  const displayTitle = liveCharm?.title ?? title;
  const displaySymbol = liveCharm?.symbol ?? symbol;
  const displayNote = liveCharm?.note ?? note;

  const canMint =
    Boolean(pixelShrineContractAddress) &&
    isConnected &&
    chainId === base.id &&
    title.trim().length > 0 &&
    title.trim().length <= MAX_TITLE_LENGTH &&
    symbol.length <= MAX_SYMBOL_LENGTH &&
    colors[0].length <= MAX_COLOR_LENGTH &&
    colors[1].length <= MAX_COLOR_LENGTH &&
    note.trim().length > 0 &&
    note.trim().length <= MAX_NOTE_LENGTH;

  const statusText = confirmed
    ? "Pixel charm saved on Base."
    : writeError
      ? writeError.message
      : status;

  function mintCharm() {
    if (!pixelShrineContractAddress) return;
    setStatus("Confirm the pixel charm in your wallet.");
    writeContract({
      address: pixelShrineContractAddress,
      abi: pixelShrineAbi,
      functionName: "mintCharm",
      args: [title.trim(), symbol, colors[0], colors[1], note.trim()],
      chainId: base.id,
    });
  }

  return (
    <main className="min-h-screen bg-[#101827] text-[#101827]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-4 bg-[#f8f3df] px-4 py-4 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-6">
        <aside className="border-4 border-[#101827] bg-[#ffef8a] p-4 shadow-[8px_8px_0_#101827]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.2em]">
                Pixel Shrine
              </p>
              <h1 className="mt-2 text-4xl font-black leading-none">
                Mint tiny pixel wishes.
              </h1>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center border-4 border-[#101827] bg-[#7bf1a8]">
              <Gem className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="border-4 border-[#101827] bg-white p-3">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em]">
                Charms
              </p>
              <p className="mt-2 text-3xl font-black">{totalCharms}</p>
            </div>
            <div className="border-4 border-[#101827] bg-white p-3">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em]">
                Chain
              </p>
              <p className="mt-2 text-xl font-black">Base</p>
            </div>
          </div>

          <section className="mt-4 border-4 border-[#101827] bg-[#f8f3df] p-4">
            <h2 className="text-xl font-black">Make charm</h2>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em]">
                  Title
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={MAX_TITLE_LENGTH}
                  className="mt-1 w-full border-4 border-[#101827] bg-white px-3 py-3 font-black outline-none"
                />
              </label>

              <div>
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em]">
                  Symbol
                </span>
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {SYMBOLS.map((value) => (
                    <button
                      key={value}
                      className={`border-4 border-[#101827] px-1 py-2 text-[11px] font-black ${
                        value === symbol ? "bg-[#ff5d8f] text-white" : "bg-white"
                      }`}
                      onClick={() => setSymbol(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em]">
                  Palette
                </span>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {PALETTES.map((set, index) => (
                    <button
                      key={set.join("-")}
                      className={`border-4 border-[#101827] bg-white p-1 ${
                        index === paletteIndex ? "shadow-[4px_4px_0_#101827]" : ""
                      }`}
                      onClick={() => setPaletteIndex(index)}
                    >
                      <span className="grid grid-cols-3 gap-1">
                        {set.map((color) => (
                          <span key={color} className="h-8" style={{ backgroundColor: color }} />
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em]">
                  Wish note
                </span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={MAX_NOTE_LENGTH}
                  rows={4}
                  className="mt-1 w-full border-4 border-[#101827] bg-white px-3 py-3 text-sm font-bold leading-6 outline-none"
                />
              </label>
            </div>
          </section>

          <div className="mt-4 space-y-3">
            {isConnected && chainId !== base.id ? (
              <button
                className="inline-flex w-full items-center justify-center gap-2 border-4 border-[#101827] bg-[#70d6ff] px-4 py-3 font-black shadow-[4px_4px_0_#101827] disabled:opacity-60"
                disabled={switching}
                onClick={() => switchChain({ chainId: base.id })}
              >
                {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Switch to Base
              </button>
            ) : (
              <button
                className="inline-flex w-full items-center justify-center gap-2 border-4 border-[#101827] bg-[#7bf1a8] px-4 py-3 font-black shadow-[4px_4px_0_#101827] disabled:opacity-60"
                disabled={!canMint || writing || confirming}
                onClick={mintCharm}
              >
                {writing || confirming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Mint on Base
              </button>
            )}

            {isConnected ? (
              <button
                className="inline-flex w-full items-center justify-center gap-2 border-4 border-[#101827] bg-white px-4 py-3 font-black"
                onClick={disconnectWallet}
              >
                {shortAddress(address)}
              </button>
            ) : (
              <button
                className="inline-flex w-full items-center justify-center gap-2 border-4 border-[#101827] bg-[#101827] px-4 py-3 font-black text-white disabled:opacity-60"
                disabled={availableConnectors.length === 0 || connecting}
                onClick={connectWallet}
              >
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Connect wallet
              </button>
            )}

            <p className="border-4 border-[#101827] bg-white px-3 py-3 text-sm font-bold leading-6">
              {statusText}
            </p>
          </div>
        </aside>

        <section className="grid gap-4">
          <div className="border-4 border-[#101827] bg-[#be95ff] p-4 shadow-[8px_8px_0_#101827]">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
              <div className="border-4 border-[#101827] bg-white p-5">
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <PixelCharm colors={displayColors} symbol={displaySymbol} />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-black uppercase tracking-[0.22em]">
                      Live charm
                    </p>
                    <h2 className="mt-2 text-5xl font-black leading-none">
                      {displayTitle}
                    </h2>
                    <p className="mt-4 border-4 border-[#101827] bg-[#f8f3df] px-4 py-4 text-base font-bold leading-7">
                      {displayNote}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="border-4 border-[#101827] bg-[#ffef8a] p-3">
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em]">
                          Keeper
                        </p>
                        <p className="mt-2 font-black">
                          {liveCharm?.keeper ? shortAddress(liveCharm.keeper) : "--"}
                        </p>
                      </div>
                      <div className="border-4 border-[#101827] bg-[#70d6ff] p-3">
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em]">
                          Date
                        </p>
                        <p className="mt-2 font-black">
                          {formatDate(liveCharm?.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="grid gap-4">
                <div className="border-4 border-[#101827] bg-[#f8f3df] p-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    <h2 className="text-2xl font-black">Load charm</h2>
                  </div>
                  <label className="mt-4 block">
                    <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em]">
                      Charm ID
                    </span>
                    <input
                      value={charmIdInput}
                      onChange={(event) =>
                        setCharmIdInput(event.target.value.replace(/\D/g, ""))
                      }
                      className="mt-1 w-full border-4 border-[#101827] bg-white px-3 py-3 text-2xl font-black outline-none"
                    />
                  </label>
                </div>
                <div className="border-4 border-[#101827] bg-[#7bf1a8] p-4">
                  <Gem className="h-7 w-7" />
                  <h3 className="mt-3 text-xl font-black">What it does</h3>
                  <p className="mt-2 text-sm font-bold leading-6">
                    Pixel Shrine saves a small visual charm with title, symbol,
                    colors, note, keeper, and timestamp on Base.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

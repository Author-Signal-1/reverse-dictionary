"use client";
import { useEffect, useMemo, useState } from "react";

// ---- Types ----
type GameStatus = "ready" | "won" | "lost" | "playing";
function isGameStatus(v: unknown): v is GameStatus {
  return v === "ready" || v === "won" || v === "lost" || v === "playing";
}

// ---- Config ----
const MAX_ATTEMPTS = 6;
const SITE_NAME = "Reverse Dictionary";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";

// Make an Australia/Perth day key like 2025-08-14 (used for streaks)
function awstDayKey(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Perth",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find(p => p.type === "year")?.value ?? "0000";
  const m = parts.find(p => p.type === "month")?.value ?? "00";
  const d = parts.find(p => p.type === "day")?.value ?? "00";
  return `${y}-${m}-${d}`;
}

export default function Home() {
  // Game state
  const [clue, setClue] = useState("");
  const [puzzleId, setPuzzleId] = useState<number | null>(null);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState<boolean[]>([]);
  const [status, setStatus] = useState<GameStatus>("ready");
  const [message, setMessage] = useState("");

  // Progress (localStorage)
  const [streak, setStreak] = useState(0);

  const dayKey = useMemo(() => awstDayKey(), []);

  // Load today’s puzzle + restore progress
  useEffect(() => {
    (async () => {
      const data: { id: number; clue: string } = await fetch("/api/today").then(r => r.json());
      setClue(data.clue);
      setPuzzleId(data.id);

      const savedDay = localStorage.getItem("rd:lastDayKey");
      const savedId = Number(localStorage.getItem("rd:lastPuzzleId") || 0);
      const savedStreak = Number(localStorage.getItem("rd:streak") || 0);
      const savedStatusRaw = localStorage.getItem("rd:lastStatus");

      setStreak(Number.isFinite(savedStreak) ? savedStreak : 0);

      if (savedDay === dayKey && savedId === data.id && savedStatusRaw && isGameStatus(savedStatusRaw)) {
        setStatus(savedStatusRaw);
        setMessage(savedStatusRaw === "won" ? "✅ Already solved today!" : "❌ Out of tries today.");
        try {
          const parsed = JSON.parse(localStorage.getItem("rd:lastAttempts") || "[]");
          if (Array.isArray(parsed)) setAttempts(parsed.filter(Boolean));
        } catch {
          // ignore parse errors
        }
      } else {
        setStatus("playing");
      }
    })();
  }, [dayKey]);

  async function submitGuess() {
    if (status !== "playing" || puzzleId == null) return;
    if (!guess.trim()) {
      setMessage("Type a 5-letter word.");
      return;
    }

    const res = await fetch("/api/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: puzzleId, guess }),
    });
    const data: { correct?: boolean } = await res.json();
    const correct = !!data.correct;

    const nextAttempts = [...attempts, correct];
    setAttempts(nextAttempts);

    if (correct) {
      setStatus("won");
      setMessage("✅ Correct!");
      const newStreak = localStorage.getItem("rd:lastDayKey") === dayKey ? streak : streak + 1;
      setStreak(newStreak);
      persistProgress(dayKey, puzzleId, "won", nextAttempts, newStreak);
    } else if (nextAttempts.length >= MAX_ATTEMPTS) {
      setStatus("lost");
      setMessage("❌ Out of tries today.");
      const newStreak = 0;
      setStreak(newStreak);
      persistProgress(dayKey, puzzleId, "lost", nextAttempts, newStreak);
    } else {
      setMessage(`❌ Try again (${nextAttempts.length}/${MAX_ATTEMPTS})`);
    }

    setGuess("");
  }

  function persistProgress(
    dayKeyVal: string,
    puzzleIdVal: number,
    result: Exclude<GameStatus, "ready" | "playing">,
    attemptsVal: boolean[],
    streakVal: number
  ) {
    localStorage.setItem("rd:lastDayKey", dayKeyVal);
    localStorage.setItem("rd:lastPuzzleId", String(puzzleIdVal));
    localStorage.setItem("rd:lastStatus", result);
    localStorage.setItem("rd:lastAttempts", JSON.stringify(attemptsVal));
    localStorage.setItem("rd:streak", String(streakVal));
  }

  function shareResultText() {
    const dayNumber = new Date(dayKey).getTime() / 86400000;
    const header = `${SITE_NAME} #${Math.floor(dayNumber)}\nStreak: ${streak}`;
    const rows = attempts.slice(0, MAX_ATTEMPTS).map(ok => (ok ? "🟩" : "🟥")).join("\n");
    const attemptsLine = status === "won" ? `Attempts: ${attempts.length}/${MAX_ATTEMPTS}` : `Attempts: X/${MAX_ATTEMPTS}`;
    return `${header}\n${attemptsLine}\n${rows}\n${SITE_URL}`;
  }

  async function handleShare() {
    const text = shareResultText();
    try {
      await navigator.clipboard.writeText(text);
      setMessage("📋 Copied results to clipboard!");
    } catch {
      window.prompt("Copy your results:", text);
    }
  }

  function resetToday() {
    ["rd:lastDayKey","rd:lastPuzzleId","rd:lastStatus","rd:lastAttempts"].forEach(k=>localStorage.removeItem(k));
    // localStorage.removeItem("rd:streak"); // keep streak by default
    location.reload();
  }

  const canGuess = status === "playing" && attempts.length < MAX_ATTEMPTS;

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{SITE_NAME}</h1>
      <p className="text-sm opacity-70">Daily word-from-definition puzzle (AWST)</p>

      <section className="p-4 rounded-2xl border">
        <h2 className="font-semibold">Clue</h2>
        <p className="text-lg mt-1">{clue || "Loading..."}</p>
      </section>

      <section className="flex items-center gap-2">
        <input
          className="border rounded-xl px-3 py-2 w-60"
          placeholder="Enter 5-letter word"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          onKeyDown={e => e.key === "Enter" && canGuess && submitGuess()}
          disabled={!canGuess}
        />
        <button className="rounded-xl px-4 py-2 border font-medium disabled:opacity-50" onClick={submitGuess} disabled={!canGuess}>
          Guess
        </button>
        <button className="rounded-xl px-4 py-2 border font-medium" onClick={handleShare} disabled={attempts.length === 0} title="Copy results to clipboard">
          Share
        </button>
        <button className="rounded-xl px-4 py-2 border font-medium" onClick={resetToday} title="Clear today's progress">
          Reset Today
        </button>
      </section>

      <section className="space-y-2">
        <p>{message}</p>
        <p className="text-sm opacity-70">Streak: {streak}</p>
        <div className="whitespace-pre leading-5">
          {attempts.map((ok, i) => (
            <div key={i}>{ok ? "🟩" : "🟥"}</div>
          ))}
        </div>
      </section>

      <footer className="text-xs opacity-60 pt-6">
        New puzzle at midnight Australia/Perth • Max {MAX_ATTEMPTS} attempts
      </footer>
    </main>
  );
}

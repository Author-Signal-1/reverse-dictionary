"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [clue, setClue] = useState("");
  const [id, setId] = useState(0);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    fetch("/api/today")
      .then(r => r.json())
      .then(data => {
        setClue(data.clue);
        setId(data.id);
      });
  }, []);

  const submitGuess = async () => {
    const res = await fetch("/api/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, guess })
    });
    const data = await res.json();
    setResult(data.correct ? "✅ Correct!" : "❌ Try again");
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Reverse Dictionary</h1>
      <p>{clue}</p>
      <input
        value={guess}
        onChange={e => setGuess(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <button onClick={submitGuess}>Guess</button>
      <p>{result}</p>
    </main>
  );
}

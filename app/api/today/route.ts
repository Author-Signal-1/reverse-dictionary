import puzzles from "../../../data/puzzles.json";
import { DateTime } from "luxon";

// Only 5-letter answers
const fiveLetterPuzzles = puzzles.filter(p => p.answer.length === 5);

// AWST day number (midnight rollover in Australia/Perth)
function awstDayNumber() {
  const nowAwst = DateTime.now().setZone("Australia/Perth");
  return Math.floor(nowAwst.toSeconds() / 86400);
}

function dailyIndex(len: number, offset: number) {
  const days = awstDayNumber();
  // safe modulo
  return ((days + offset) % len + len) % len;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dev = url.searchParams.get("dev") === "1"; // random index for testing
  const offset = Number(process.env.SECRET_OFFSET ?? 713);
  const len = fiveLetterPuzzles.length;

  const idx = dev ? Math.floor(Math.random() * len) : dailyIndex(len, offset);
  const { id, clue } = fiveLetterPuzzles[idx];
  return Response.json({ id, clue });
}


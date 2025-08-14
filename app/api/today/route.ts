import puzzles from "../../../data/puzzles.json";

const fiveLetterPuzzles = puzzles.filter(p => p.answer.length === 5);

function dailyIndex(len: number, offset: number) {
  const days = Math.floor(Date.now() / 86400000); // daily rollover
  return ((days + offset) % len + len) % len;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dev = url.searchParams.get("dev") === "1";
  const len = fiveLetterPuzzles.length;
  const offset = Number(process.env.SECRET_OFFSET ?? 713);

  const idx = dev ? Math.floor(Math.random() * len) : dailyIndex(len, offset);
  const { id, clue } = fiveLetterPuzzles[idx];
  return Response.json({ id, clue });
}

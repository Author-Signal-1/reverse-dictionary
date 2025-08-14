import puzzles from "../../../data/puzzles.json";

const fiveLetterPuzzles = puzzles.filter(p => p.answer.length === 5);

export async function POST(req: Request) {
  const { id, guess } = await req.json();
  const item = fiveLetterPuzzles.find(p => p.id === id);
  const correct = item && guess.trim().toLowerCase() === item.answer.toLowerCase();
  return Response.json({ correct });
}

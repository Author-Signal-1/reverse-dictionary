import puzzles from "../../../data/puzzles.json";

export async function POST(req: Request) {
  const { id, guess } = await req.json();
  const item = puzzles.find(p => p.id === id);
  const correct = guess.trim().toLowerCase() === item.answer.toLowerCase();
  return Response.json({ correct });
}

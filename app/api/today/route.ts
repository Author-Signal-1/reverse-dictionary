import puzzles from "../../../data/puzzles.json";

export async function GET() {
  const index = (Math.floor(Date.now() / 86400000) + 713) % puzzles.length;
  const { id, clue } = puzzles[index];
  return Response.json({ id, clue });
}

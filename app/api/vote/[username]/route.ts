import { getVotes, castVote } from "@/lib/voting";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const login = username.startsWith("@") ? username : `@${username}`;
  const votes = await getVotes(login);
  return Response.json(votes);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const login = username.startsWith("@") ? username : `@${username}`;
  
  try {
    const { type } = await req.json();
    if (type !== "fair" && type !== "buff" && type !== "nerf") {
      return Response.json({ error: "Invalid vote type." }, { status: 400 });
    }
    
    const votes = await castVote(login, type);
    return Response.json(votes);
  } catch (e) {
    return Response.json({ error: "Failed to process vote." }, { status: 500 });
  }
}

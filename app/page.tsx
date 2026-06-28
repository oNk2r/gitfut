import Background from "@/components/Background";
import AppShell from "@/components/AppShell";
import { getRepoStars } from "@/lib/github/stars";

export default async function Home() {
  const stars = await getRepoStars();
  return (
    <div className="relative min-h-screen overflow-x-hidden text-ink">
      <Background />
      <AppShell stars={stars} />
    </div>
  );
}

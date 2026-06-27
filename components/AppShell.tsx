"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import ScoutForm from "@/components/ScoutForm";
import CardFan from "@/components/CardFan";
import LoadingScreen from "@/components/LoadingScreen";
import HowItWorksModal from "@/components/HowItWorksModal";
import { SAMPLE_CARDS } from "@/lib/github/samples";

export default function AppShell() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pending, setPending] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Scouting navigates to the canonical /<username> route. The transition keeps
  // the loading screen up (with the mascot + puns) while the report is fetched
  // and server-rendered; the route then plays its own reveal.
  const handleScout = (name: string) => {
    const login = name.trim().replace(/^@/, "");
    if (!login) return;
    setPending(login);
    startTransition(() => router.push(`/${encodeURIComponent(login)}`));
  };

  if (isPending && pending) return <LoadingScreen login={pending} />;

  return (
    <>
      <main className="relative z-[2] flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-[1180px] flex-1 items-center gap-[clamp(24px,5vw,72px)] px-[clamp(22px,5vw,56px)] max-[860px]:flex-col max-[860px]:gap-[34px] max-[860px]:pb-6 max-[860px]:pt-[clamp(26px,5vh,40px)] max-[860px]:text-center">
          <ScoutForm
            loading={isPending}
            error={null}
            onScout={handleScout}
            onOpenModal={() => setModalOpen(true)}
          />
          <CardFan cards={SAMPLE_CARDS} onPick={handleScout} />
        </div>
        <footer className="relative z-[2] flex flex-none items-center justify-center p-[clamp(12px,2.6vh,24px)]">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-[9px] rounded-[10px] px-[15px] py-[9px] text-[13.5px] font-semibold text-ink-faint transition hover:bg-white/5 hover:text-ink"
          >
            Support the project
            <span className="inline-flex items-center gap-[5px]">
              <span className="font-mono font-semibold text-ink-mute">2.4k</span>
              <Star color="var(--color-gold)" fill="var(--color-gold)" size={13} />
            </span>
          </a>
        </footer>
      </main>

      {modalOpen && <HowItWorksModal onClose={() => setModalOpen(false)} />}
    </>
  );
}

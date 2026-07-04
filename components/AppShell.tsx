"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import RatingForm from "@/components/RatingForm";
import CardFan from "@/components/CardFan";
import LoadingScreen from "@/components/LoadingScreen";
import HowItWorksModal from "@/components/HowItWorksModal";
import FooterCredit from "@/components/FooterCredit";
import GithubStar from "@/components/GithubStar";
import { SAMPLE_CARDS } from "@/lib/youtube/samples";

export default function AppShell({ stars, ratingCount }: { stars: number | null; ratingCount: number | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pending, setPending] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem("ytfut:seen-home", "1");
    } catch {}
  }, []);

  const handleRate = (name: string) => {
    const login = name.trim().replace(/^@/, "");
    if (!login) return;
    setPending(login);
    startTransition(() => router.push(`/${encodeURIComponent(login)}`));
  };

  if (isPending && pending) return <LoadingScreen login={pending} />;

  return (
    <>
      <main className="relative z-[2] flex min-h-screen flex-col">
        {/* <div className="absolute right-[clamp(20px,5vw,52px)] top-[clamp(16px,3vh,26px)] z-[3]">
          <GithubStar stars={stars} />
        </div> */}
        <div className="mx-auto flex w-full max-w-[1180px] flex-1 items-center gap-[clamp(24px,5vw,72px)] px-[clamp(22px,5vw,56px)] max-[860px]:flex-col max-[860px]:gap-[34px] max-[860px]:pb-6 max-[860px]:pt-[clamp(40px,6vh,56px)] max-[860px]:text-center">
          <RatingForm
            loading={isPending}
            error={null}
            ratingCount={ratingCount}
            onRate={handleRate}
            onOpenModal={() => setModalOpen(true)}
          />
          <CardFan cards={SAMPLE_CARDS} onPick={handleRate} />
        </div>
        <footer className="relative z-[2] mt-auto flex flex-none items-center justify-center p-[clamp(12px,2.6vh,24px)]">
          <FooterCredit />
        </footer>
      </main>

      {modalOpen && <HowItWorksModal onClose={() => setModalOpen(false)} />}
    </>
  );
}

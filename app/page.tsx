import Background from "@/components/Background";
import AppShell from "@/components/AppShell";
import { getRepoStars } from "@/lib/github/stars";
import { getRatingCount } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://ytfut.vercel.app/#website",
      url: "https://ytfut.vercel.app",
      name: "YTFut",
      description: "Turn any YouTube channel into a player card rated out of 99.",
    },
    {
      "@type": "WebApplication",
      name: "YTFut",
      url: "https://ytfut.vercel.app",
      applicationCategory: "EntertainmentApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript",
      description:
        "Turn any YouTube channel into a FIFA-Ultimate-Team-style player card rated out of 99, built from real YouTube stats.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default async function Home() {
  const [stars, ratingCount] = await Promise.all([getRepoStars(), getRatingCount()]);
  return (
    <div className="relative min-h-screen overflow-x-hidden text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Background />
      <AppShell stars={stars} ratingCount={ratingCount} />
    </div>
  );
}

import { Heart, Star } from "lucide-react";
import { formatCount } from "@/lib/format";

// lucide dropped its brand marks, so the X (Twitter) logo is an inline SVG —
// same pattern as the GitHub octocat that used to live in SupportLink.
// `relative top-px` nudges the glyph onto the text's optical center (the SVG's
// own bounding box sits a hair high against the font's x-height).
function XMark({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="relative top-px shrink-0"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
    </svg>
  );
}

const AUTHORS: ReadonlyArray<{ name: string; x: string }> = [
  { name: "younesfdj", x: "https://x.com/younesfdj" },
  { name: "Mawsis", x: "https://x.com/wassim_khouas" },
];

const REPO_URL = "https://github.com/younesfdj/gitfut";

// Footer author credit — "made with ♥ by younesfdj ✕ & Mawsis ✕  ★ 1.2k".
// Replaces the old "Support the project" link; the star/repo link folds the
// star CTA back in, reusing the same server-fetched `stars` prop. Shared by the
// home footer (AppShell) and the scout-report footer (ResultView) so they match.
// A soft dark backdrop lifts the credit off the contribution-grid motif so the
// text keeps its contrast wherever the footer lands.
export default function FooterCredit({ stars }: { stars: number | null }) {
  return (
    <div className="relative inline-flex max-w-full items-center justify-center">
      {/* weak dark fade behind the credit — soft-edged, no hard pill outline */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[-18px] inset-y-[-6px] rounded-full bg-bg-deep/70 blur-[10px]"
      />

      <div className="relative flex flex-wrap items-center justify-center gap-x-[7px] gap-y-[4px] text-[13.5px] font-semibold leading-none text-ink-soft">
        <span className="inline-flex items-center gap-[5px]">
          made with
          <Heart
            color="var(--color-brand)"
            fill="var(--color-brand)"
            size={13}
            aria-label="love"
            className="relative top-px shrink-0"
          />
          by
        </span>

        {AUTHORS.map((author, i) => (
          <span key={author.x} className="inline-flex items-center gap-[6px]">
            <a
              href={author.x}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-[5px] rounded-[7px] px-[6px] py-[3px] text-ink-dim transition hover:bg-white/8 hover:text-ink"
            >
              {author.name}
              <XMark size={14} />
            </a>
            {i < AUTHORS.length - 1 && <span className="text-ink-mute">&amp;</span>}
          </span>
        ))}

        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener"
          className="ml-[2px] inline-flex items-center gap-[5px] rounded-[7px] px-[7px] py-[3px] text-ink-dim transition hover:bg-white/8 hover:text-ink"
        >
          <Star color="var(--color-gold)" fill="var(--color-gold)" size={13} className="relative top-px shrink-0" />
          {stars !== null && stars >= 10 && <span className="font-mono font-semibold">{formatCount(stars)}</span>}
        </a>
      </div>
    </div>
  );
}

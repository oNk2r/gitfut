// Shared maker credit by the home footer (AppShell) and the rating-report footer
// (ResultView). A soft dark backdrop lifts the credit off the contribution-grid
// motif so the text keeps its contrast wherever it lands.
export default function FooterCredit() {
  return (
    <div className="relative inline-flex max-w-full items-center justify-center">
      {/* weak dark fade behind the credit — soft-edged, no hard pill outline */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[-18px] inset-y-[-6px] rounded-full bg-bg-deep/70 blur-[10px]"
      />

      <div className="relative flex flex-wrap items-center justify-center gap-x-[6px] gap-y-[4px] text-[13.5px] font-semibold leading-none text-ink-soft">
        <span className="text-ink-mute">forked from</span>
        <a
          href="https://gitfut.com"
          target="_blank"
          rel="noopener"
          className="rounded-[7px] px-[6px] py-[3px] text-brand transition hover:bg-white/8 hover:text-brand-hi"
        >
          gitfut.com
        </a>
      </div>
    </div>
  );
}

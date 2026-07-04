const noiseSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2"/></filter><rect width="120" height="120" filter="url(#n)"/></svg>';
const NOISE = `url("data:image/svg+xml;utf8,${encodeURIComponent(noiseSvg)}")`;

// YouTube, Subscribe (bell), and Superchat icons for the grid cells
function GridCell({ type, fill, lit }: { type: number; fill: string; lit: boolean }) {
  if (type === 0) {
    // YouTube Play Logo
    return (
      <path
        d="M10.5 2.5h-9C.7 2.5 0 3.2 0 4v4c0 .8.7 1.5 1.5 1.5h9c.8 0 1.5-.7 1.5-1.5V4c0-.8-.7-1.5-1.5-1.5z M4.5 8.2V3.8l3.5 2.2-3.5 2.2z"
        fill={fill}
      />
    );
  } else if (type === 1) {
    // Subscribe Bell
    return (
      <path
        d="M6 1.5c-1.2 0-2.2.9-2.2 2.1v2.2L2.5 7.5h7L8.2 5.8V3.6c0-1.2-1-2.1-2.2-2.1zm-1.2 7h2.4c0 .7-.5 1.2-1.2 1.2s-1.2-.5-1.2-1.2z"
        fill={fill}
      />
    );
  } else {
    // Superchat Dollar Circle
    return (
      <g>
        <circle cx="6" cy="6" r="5.5" fill={fill} />
        <text
          x="6"
          y="9.2"
          fontSize="9"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
          fill={lit ? "#1f1414" : "#ff0000"}
          opacity={lit ? 0.95 : 0.15}
          style={{ userSelect: "none" }}
        >
          $
        </text>
      </g>
    );
  }
}

// Rethemed grid motif: red YouTube-style upload activity grid.
function ContribGrid() {
  const cols = 30;
  const rows = 7;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = (r * 7 + c * 13) % 11;
      const lit = seed < 3;
      const type = (r * 3 + c * 7) % 3; // cycle between play, bell, superchat
      const fill = lit ? "#ff0000" : "#1f1414";
      cells.push(
        <g
          key={`${r}-${c}`}
          transform={`translate(${c * 16}, ${r * 16}) scale(1.25)`}
          className={lit ? "gf-grid-cell" : undefined}
          style={lit ? { ["--gf-dur" as string]: `${2.4 + seed * 0.4}s` } : undefined}
        >
          <GridCell type={type} fill={fill} lit={lit} />
        </g>,
      );
    }
  }
  return (
    <svg
      width={cols * 16}
      height={rows * 16}
      viewBox={`0 0 ${cols * 16} ${rows * 16}`}
      style={{ width: "100%", height: "100%" }}
      aria-hidden
    >
      {cells}
    </svg>
  );
}

export default function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-bg">
      {/* red ambient — the "action" color, top spotlight */}
      <div
        className="animate-flood absolute"
        style={{
          top: "-34%",
          left: "50%",
          width: "120%",
          height: "92%",
          background:
            "radial-gradient(50% 62% at 50% 0%, rgba(255,0,0,.14), rgba(15,15,15,.2) 46%, rgba(15,15,15,0) 72%)",
        }}
      />
      {/* left cool wash */}
      <div
        className="absolute"
        style={{
          top: "-10%",
          left: "4%",
          width: "38%",
          height: "78%",
          background: "radial-gradient(closest-side, rgba(204,0,0,.12), transparent 72%)",
          filter: "blur(18px)",
          transform: "rotate(16deg)",
        }}
      />
      {/* right whisper of WC26 gold — prestige, kept subtle */}
      <div
        className="absolute"
        style={{
          top: "-10%",
          right: "4%",
          width: "34%",
          height: "78%",
          background: "radial-gradient(closest-side, rgba(212,175,55,.08), transparent 72%)",
          filter: "blur(20px)",
          transform: "rotate(-16deg)",
        }}
      />
      {/* deep floor vignette */}
      <div
        className="absolute"
        style={{
          bottom: "-24%",
          left: "50%",
          width: "150%",
          height: "55%",
          transform: "translateX(-50%)",
          background: "radial-gradient(60% 100% at 50% 100%, rgba(5,5,5,.85), transparent 72%)",
        }}
      />
      {/* upload-grid motif, faint along the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "16%", opacity: 0.5, maskImage: "linear-gradient(to top, #000, transparent)", WebkitMaskImage: "linear-gradient(to top, #000, transparent)" }}
      >
        <ContribGrid />
      </div>
      <div className="absolute inset-0" style={{ opacity: 0.04, backgroundImage: NOISE, mixBlendMode: "overlay" }} />
    </div>
  );
}

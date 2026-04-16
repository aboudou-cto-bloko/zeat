"use client";

/**
 * ZeatLoader — animated Z logo loader
 * Usage: <ZeatLoader /> for full-screen, <ZeatLoader size="sm" /> for inline
 */
export function ZeatLoader({
  size = "md",
  fullScreen = false,
}: {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}) {
  const dim = size === "sm" ? 32 : size === "lg" ? 72 : 48;

  const loader = (
    <div
      role="status"
      aria-label="Chargement…"
      style={{ width: dim, height: dim }}
      className="relative flex items-center justify-center"
    >
      {/* Outer pulse ring */}
      <span
        className="absolute inset-0 rounded-[22%] bg-uber-black animate-zeat-pulse"
        aria-hidden="true"
      />
      {/* Icon square */}
      <span
        className="relative flex items-center justify-center rounded-[22%] bg-uber-black animate-zeat-breathe"
        style={{ width: dim, height: dim }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: dim * 0.58, height: dim * 0.58 }}
        >
          {/* Z letterform — two horizontals + diagonal */}
          <line x1="10" y1="12" x2="38" y2="12" stroke="white" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="38" y1="12" x2="10" y2="36" stroke="white" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="10" y1="36" x2="38" y2="36" stroke="white" strokeWidth="5.5" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 bg-pure-white animate-fade-in">
        {loader}
        <span className="text-micro text-muted-gray tracking-widest uppercase animate-fade-in stagger-2">
          Zeat
        </span>
      </div>
    );
  }

  return loader;
}

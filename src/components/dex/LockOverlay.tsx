import React from 'react';

interface LockOverlayProps {
  locked: boolean;
  showTooltip?: boolean;
}

export default function LockOverlay({ locked, showTooltip = true }: LockOverlayProps) {
  if (!locked) return null;

  return (
    <>
      <div
        className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,.55),rgba(0,0,0,.75))] backdrop-blur-[2px] ring-1 ring-white/10 z-10"
        title={showTooltip ? "Not obtained yet - keep recycling to unlock!" : undefined}
      />
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="bg-black/60 backdrop-blur-sm shadow-soft ring-1 ring-white/10 rounded-full p-2 animate-[pop_.2s_ease-out]">
          <svg
            className="w-6 h-6 text-white/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      </div>
    </>
  );
}

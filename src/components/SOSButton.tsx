import React from "react";

export function SOSButton() {
  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Could start a timer/vibration here if desired
  };
  const onUp = () => {
    // Open dialer (user decides). Auto-dialing 911 is not allowed on iOS/Android browsers.
    window.location.href = "tel:911";
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onMouseDown={onDown as any}
        onMouseUp={onUp}
        onTouchStart={onDown as any}
        onTouchEnd={onUp}
        className="rounded-full bg-red-600 text-white h-40 w-40 text-lg font-bold shadow-lg hover:bg-red-700 active:scale-95 transition-all"
        aria-label="Emergency SOS"
      >
        ⚠️ SOS
      </button>
      <small className="opacity-70 text-center text-sm">
        Opens your phone dialer for 911. Works offline.
      </small>
    </div>
  );
}

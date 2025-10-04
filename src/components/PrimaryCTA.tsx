import React from "react";

export default function PrimaryCTA(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <button
      {...rest}
      className={
        "w-full rounded-2xl h-[64px] min-h-[64px] px-6 text-lg font-semibold " +
        "bg-[#5B5CE2] text-white border border-indigo-400 shadow-lg " +
        "hover:bg-indigo-500 active:bg-indigo-700 transition " +
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 " +
        className
      }
      aria-label="Start Guidance"
    >
      {children}
    </button>
  );
}

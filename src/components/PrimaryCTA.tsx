import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function PrimaryCTA({ children, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      data-variant="primary-cta"
      className={
        "rounded-2xl px-6 h-[56px] min-h-[56px] text-base md:text-lg font-semibold " +
        "bg-primary text-primary-foreground border border-primary " +
        "hover:bg-primary/90 hover:shadow-lg active:bg-primary " +
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 " +
        "transition-all duration-200 " +
        "w-full " + className
      }
      aria-label="Primary call to action"
    >
      {children}
    </button>
  );
}

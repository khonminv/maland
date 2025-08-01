import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-4 py-2 font-semibold transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

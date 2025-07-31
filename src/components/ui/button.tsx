export function Button({ children, className = "", ...props }: any) {
  return (
    <button
      className={`rounded-lg px-4 py-2 font-semibold transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

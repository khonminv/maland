export default function MiniRoot({ children }: { children: React.ReactNode }) {
  // html/body 쓰지 말고, 최소 래퍼만
  return <div className="min-h-screen bg-gray-900 text-white">{children}</div>;
}

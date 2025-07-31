import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const metadata: Metadata = {
  title: "메이플랜드 올인원",
  description: "스킬트리, 자리 거래, 파티 모집을 한 곳에서!",
};

const navItems = [
  { name: "스킬트리", href: "/skill-simulator" },
  { name: "자리 거래", href: "/trade" },
  { name: "파티 모집", href: "/party" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-[#1a1a2e] text-white min-h-screen">
        <header className="bg-[#0f3460] border-b-2 border-yellow-400 shadow-md sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold text-yellow-300 tracking-wider hover:text-yellow-200 transition-colors"
            >
              🌟 MapleLand
            </Link>
            {/* <ul className="flex gap-6">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-white hover:text-yellow-300 transition-colors`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul> */}
          </nav>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

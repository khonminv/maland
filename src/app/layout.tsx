
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/ui/Nav";
import { AuthProvider } from "./context/AuthContext";
     
export const metadata: Metadata = {
  title: "메이플랜드 올인원",
  description: "스킬트리, 자리 거래, 파티 모집을 한 곳에서!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className="bg-gradient-to-tr from-[#1a1a2e] via-[#0f3460] to-[#16213e] text-white min-h-screen font-sans selection:bg-yellow-400 selection:text-black">
        <AuthProvider>
          <header className="sticky top-0 z-50 backdrop-blur-sm bg-black/60 border-b border-yellow-400 shadow-lg">
            <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
              <Link
                href="/"
                className="text-3xl font-extrabold text-yellow-400 tracking-wide hover:text-yellow-300 transition duration-300 select-none"
                aria-label="메이플랜드 홈으로 이동"
              >
                🌟 MapleLand All
              </Link>

              <Nav />
            </nav>
          </header>

          <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 min-h-[calc(100vh-64px)]">
            {children}
          </main>

          <footer className="mt-auto border-t border-yellow-400 text-center text-sm text-yellow-300 py-4 select-none">
            © 2025 MapleLand All
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

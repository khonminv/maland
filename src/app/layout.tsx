// app/layout.tsx (또는 app/(root)/layout.tsx)
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/ui/Nav";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.maland-all.co.kr/"),
  title: {
    default: "메랜올",
    template: "%s | 메랜올",
  },
  description: "스킬트리, 자리 거래, 파티 모집 MapleLand All",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    url: "https://www.maland-all.co.kr/",
    siteName: "메랜올",
    title: "메랜올",
    description: "스킬트리, 자리 거래, 파티 모집",
    locale: "ko_KR",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "메랜올" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "메랜올",
    description: "스킬트리, 자리 거래, 파티 모집",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full scroll-smooth">
      <body
        className={[
          // 높이
          "min-h-dvh", // iOS 등에서 더 정확한 동적 뷰포트 높이
          "text-white relative",

          // 배경 이미지 (모바일에서 오른쪽 상단, 데스크탑에서 중앙)
          "bg-[url('/images/back.jpg')] bg-no-repeat bg-cover",
          "bg-right-top sm:bg-center md:bg-fixed",
        ].join(" ")}
      >
        {/* 배경 오버레이: 모바일은 조금 더 진하게, 데스크탑은 살짝 약하게 */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/75 via-black/55 to-black/65 md:from-black/65 md:via-black/45 md:to-black/55" />

        <AuthProvider>
          {/* 헤더 */}
          <header className="sticky top-0 z-50 backdrop-blur-md bg-black/65 border-b border-yellow-400/80 shadow-md">
            <nav className="mx-auto h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 max-w-screen-lg lg:max-w-6xl xl:max-w-7xl">
              <Link
                href="/"
                className="select-none font-extrabold tracking-wide text-yellow-400 hover:text-yellow-300 transition-colors text-2xl sm:text-3xl"
                aria-label="메이플랜드 홈으로 이동"
              >
                MapleLand All
              </Link>

              {/* Nav가 내부에서 반응형을 처리한다고 가정 (모바일에서 드로어/버거 등) */}
              <Nav />
            </nav>
          </header>

          {/* 메인 컨텐츠 */}
          <main className="mx-auto w-full min-h-[calc(100dvh-56px)] sm:min-h-[calc(100dvh-64px)] px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 max-w-screen-lg lg:max-w-6xl xl:max-w-7xl">
            {children}
          </main>

          {/* 푸터 */}
          <footer className="mt-auto border-t border-yellow-400/80 text-center text-[13px] sm:text-sm text-yellow-400 py-4 px-4 sm:px-6 lg:px-8 xl:px-12 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            © 2025 MapleLand All
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

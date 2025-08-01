// components/Nav.tsx (use client 선언 필요)
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DiscordLoginButton from "../Discordlogin";

const navItems = [
  { name: "스킬트리", href: "/skill-simulator" },
  { name: "자리 거래", href: "/trade" },
  { name: "파티 모집", href: "/party" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <ul className="hidden md:flex space-x-12">
      {navItems.map(({ name, href }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              className={`relative inline-block px-3 py-2 font-medium transition-colors duration-300 ${
                isActive
                  ? "text-yellow-400 after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-1 after:rounded-full after:bg-yellow-400"
                  : "text-white hover:text-yellow-300"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {name}
            </Link>
            
          </li>
          
        );
      })}
      <DiscordLoginButton/>
    </ul>
  );
}

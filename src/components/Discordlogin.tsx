// components/DiscordLoginButton.tsx
export default function DiscordLoginButton() {
  const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI!)}&response_type=code&scope=identify+guilds`;
    console.log("CLIENT_ID:", process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID);
console.log("REDIRECT_URI:", process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI);

  return (
    <a
      href={discordLoginUrl}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-bold"
    >
      디스코드로 로그인
    </a>
  );
}

// components/DiscordLoginButton.tsx
export default function DiscordLoginButton() {
  const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI!)}&response_type=code&scope=identify+guilds`;


  return (
    <a href={discordLoginUrl} className="flex gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-bold">
      <img src="/images/discord1.svg" className="w-24"></img>
      <span
      
    >
    로그인
    </span>
    </a>
    
  );
}

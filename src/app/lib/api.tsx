export async function fetchUserProfile(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("유저 정보 불러오기 실패");
  }

  const user = await res.json();
  return user; // ✅ 바로 user 전체 객체 리턴
}

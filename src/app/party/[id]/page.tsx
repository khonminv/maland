// app/party/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PartyDetailClient, { PartyDetail } from "./PartyDetailClient";
import ClosedRedirect from "./ClosedRedirect";

async function getParty(id: string): Promise<PartyDetail | null> {
  const API = process.env.NEXT_PUBLIC_API_BASE!;
  const res = await fetch(`${API}/party/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("파티 상세 조회 실패");
  return res.json();
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  try {
    const { id } = await params;
    const data = await getParty(id);
    if (!data || data.isClosed) return { title: "파티 글 없음" };
    return { title: `파티: ${data.title}` };
  } catch {
    return { title: "파티 상세" };
  }
}

export default async function Page(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getParty(id);

  if (!data) notFound();
  if (data.isClosed) return <ClosedRedirect />;

  return <PartyDetailClient data={data} />;
}

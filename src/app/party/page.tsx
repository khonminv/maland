import { Suspense } from "react";
import PartyListPage from "./PartyListPage";

export default function PartyPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10 text-gray-400">로딩 중...</div>}>
      <PartyListPage />
    </Suspense>
  );
}

import { Suspense } from "react";
import TradePageClient from "./TradePage";

export default function Page() {
  return (
    <Suspense fallback={<div>로딩중...</div>}>
      <TradePageClient />
    </Suspense>
  );
}

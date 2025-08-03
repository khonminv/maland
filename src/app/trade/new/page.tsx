"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";


const subMapsByMap: Record<string, string[]> = {
  리프레: ["죽은용의 둥지", "붉은 켄타우로스의 영역", "기타 리프레 서브맵"],
  빅토리아: ["빅토리아 서브맵1", "빅토리아 서브맵2"],
};

interface User {
  id: string;
  username: string;
  avatar?: string;
}



interface AvgPrice {
  _id: {
    mapName: string;
    subMap: string;
  };
  avgPrice: number;
  count: number;
}

export default function NewTradePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    type: "삽니다",
    mapName: "리프레",
    subMap: subMapsByMap["리프레"][0], // 기본값 첫번째 서브맵
    price: "",
    description: "",
  });

  const [avgPrices, setAvgPrices] = useState<AvgPrice[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
if (!token) {
  console.log("토큰이 없음");
  return;
}

axios
  .get(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((res) => {
    console.log("🔐 유저 정보:", res.data);
    setUser(res.data);
  })
  .catch((err) => console.error("유저 정보 불러오기 실패", err));

  }, []);


  // mapName 변경 시 서브맵 자동 변경
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      subMap: subMapsByMap[form.mapName]?.[0] || "",
    }));
  }, [form.mapName]);

  // 평균 가격 데이터 불러오기
  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE}/trades/average-prices-by-submap`)
      .then((res) => setAvgPrices(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!user) {
    alert("로그인이 필요합니다.");
    return;
  }

  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("로그인 토큰이 없습니다.");
    return;
  }

  try {
    const payload = {
      ...form,
      price: Number(form.price),
      // userId, username, avatar는 서버에서 미들웨어가 자동으로 넣어주기 때문에 안 넣어도 됨
    };

    await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/trades`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    router.push("/trade");
  } catch (err) {
    console.error(err);
    alert("글 등록 실패");
  }
};
  // 현재 선택된 mapName의 서브맵별 평균 가격 필터링
  const filteredAvgPrices = avgPrices.filter((ap) => ap._id.mapName === form.mapName);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">새 거래 글 등록</h1>
      <form onSubmit={handleSubmit} className="space-y-4 relative">
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
        >
          <option value="삽니다">삽니다</option>
          <option value="팝니다">팝니다</option>
        </select>
        <select
          name="mapName"
          value={form.mapName}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
        >
          {Object.keys(subMapsByMap).map((map) => (
            <option key={map} value={map}>
              {map}
            </option>
          ))}
        </select>
        <select
          name="subMap"
          value={form.subMap}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
        >
          {(subMapsByMap[form.mapName] || []).map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="price"
          placeholder="가격"
          value={form.price}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
        />
        <div>
          <textarea
            name="description"
            placeholder="설명 (최대 50자)"
            value={form.description}
            onChange={handleChange}
            maxLength={50}
            className="w-full p-2 border rounded text-black"
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {form.description.length} / 50자
          </div>
        </div>
        
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          등록하기
        </button>
      </form>

      {/* 평균 거래가 표시 */}
      <div className="mt-8 p-4 border rounded bg-gray-50 text-black">
        <h2 className="text-lg font-semibold mb-2">선택한 서브맵 평균 거래 가격</h2>
        {(() => {
          const selectedAvg = avgPrices.find(
            (ap) =>
              ap._id.mapName === form.mapName &&
              ap._id.subMap === form.subMap
          );
          if (!selectedAvg) {
            return <p>해당 서브맵의 평균 거래가 정보가 없습니다.</p>;
          }
          return (
            <p className="text-sm text-black">
              <strong>{form.subMap}</strong> - 평균 가격:{" "}
              <span className="text-blue-600 font-bold ">
                {selectedAvg.avgPrice.toLocaleString()} 메소
              </span>{" "}
              ({selectedAvg.count}건)
            </p>
          );
        })()}
      </div>

    </div>
  );
}

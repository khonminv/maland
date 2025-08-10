"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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

interface SubMap {
  code: number;
  name_ko: string;
  name_en: string;
}

export default function NewTradePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [mapData, setMapData] = useState<Record<string, SubMap[]>>({});
  const [form, setForm] = useState({
    type: "삽니다",
    mapName: "",
    subMap: "",
    price: "",
    description: "",
  });

  const [avgPrices, setAvgPrices] = useState<AvgPrice[]>([]);

  // JSON 데이터 + 유저 정보 불러오기
  useEffect(() => {
    fetch("/data/trade_data.json")
      .then((res) => res.json())
      .then((data) => {
        setMapData(data);
        const firstMap = Object.keys(data)[0];
        setForm((prev) => ({
          ...prev,
          mapName: firstMap,
          subMap: data[firstMap]?.[0]?.name_ko || "",
        }));
      })
      .catch((err) => console.error("맵 데이터 불러오기 실패", err));

    const token = localStorage.getItem("authToken");
    if (!token) return;

    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => console.error("유저 정보 불러오기 실패", err));
  }, []);

  // mapName 변경 시 첫 번째 서브맵으로 변경
  useEffect(() => {
    if (mapData[form.mapName]) {
      setForm((prev) => ({
        ...prev,
        subMap: mapData[form.mapName][0]?.name_ko || "",
      }));
    }
  }, [form.mapName, mapData]);

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

    const priceNum = Number(form.price);

    if (!form.price.trim()) {
      alert("가격을 입력해주세요.");
      return;
    }

    if (isNaN(priceNum) || priceNum < 0 || !Number.isInteger(priceNum)) {
      alert("가격은 0 이상의 숫자여야 합니다.");
      return;
    }

    try {
      const payload = { ...form, price: priceNum };
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/trades`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/trade");
    } catch (err) {
      console.error(err);
      alert("글 등록 실패");
    }
  };

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

        {/* 맵 선택 */}
        <select
          name="mapName"
          value={form.mapName}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
        >
          {Object.keys(mapData).map((map) => (
            <option key={map} value={map}>
              {map}
            </option>
          ))}
        </select>

        {/* 서브맵 선택 */}
        <select
          name="subMap"
          value={form.subMap}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
        >
          {(mapData[form.mapName] || []).map((sub) => (
            <option key={sub.code} value={sub.name_ko}>
              {sub.name_ko}
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
            placeholder="귓속말 받을 캐릭터 닉네임(최대 50자)"
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
            (ap) => ap._id.mapName === form.mapName && ap._id.subMap === form.subMap
          );
          if (!selectedAvg) {
            return <p>해당 서브맵의 평균 거래가 정보가 없습니다.</p>;
          }
          return (
            <p className="text-sm text-black">
              <strong>{form.subMap}</strong> - 평균 가격:{" "}
              <span className="text-blue-600 font-bold">
                {Math.round(selectedAvg.avgPrice).toLocaleString()} 메소
              </span>{" "}
              ({selectedAvg.count}건)
            </p>
          );
        })()}
      </div>
    </div>
  );
}

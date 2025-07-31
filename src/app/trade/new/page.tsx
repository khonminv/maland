"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function NewTradePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    type: "삽니다",
    mapName: "리프레", // 수정: 'map' -> 'mapName'
    price: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // userId는 지금 테스트용으로 임시 값 넣을게 (나중에 로그인 연동 필요)
      const payload = {
        ...form,
        userId: "test-user-id",
      };

      await axios.post(
        "https://port-0-maple-land-server-mawa5o8ve8151a2a.sel4.cloudtype.app/trades",
        payload
      );
      router.push("/trade");
    } catch (err) {
      console.error(err);
      alert("글 등록 실패");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">새 거래 글 등록</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <option value="리프레">리프레</option>
          <option value="빅토리아">빅토리아</option>
        </select>
        <input
          type="text"
          name="price"
          placeholder="가격"
          value={form.price}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
        />
        <textarea
          name="description"
          placeholder="설명"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          등록하기
        </button>
      </form>
    </div>
  );
}

// components/party/PartyApplicationModal.tsx
import { useState } from "react";
import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string, positions: string[]) => void;  // positions 추가
  availablePositions: string[]
}

export default function PartyApplicationModal({ isOpen, onClose, onSubmit, availablePositions }: Props) {
  const [message, setMessage] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedPositions([]);
      setMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

   const togglePosition = (pos: string) => {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  const handleSubmit = () => {
    if (selectedPositions.length === 0) {
      alert("하나 이상의 자리를 선택해주세요.");
      return;
    }
    onSubmit(message, selectedPositions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-6 rounded max-w-md w-full text-white relative overflow-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">파티 신청</h2>

        <label className="block mb-2 font-semibold">신청 자리 선택</label>
        <div className="flex flex-wrap gap-2 mb-4 max-h-28 overflow-y-auto border border-gray-700 rounded p-2 bg-gray-800">
          {availablePositions.length === 0 ? (
            <p className="text-gray-400 italic">선택 가능한 자리가 없습니다.</p>
          ) : (
            availablePositions.map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => togglePosition(pos)}
                className={`px-3 py-1 rounded-full font-semibold border transition
                  ${
                    selectedPositions.includes(pos)
                      ? "bg-yellow-400 text-black border-yellow-300"
                      : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-yellow-600"
                  }`}
              >
                {pos}
              </button>
            ))
          )}
        </div>

        <textarea
          maxLength={50}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 bg-gray-800 rounded resize-none mb-4"
          placeholder="닉네임 및 추가 내용 입력 (최대 50자)"
          rows={3}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-300"
          >
            신청하기
          </button>
        </div>
      </div>
    </div>
  );
}
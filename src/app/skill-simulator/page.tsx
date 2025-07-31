import JobSelector from "./components/JobSelector";

export default function SkillSimulatorPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">메이플랜드 스킬트리 시뮬레이터</h1>
      <JobSelector />
    </main>
  );
}

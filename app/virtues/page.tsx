import { VIRTUES } from "@/lib/virtues";

export default function VirtuesPage() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      <h1 className="font-[family-name:var(--font-cinzel)] text-4xl text-white mb-10">13 дисциплин</h1>
      <ol className="space-y-6">
        {VIRTUES.map((v) => (
          <li key={v.index} className="border-l border-white/10 pl-6">
            <h2 className="text-white text-lg">{v.index + 1}. {v.name}</h2>
            <p className="text-neutral-400 mt-1">{v.rule}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}

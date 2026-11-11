import { VIRTUES } from "@/lib/virtues";
import VirtuesList from "@/components/VirtuesList";

export default function VirtuesPage() {
  return (
    <main className="min-h-screen px-4 md:px-6 py-10 md:py-16 max-w-3xl mx-auto">
      <VirtuesList virtues={VIRTUES} />
    </main>
  );
}

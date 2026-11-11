"use client";
import { useState } from "react";

export default function ExportButton() {
  const [loading, setLoading] = useState(false);
  async function download() {
    setLoading(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mustervoin-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      onClick={download}
      disabled={loading}
      className="text-neutral-500 hover:text-white transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "CSV"}
    </button>
  );
}

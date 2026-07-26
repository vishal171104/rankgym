"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { analyzeInput } from "@/lib/knowledge-base";

interface StatusScannerProps {
  onScanResult: (result: { text: string, type: 'vitality' | 'toxicity' | 'info' | 'neutral' }) => void;
}

export function StatusScanner({ onScanResult }: StatusScannerProps) {
  const [scannerInput, setScannerInput] = useState("");

  const handleScan = () => {
    if (!scannerInput.trim()) return;
    const result = analyzeInput(scannerInput);
    if (result) {
      onScanResult({ text: result.message, type: result.effect as any });
    } else {
      onScanResult({ text: `ITEM "${scannerInput.toUpperCase()}" NOT FOUND IN DATABASE.`, type: 'info' });
    }
    setScannerInput("");
  };

  return (
    <section className="mb-8 relative z-20">
      <div className="flex gap-2">
        <Input 
          placeholder="Scan Item / Food / Habit..." 
          className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 font-mono"
          value={scannerInput}
          onChange={(e) => setScannerInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
        />
        <Button onClick={handleScan} className="bg-zinc-800 hover:bg-zinc-700">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </section>
  );
}

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { PRP } from "@/app/lib/constants";
import { Btn } from "@/app/components/shared";
import type { FlashcardResponse } from "@/app/lib/api";

export function FlashcardStudy({ cards }: { cards: FlashcardResponse[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) return null;
  const card = cards[index];

  function go(delta: number) {
    setFlipped(false);
    setIndex((i) => Math.max(0, Math.min(cards.length - 1, i + delta)));
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--lm-text-faint)] text-center">Card {index + 1} of {cards.length}</p>

      <div
        onClick={() => setFlipped(!flipped)}
        className="bg-[var(--lm-card-bg)] border border-[var(--lm-border)] rounded-2xl p-8 min-h-[160px] flex items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      >
        <div>
          <p className="text-[10px] font-bold text-[var(--lm-text-faint)] uppercase tracking-wider mb-3">
            {flipped ? "Answer" : "Question"}
          </p>
          <p className="text-sm font-semibold text-[var(--lm-text)] leading-relaxed">
            {flipped ? card.backText : card.frontText}
          </p>
        </div>
      </div>

      <p className="text-[10px] text-[var(--lm-text-faint)] text-center flex items-center justify-center gap-1">
        <RotateCw size={10} /> Click the card to flip
      </p>

      <div className="flex items-center justify-between">
        <Btn variant="ghost" size="sm" onClick={() => go(-1)} disabled={index === 0}>
          <ChevronLeft size={14} /> Previous
        </Btn>
        <div className="flex gap-1">
          {cards.map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i === index ? PRP : "var(--lm-border)" }} />
          ))}
        </div>
        <Btn variant="ghost" size="sm" onClick={() => go(1)} disabled={index === cards.length - 1}>
          Next <ChevronRight size={14} />
        </Btn>
      </div>
    </div>
  );
}
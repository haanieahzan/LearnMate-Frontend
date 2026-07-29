import ReactMarkdown from "react-markdown";
import { Lightbulb } from "lucide-react";

const MARKER = "BEYOND_COURSE_MATERIAL:";

/**
 * Renders an AI answer, splitting out any content the model marked as
 * "beyond the course material" into a visually distinct callout — so
 * students can tell grounded answers apart from general explanation.
 */
export function AiAnswer({ text }: { text: string }) {
  const markerIndex = text.indexOf(MARKER);
  const grounded = markerIndex === -1 ? text : text.slice(0, markerIndex).trim();
  const supplement = markerIndex === -1 ? null : text.slice(markerIndex + MARKER.length).trim();

  return (
    <div className="space-y-2">
      <div className="prose prose-sm max-w-none [&>*]:my-1 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-4">
        <ReactMarkdown>{grounded}</ReactMarkdown>
      </div>
      {supplement && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex gap-2">
          <Lightbulb size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">Beyond your course material</p>
            <div className="prose prose-sm max-w-none [&>*]:my-1 text-amber-900">
              <ReactMarkdown>{supplement}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Textarea } from "../ui/Textarea";

export function MarkdownEditor({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid min-h-[560px] overflow-hidden rounded-lg border border-border lg:grid-cols-2">
      <div className="border-b border-border lg:border-b-0 lg:border-r">
        <div className="border-b border-border px-4 py-3 text-sm font-bold">Markdown</div>
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-[520px] resize-none rounded-none border-0 font-mono leading-6 focus:ring-0"
          placeholder="Write your post in Markdown..."
        />
      </div>
      <div>
        <div className="border-b border-border px-4 py-3 text-sm font-bold">Preview</div>
        <div className="prose prose-slate max-w-none p-5 dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "Preview appears here."}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

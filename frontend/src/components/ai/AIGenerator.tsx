import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { aiApi } from "../../lib/api";
import type { GeneratedPost } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

export function AIGenerator({ onInsert }: { onInsert: (post: GeneratedPost) => void }) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("helpful and practical");
  const [length, setLength] = useState("medium");

  const mutation = useMutation({
    mutationFn: aiApi.generate,
    onSuccess: (response) => {
      onInsert(response.data.post);
      toast.success("AI draft inserted");
    },
    onError: (error: any) => toast.error(error.response?.data?.message ?? "Unable to generate post")
  });

  return (
    <aside className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="mb-4 flex items-center gap-2 font-black">
        <Sparkles className="text-accent" size={20} />
        AI Post Generator
      </div>
      <div className="space-y-3">
        <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Topic" />
        <Input value={tone} onChange={(event) => setTone(event.target.value)} placeholder="Tone" />
        <Select value={length} onChange={(event) => setLength(event.target.value)}>
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </Select>
        <Button
          className="w-full"
          disabled={!topic || mutation.isPending}
          onClick={() => mutation.mutate({ topic, tone, length })}
        >
          <Sparkles size={16} />
          {mutation.isPending ? "Generating..." : "Generate and Insert"}
        </Button>
      </div>
    </aside>
  );
}

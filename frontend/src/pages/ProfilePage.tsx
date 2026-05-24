import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../lib/api";

export function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: user?.name ?? "", bio: user?.bio ?? "", avatar: user?.avatar ?? "" });
  const mutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (response) => {
      queryClient.setQueryData(["me"], response.data.user);
      toast.success("Profile updated");
    }
  });

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-border p-6 shadow-soft">
      <h1 className="text-3xl font-black">Profile</h1>
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate(form);
        }}
      >
        <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" />
        <Input value={form.avatar} onChange={(event) => setForm({ ...form, avatar: event.target.value })} placeholder="Avatar URL" />
        <Textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Bio" />
        <Button disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save profile"}</Button>
      </form>
    </div>
  );
}

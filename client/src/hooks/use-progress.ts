import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useUserProgress() {
  return useQuery({
    queryKey: [api.progress.list.path],
    queryFn: async () => {
      const res = await fetch(api.progress.list.path, { credentials: "include" });
      if (res.status === 401) return [];
      if (!res.ok) throw new Error("Failed to fetch progress");
      return api.progress.list.responses[200].parse(await res.json());
    },
  });
}

export function useToggleProgress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ stepId, completed }: { stepId: number; completed: boolean }) => {
      const res = await fetch(api.progress.toggle.path, {
        method: api.progress.toggle.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, completed }),
        credentials: "include",
      });
      if (res.status === 401) throw new Error("Must be logged in to save progress");
      if (!res.ok) throw new Error("Failed to update progress");
      return api.progress.toggle.responses[200].parse(await res.json());
    },
    onSuccess: (_data, { completed }) => {
      queryClient.invalidateQueries({ queryKey: [api.progress.list.path] });
      toast({
        title: completed ? "Step completed!" : "Step marked incomplete",
        description: completed
          ? "Your progress has been saved."
          : "Progress updated.",
        duration: 2000,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Couldn't save progress",
        description: err.message || "Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });
}

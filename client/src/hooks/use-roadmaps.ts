import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useRoadmaps() {
  return useQuery({
    queryKey: [api.roadmaps.list.path],
    queryFn: async () => {
      const res = await fetch(api.roadmaps.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch roadmaps");
      return api.roadmaps.list.responses[200].parse(await res.json());
    },
  });
}

export function useRoadmap(id: number) {
  return useQuery({
    queryKey: [api.roadmaps.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.roadmaps.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch roadmap");
      return api.roadmaps.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

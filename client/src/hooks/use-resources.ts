import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useResources(category?: string, search?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [api.resources.list.path, category, search, page, limit],
    queryFn: async () => {
      const url = new URL(api.resources.list.path, window.location.origin);
      if (category) url.searchParams.append("category", category);
      if (search) url.searchParams.append("search", search);
      if (page) url.searchParams.append("page", String(page));
      if (limit) url.searchParams.append("limit", String(limit));
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch resources");
      const data = await res.json();
      return data;
    },
  });
}

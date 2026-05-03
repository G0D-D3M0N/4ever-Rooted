import { useUserContext } from "@/lib/user-context";

export function useUser() {
  return useUserContext();
}

import { createContext, useContext } from "react";

export type NormalizedUser = {
  id: string;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  isAdmin: boolean;
};

type UserContextValue = {
  user: NormalizedUser | null;
  isLoading: boolean;
  signOut: () => void;
};

export const UserContext = createContext<UserContextValue>({
  user: null,
  isLoading: false,
  signOut: () => {},
});

export function useUserContext(): UserContextValue {
  return useContext(UserContext);
}

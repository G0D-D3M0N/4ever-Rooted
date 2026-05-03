import { useUser, useAuth, useClerk } from "@clerk/clerk-react";
import { UserContext, type NormalizedUser } from "./user-context";
import type { ReactNode } from "react";

export function ClerkBridge({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();

  const normalizedUser: NormalizedUser | null =
    isSignedIn && user
      ? {
          id: user.id,
          username:
            user.username ||
            user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
            "user",
          email: user.primaryEmailAddress?.emailAddress ?? null,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          profileImageUrl: user.imageUrl ?? null,
          isAdmin: (user.publicMetadata as any)?.isAdmin === true,
        }
      : null;

  return (
    <UserContext.Provider
      value={{
        user: normalizedUser,
        isLoading: !isLoaded,
        signOut: () => signOut({ redirectUrl: "/" }),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

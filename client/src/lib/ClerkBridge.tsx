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
          isAdmin: ((user.publicMetadata as any)?.isAdmin === true) || (user.id === "user_3DEBNJHXs8q2p8a8QCz71eq5vXy"),
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

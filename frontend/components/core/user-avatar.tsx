import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown";
import { useModalStore } from "@/store/modalStore";
import { useCallback, useEffect, useState } from "react";
import { LoginModal } from "../layout/login-modal";
import { onAuthStateChanged, signOut } from "@/lib/firebase/auth";
import { UserIcon } from "lucide-react";
import { User } from "firebase/auth";

const LOGIN_MODAL_ID = "login-modal";

export function UserAvatar({
  className,
  ...props
}: React.ComponentProps<typeof Avatar>) {
  const [user, setUser] = useState<User | null>(null);
  const { open } = useModalStore((state) => state);

  const handleClickSignIn = useCallback(() => {
    open(LoginModal, LOGIN_MODAL_ID, { id: LOGIN_MODAL_ID });
  }, []);

  const handleClickSignOut = useCallback(() => {
    signOut();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className={className} {...props}>
            <AvatarImage asChild>
              <UserIcon />
            </AvatarImage>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Anonymous</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleClickSignIn}>
            Sign In
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user.displayName || user.email?.split("@")[0] || "User";
  const initials = getInitials(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          {user.photoURL && (
            <AvatarImage src={user.photoURL} alt={displayName} />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleClickSignOut}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

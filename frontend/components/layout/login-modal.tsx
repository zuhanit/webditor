import { X } from "lucide-react";
import { OAuthButtons } from "../core/oauth";
import { Button } from "../ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useModalStore } from "@/store/modalStore";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "@/lib/firebase/auth";

export function LoginModal({ id }: { id: string }) {
  const close = useModalStore((state) => state.close);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (!initialAuthChecked) {
        setInitialAuthChecked(true);
        return;
      }

      if (user) {
        close(id);
      }
    });

    return () => unsubscribe();
  }, [close, id, initialAuthChecked]);

  return (
    <Card className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md">
      <CardHeader>
        <CardTitle>Welcome back to Webditor</CardTitle>
        <CardDescription>
          Build your Starcraft Usemap with web-based Editor anywhere.
        </CardDescription>
        <CardAction>
          <Button variant="ghost" onClick={() => close(id)}>
            <X />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <OAuthButtons />
      </CardContent>
    </Card>
  );
}

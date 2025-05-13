"use client";

import api from "@/lib/api";
import { getUserIdToken } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/clientApp";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const unusedv = 1;

  const handleLoginWithEmailAndPassword = () =>
    signInWithEmailAndPassword(auth, email, password)
      .then(async () => {
        const token = await getUserIdToken();
        await api.get("/user/login", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .catch((reason) => {
        console.error("Failed to sign in:", reason);
      });

  return (
    <div>
      <h1>Login</h1>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLoginWithEmailAndPassword}>Login</button>
    </div>
  );
}

"use client";

import api from "@/lib/api";
import { getUserIdToken } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/clientApp";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signupWithEmail = () =>
    createUserWithEmailAndPassword(auth, email, password)
      .then(async () => {
        const token = await getUserIdToken();
        api.get("/user/login", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .catch((reason) => {
        console.error("Signup failed: ", reason.message);
      });

  return (
    <div>
      <h1>Signup</h1>
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
      <button onClick={signupWithEmail}>Sign Up</button>
    </div>
  );
}

"use client";

import { getUserIdToken } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/clientApp";
import axios from "axios";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react"

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginWithEmailAndPassword = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await getUserIdToken();
      const res = await axios.get("http://localhost:8000/api/v1/user/login", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err: any) {
      console.error("Failed to sign in:", err.message)
    }
  }
  
  return (
    <div>
      <h1>Login</h1>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLoginWithEmailAndPassword}>Login</button>
    </div>
  )  
}
"use client";

import { getUserIdToken } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/clientApp";
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth"
import { useState } from "react"

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const signupWithEmail = async () => {
    try {
      const userCrendential = await createUserWithEmailAndPassword(auth, email, password)
      const token = getUserIdToken();

      const res = await axios.get("http://localhost:8000/api/v1/user/login", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    } catch (err: any) {
      console.error("Signup failed:", err.message);
    }
  }

  return (
    <div>
      <h1>Signup</h1>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={signupWithEmail}>Sign Up</button>
    </div>
  )
}
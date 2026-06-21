import React, { useState } from "react";
import { useNavigate } from "../lib/router";
import { API_BASE } from "../api";

export default function EditorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function login() {
    try {
      const res = await fetch(`${API_BASE}/editors/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token) {
        localStorage.setItem("editorToken", data.token);
        navigate("/cms");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert("Server error");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-neutral-900 p-8 rounded w-96 space-y-4">
        <h2 className="text-2xl font-bold">Editor Login</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 bg-black border"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 bg-black border"
        />

        <button
          onClick={login}
          className="w-full text-black py-2 rounded font-bold"
          style={{ backgroundColor: "var(--veritas-red)" }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = "/admin";
      return;
    }

    const data = await res.json();
    setError(data.error || "Invalid password");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <form
        onSubmit={login}
        className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm"
      >
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="mt-2 text-sm text-gray-500">
          Sign in to manage Messenger bot rules.
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="mt-6 mb-2 block text-sm font-medium">
          Admin password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
        />

        <button
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

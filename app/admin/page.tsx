"use client";

import { useEffect, useState } from "react";

type Rule = {
  id: string;
  keyword: string;
  response: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export default function AdminPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [keyword, setKeyword] = useState("");
  const [response, setResponse] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadRules() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/rules", { cache: "no-store" });
    if (res.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load rules");
      setLoading(false);
      return;
    }
    setRules(data.rules);
    setLoading(false);
  }

  useEffect(() => {
    loadRules();
  }, []);

  function resetForm() {
    setKeyword("");
    setResponse("");
    setEditingId(null);
  }

  async function saveRule(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      keyword: keyword.trim(),
      response: response.trim(),
    };

    const url = editingId
      ? `/api/admin/rules/${editingId}`
      : "/api/admin/rules";

    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to save rule");
      setSaving(false);
      return;
    }

    resetForm();
    await loadRules();
    setSaving(false);
  }

  function editRule(rule: Rule) {
    setEditingId(rule.id);
    setKeyword(rule.keyword);
    setResponse(rule.response);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleRule(rule: Rule) {
    const res = await fetch(`/api/admin/rules/${rule.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !rule.enabled }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update rule");
      return;
    }

    await loadRules();
  }

  async function deleteRule(id: string) {
    if (!confirm("Delete this rule?")) return;

    const res = await fetch(`/api/admin/rules/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to delete rule");
      return;
    }

    await loadRules();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Messenger Bot Admin</h1>
            <p className="mt-1 text-gray-500">
              Manage keywords and automatic responses.
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-100"
          >
            Log out
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={saveRule}
          className="mb-8 rounded-xl border bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-xl font-semibold">
            {editingId ? "Edit rule" : "Add rule"}
          </h2>

          <label className="mb-2 block text-sm font-medium">Keyword</label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="secret"
            required
            className="mb-5 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
          />

          <label className="mb-2 block text-sm font-medium">Response</label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="ive spent 18 hours to do this"
            required
            rows={4}
            className="mb-5 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
          />

          <div className="flex gap-3">
            <button
              disabled={saving}
              className="rounded-lg bg-black px-5 py-3 font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Save changes" : "Add rule"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border px-5 py-3"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-xl font-semibold">Rules</h2>
          </div>

          {loading ? (
            <p className="p-6 text-gray-500">Loading...</p>
          ) : rules.length === 0 ? (
            <p className="p-6 text-gray-500">
              No rules yet. Add your first keyword above.
            </p>
          ) : (
            <div className="divide-y">
              {rules.map((rule) => (
                <div key={rule.id} className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center gap-3">
                        <code className="rounded bg-gray-100 px-2 py-1 font-mono">
                          {rule.keyword}
                        </code>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            rule.enabled
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {rule.enabled ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap break-words text-gray-700">
                        {rule.response}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => toggleRule(rule)}
                        className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        {rule.enabled ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => editRule(rule)}
                        className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

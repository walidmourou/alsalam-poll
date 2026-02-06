"use client";

import { useState } from "react";
import { formatDateForDisplay } from "@/lib/dates";
import { Volunteer } from "@/lib/types";
import { translations } from "@/lib/translations";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Record<string, Volunteer[]>>({});
  const [total, setTotal] = useState(0);
  const [locale, setLocale] = useState<"de" | "ar">("de");
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const result = await response.json();
        setAuthenticated(true);
        setData(result.data);
        setTotal(result.total);
      } else {
        setError(
          locale === "de" ? "Ungültiges Passwort" : "كلمة مرور غير صحيحة",
        );
      }
    } catch (err) {
      setError(locale === "de" ? "Ein Fehler ist aufgetreten" : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, fullName: string) => {
    const t = translations[locale];
    if (!confirm(`${t.confirmDelete} ${fullName}؟`)) {
      return;
    }

    setDeleting(id);
    setError("");

    try {
      const response = await fetch("/api/volunteers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });

      if (response.ok) {
        // Refresh data after deletion
        const adminResponse = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        if (adminResponse.ok) {
          const result = await adminResponse.json();
          setData(result.data);
          setTotal(result.total);
        }
      } else {
        const errorData = await response.json();
        const t = translations[locale];
        setError(errorData.error || t.deleteError);
      }
    } catch (err) {
      const t = translations[locale];
      setError(t.deletingError);
    } finally {
      setDeleting(null);
    }
  };

  const exportToCSV = () => {
    const csvRows = [
      ["Date", "Full Name", "Phone Number", "Registered At"].join(","),
    ];

    Object.entries(data).forEach(([date, volunteers]) => {
      volunteers.forEach((vol) => {
        csvRows.push(
          [date, vol.full_name, vol.phone_number, vol.created_at].join(","),
        );
      });
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ramadan-volunteers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const t = translations[locale];

  if (!authenticated) {
    return (
      <div
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="min-h-screen flex items-center justify-center bg-linear-to-b from-emerald-50 to-white"
      >
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-emerald-800">
              {t.adminLogin}
            </h1>
            <button
              onClick={() => setLocale(locale === "de" ? "ar" : "de")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-bold text-sm"
            >
              {t.languageSwitch}
            </button>
          </div>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                {t.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder={t.enterPassword}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-400 font-bold"
            >
              {loading ? t.loading : t.login}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const sortedDates = Object.keys(data).sort();

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-linear-to-b from-emerald-50 to-white p-8"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-emerald-800">
                {t.adminDashboard}
              </h1>
              <p className="text-gray-600 mt-2">
                {t.totalVolunteers}:{" "}
                <span className="font-bold text-emerald-600">{total}</span>
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setLocale(locale === "de" ? "ar" : "de")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold"
              >
                {t.languageSwitch}
              </button>
              <button
                onClick={exportToCSV}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-bold"
              >
                📊 {t.exportCSV}
              </button>
              <button
                onClick={() => {
                  setAuthenticated(false);
                  setPassword("");
                }}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-bold"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>

        {sortedDates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">{t.noVolunteersYet}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const volunteers = data[date];
              return (
                <div key={date} className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-emerald-700 mb-4">
                    {formatDateForDisplay(date, locale)}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {t.volunteersCount}:{" "}
                    <span className="font-bold">{volunteers.length}</span>
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-emerald-50 border-b-2 border-emerald-200">
                          <th className="text-left p-3 font-bold text-emerald-800">
                            #
                          </th>
                          <th className="text-left p-3 font-bold text-emerald-800">
                            {t.fullNameLabel}
                          </th>
                          <th className="text-left p-3 font-bold text-emerald-800">
                            {t.phoneNumberLabel}
                          </th>
                          <th className="text-left p-3 font-bold text-emerald-800">
                            {t.registeredAt}
                          </th>
                          <th className="text-left p-3 font-bold text-emerald-800">
                            {t.action}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {volunteers.map((vol, idx) => (
                          <tr
                            key={vol.id}
                            className="border-b hover:bg-emerald-50"
                          >
                            <td className="p-3 text-gray-700">{idx + 1}</td>
                            <td className="p-3 text-gray-900 font-semibold">
                              {vol.full_name}
                            </td>
                            <td className="p-3 text-gray-700">
                              {vol.phone_number}
                            </td>
                            <td className="p-3 text-gray-600 text-sm">
                              {new Date(vol.created_at).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() =>
                                  handleDelete(vol.id, vol.full_name)
                                }
                                disabled={deleting === vol.id}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition disabled:bg-gray-400 text-sm font-semibold"
                              >
                                {deleting === vol.id ? t.deleting : t.delete}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

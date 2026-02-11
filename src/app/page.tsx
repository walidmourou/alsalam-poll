"use client";

import { useState, useEffect, useRef } from "react";
import { translations, Locale } from "@/lib/translations";
import { formatDateForDisplay, getHijriDate } from "@/lib/dates";
import { DayInfo } from "@/lib/types";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("de");
  const [days, setDays] = useState<DayInfo[]>([]);
  const [eidDay, setEidDay] = useState<DayInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const t = translations[locale];

  useEffect(() => {
    fetchDays();
  }, []);

  useEffect(() => {
    if (selectedDay && firstNameInputRef.current) {
      // Scroll to the input field
      firstNameInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      // Focus on the input field
      setTimeout(() => {
        firstNameInputRef.current?.focus();
      }, 300); // Small delay to ensure smooth scroll completes
    }
  }, [selectedDay]);

  const fetchDays = async () => {
    try {
      const response = await fetch("/api/volunteers");
      const data = await response.json();
      setDays(data.days || []);
      setEidDay(data.eid || null);
    } catch (error) {
      console.error("Error fetching days:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDay,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.phoneNumber,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: t.successMessage });
        setFormData({ firstName: "", lastName: "", phoneNumber: "" });
        setSelectedDay(null);
        await fetchDays(); // Refresh the list
      } else {
        const error = await response.json();
        let errorText = t.errorMessage;
        if (error.error === "This day is already full") {
          errorText = t.dayFullError;
        } else if (error.error === "Already registered for this day") {
          errorText = t.alreadyRegisteredError;
        }
        setMessage({
          type: "error",
          text: errorText,
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: t.errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLocale = () => {
    setLocale(locale === "de" ? "ar" : "de");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">{translations.de.loading}</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-linear-to-b from-emerald-50 to-white ${locale === "ar" ? "rtl" : "ltr"}`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Language Toggle */}
      <div className="fixed top-3 right-3 z-50">
        <button
          onClick={toggleLocale}
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition shadow-md font-bold text-sm"
        >
          {t.languageSwitch}
        </button>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-2">
            {t.title}
          </h1>
          <p className="text-base text-gray-700 mb-4">{t.subtitle}</p>

          {/* Call to Action Box */}
          <div
            className="bg-white rounded-lg shadow-md p-4 mb-4"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <h2 className="text-lg md:text-xl font-bold text-emerald-700 mb-2">
              {t.callToAction}
            </h2>
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
              {t.description}
            </p>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-emerald-600">
                {t.volunteerDetails}
              </h3>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• {t.timeRequired}</li>
                <li>• {t.firstPeriod}</li>
                <li>• {t.secondPeriod}</li>
                <li>• {t.goal}</li>
              </ul>
            </div>

            <div className="mt-3">
              <h3 className="text-base font-bold text-emerald-600 mb-2">
                {t.howToParticipate}
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                {t.participateDescription}
              </p>
              <ol className="space-y-1 text-gray-700 text-sm">
                <li>1. {t.step1}</li>
                <li>2. {t.step2}</li>
                <li>3. {t.step3}</li>
              </ol>
            </div>
          </div>

          {/* WhatsApp Group Link */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md p-4 mb-4 border-2 border-green-300">
            <h3 className="text-base font-bold text-green-700 mb-2 flex items-center justify-center">
              {t.whatsappGroupTitle}
            </h3>
            <p className="text-sm text-gray-700 mb-3 text-center">
              {t.whatsappGroupMessage}
            </p>
            <div className="flex justify-center">
              <a
                href="https://chat.whatsapp.com/GFGWiytD5Ul5lNXMv0pdm1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition font-bold text-lg shadow-lg"
              >
                {t.joinGroup}
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded font-semibold">
              {t.eidVolunteerNote}
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
              {t.ramadanNote}
            </p>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {message.text}
          </div>
        )}

        {/* Registration Form */}
        {selectedDay && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-xl font-bold text-emerald-700 mb-4">
              {t.registrationForm}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-sm">
                  {t.selectDate}
                </label>
                <input
                  type="text"
                  value={
                    selectedDay === "EID"
                      ? `${t.eidDay} (${t.eidDateNote})`
                      : formatDateForDisplay(selectedDay, locale)
                  }
                  disabled
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-sm"
                />{" "}
                {selectedDay !== "EID" && (
                  <div className="text-xs text-emerald-600 font-semibold mt-1">
                    {(() => {
                      const hijri = getHijriDate(selectedDay, locale);
                      return `${hijri.day} ${hijri.month} ${hijri.year}`;
                    })()}
                  </div>
                )}{" "}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-sm">
                  {t.firstName}
                </label>
                <input
                  ref={firstNameInputRef}
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                  placeholder={t.firstName}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-sm">
                  {t.lastName}
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                  placeholder={t.lastName}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-sm">
                  {t.phoneNumber}
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                  placeholder="+49..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition disabled:bg-gray-400 font-bold text-sm inline-flex items-center justify-center"
                >
                  {submitting ? t.loading : t.submit}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition font-bold text-sm inline-flex items-center justify-center"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ramadan Days Grid */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-xl font-bold text-emerald-700 mb-4">
            {t.availableDays}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {days.map((day) => (
              <div
                key={day.date}
                className={`border rounded p-3 transition ${
                  day.isFull
                    ? "bg-gray-100 border-gray-300"
                    : "bg-emerald-50 border-emerald-300 hover:shadow-md"
                }`}
              >
                <div className="mb-2">
                  <div className="font-bold text-sm leading-tight text-gray-800">
                    {formatDateForDisplay(day.date, locale)}
                  </div>
                  <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                    {(() => {
                      const hijri = getHijriDate(day.date, locale);
                      return `${hijri.day} ${hijri.month} ${hijri.year}`;
                    })()}
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-xs text-gray-600">
                    {t.spotsRemaining}:{" "}
                    <span
                      className={`font-bold ${day.isFull ? "text-red-600" : "text-emerald-600"}`}
                    >
                      {day.isFull ? t.full : `${3 - day.count}/3`}
                    </span>
                  </div>
                </div>

                {day.volunteers.length > 0 && (
                  <div className="mb-2 text-xs">
                    <div className="font-semibold text-gray-700 mb-1">
                      {t.volunteers}:
                    </div>
                    <ul className="space-y-0.5">
                      {day.volunteers.map((vol, idx) => (
                        <li
                          key={idx}
                          className="text-gray-600 truncate"
                          title={`${vol.first_name} ${vol.last_name}`}
                        >
                          • {vol.first_name} {vol.last_name.charAt(0)}.
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!day.isFull && (
                  <button
                    onClick={() => setSelectedDay(day.date)}
                    className="w-full bg-emerald-600 text-white py-1.5 rounded hover:bg-emerald-700 transition font-semibold text-xs mt-2 flex items-center justify-center"
                  >
                    {t.registerForDay}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Eid al-Fitr Section - Separate and Independent */}
        {eidDay && (
          <div className="bg-linear-to-r from-amber-50 to-yellow-50 rounded-lg shadow-lg p-6 border-2 border-amber-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-amber-800 mb-1">
                  ✨ {t.eidSection}
                </h2>
                <p className="text-sm text-amber-700 font-semibold">
                  {t.eidDateNote}
                </p>
              </div>
            </div>

            <p className="text-base text-gray-700 mb-4">{t.eidDescription}</p>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                {t.volunteers}:{" "}
                <span className="font-bold text-amber-700">{eidDay.count}</span>
              </div>
              {eidDay.volunteers.length > 0 && (
                <div className="bg-white rounded p-3">
                  <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {eidDay.volunteers.map((vol, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {vol.first_name} {vol.last_name.charAt(0)}.
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedDay(eidDay.date)}
              className="w-full md:w-auto bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition font-bold text-base shadow-md flex items-center justify-center"
            >
              {t.registerForDay}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

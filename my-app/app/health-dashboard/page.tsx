



"use client";

import { useEffect, useRef, useState } from "react";
import MapComponent from "../../components/MapComponent";

type Suggestion = {
  name: string;
  lat: number;
  lon: number;
};

export default function HealthDashboardPage() {
  // inputs + UI state
  const [location, setLocation] = useState("");
  const [question, setQuestion] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [advice, setAdvice] = useState("");
  const [aiAdvice, setAiAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [aqi, setAqi] = useState<number | null>(null);
  const [traffic, setTraffic] = useState<number | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  // autocomplete state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // debounce
  const debounceRef = useRef<number | null>(null);

  // click outside to close suggestions
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // helper: debounced place search
  function scheduleSearchPlaces(query: string) {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    // set a new debounce
    debounceRef.current = window.setTimeout(() => {
      searchPlaces(query);
    }, 300); // 300ms debounce
  }

  // global search using Nominatim (OpenStreetMap)
  async function searchPlaces(query: string) {
    if (!query.trim()) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);

    try {
      // Nominatim policy: include a descriptive User-Agent
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=6&accept-language=en`;

      const res = await fetch(url, {
        headers: {
          // change "YourAppName" if you want; keep contact info in a real app
          "User-Agent": "Hackathon-SDGX-MyApp/1.0 (youremail@example.com)",
        },
      });

      if (!res.ok) {
        // gracefully handle errors (rate limit / 403)
        console.error("Nominatim search failed:", res.status, res.statusText);
        setSuggestions([]);
        setSearching(false);
        return;
      }

      const data = await res.json();

      const results: Suggestion[] = data.map((item: any) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));

      setSuggestions(results);
      setShowSuggestions(true);
      setActiveIndex(-1);
    } catch (err) {
      console.error("SearchPlaces error:", err);
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }

  // handle the main "Get Safety Score" action
  async function handleCheck() {
    if (!location.trim()) {
      alert("Please enter or select a location.");
      return;
    }

    setLoading(true);
    try {
      // Build query params (if coordinates available prefer them)
      const params = new URLSearchParams();
      params.set("location", location);
      params.set("question", question ?? "");

      if (coordinates) {
        params.set("lat", String(coordinates.lat));
        params.set("lon", String(coordinates.lon));
      }

      const res = await fetch(`/api/health?${params.toString()}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error: ${res.status} ${text}`);
      }

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      // Set UI state from API (guard for missing fields)
      setScore(
        typeof data.overallHealth === "number"
          ? Math.round(data.overallHealth)
          : Math.round(data.overallHealth ?? 0)
      );
      setAdvice(data.advice ?? "No advice available.");
      setAiAdvice(data.aiAdvice ?? "");
      setAqi(typeof data.aqi === "number" ? data.aqi : null);
      setTraffic(typeof data.congestionPercent === "number" ? data.congestionPercent : null);

      // If the API returned coordinates, use them; otherwise keep existing
      if (typeof data.lat === "number" && typeof data.lon === "number") {
        setCoordinates({ lat: data.lat, lon: data.lon });
      }
    } catch (err) {
      console.error("handleCheck error:", err);
      alert("Failed to fetch safety data. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  // choose a suggestion (click or keyboard)
  function chooseSuggestion(s: Suggestion) {
    setLocation(s.name);
    setCoordinates({ lat: s.lat, lon: s.lon });
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
  }

  // keyboard handling for input + suggestions
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((idx) => Math.min(idx + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((idx) => Math.max(idx - 1, 0));
    } else if (e.key === "Enter") {
      // choose the active suggestion if any
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        chooseSuggestion(suggestions[activeIndex]);
      } else {
        // no suggestion chosen, just run check
        handleCheck();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  }

  const scoreColor =
    score !== null
      ? score > 80
        ? "text-green-600"
        : score > 49
        ? "text-yellow-600"
        : score > 39
        ? "text-orange-600"
        : "text-red-600"
      : "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans">
      <main className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
        Healthy Trip Advisor:
        </h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
        AI-Powered Urban Travel Safety System
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-center">
          Type a location to get real-time air, traffic safety score, and AI advice.
        </p>

        {/* LOCATION INPUT WITH GLOBAL AUTOCOMPLETE */}
        <div ref={containerRef} className="relative">
          <label htmlFor="location" className="sr-only">
            Location
          </label>
          <input
            id="location"
            type="text"
            placeholder="Search any place worldwide..."
            value={location}
            onChange={(e) => {
              const v = e.target.value;
              setLocation(v);
              scheduleSearchPlaces(v);
              if (!v.trim()) {
                setSuggestions([]);
                setShowSuggestions(false);
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls="autocomplete-listbox"
            aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          />

          {/* suggestion dropdown */}
          {showSuggestions && (searching || suggestions.length > 0) && (
            <ul
              id="autocomplete-listbox"
              role="listbox"
              className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50"
            >
              {searching && (
                <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">Searching…</li>
              )}

              {!searching && suggestions.length === 0 && (
                <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">No results</li>
              )}

              {!searching &&
                suggestions.map((s, i) => (
                  <li
                    id={`suggestion-${i}`}
                    key={`${s.lat}-${s.lon}-${i}`}
                    role="option"
                    aria-selected={activeIndex === i}
                    onMouseDown={(ev) => {
                      // use onMouseDown to avoid input losing focus before click
                      ev.preventDefault();
                      chooseSuggestion(s);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`px-4 py-2 cursor-pointer truncate ${
                      activeIndex === i ? "bg-gray-100 dark:bg-gray-600" : "hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="text-sm leading-tight text-gray-800 dark:text-gray-200">{s.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{s.lat.toFixed(5)},{s.lon.toFixed(5)}</div>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* QUESTION INPUT */}
        <input
          type="text"
          placeholder="Ask the AI for advice (optional)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 transition"
        />

        <button
          onClick={handleCheck}
          disabled={loading}
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl shadow-md hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Checking..." : "Get Safety Score & Advice"}
        </button>

        {/* RESULTS */}
        {score !== null && (
          <div className="mt-4 p-6 rounded-xl bg-gray-50 dark:bg-gray-700 shadow-inner space-y-3 transition-all duration-300">
            <h2 className={`text-2xl font-bold ${scoreColor}`}>Safety Score: {score.toFixed(1)} / 100</h2>

            <p className="text-gray-700 dark:text-gray-300">{advice}</p>

            {aiAdvice && (
              <p className="text-gray-700 dark:text-gray-300">
                AI Advice: <strong>{aiAdvice}</strong>
              </p>
            )}

            {aqi !== null && (
              <p className="text-gray-600 dark:text-gray-400">
                Air Quality Index (AQI): <strong>{aqi}</strong>
              </p>
            )}

            {traffic !== null && (
              <p className="text-gray-600 dark:text-gray-400">
                Traffic Congestion: <strong>{traffic.toFixed(1)}%</strong>
              </p>
            )}

            {coordinates && (
              <p className="text-gray-500 dark:text-gray-400">
                Coordinates: {coordinates.lat.toFixed(5)}, {coordinates.lon.toFixed(5)}
              </p>
            )}
          </div>
        )}

        {/* MAP */}
        <div className="h-64 rounded-xl overflow-hidden">
          <MapComponent
            selectedLocation={coordinates ? { lat: coordinates.lat, lon: coordinates.lon, name: location } : null}
          />
        </div>
      </main>
    </div>
  );
}

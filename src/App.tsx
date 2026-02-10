import { useEffect, useMemo, useState } from "react";
import { useSensorSocket } from "./hooks/useSensorSocket";
import VibrationChart from "./components/VibrationChart";
import TemperatureChart from "./components/TemperatureChart";
import StatCard from "./components/StatCard";

const MAX_POINTS = 10; // ~last 2 minutes if 1/sec

type ViewMode = "live" | "history";

export default function App() {
  const { connected, vibration, temperature } = useSensorSocket();

  // Live series (socket)
  const [vibSeries, setVibSeries] = useState<any[]>([]);
  const [tempSeries, setTempSeries] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // History series (REST API)
  const [historyVib, setHistoryVib] = useState<any[]>([]);
  const [historyTemp, setHistoryTemp] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("live");

  // Filters for history
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // push incoming vibration samples into chart series
  useEffect(() => {
    if (!vibration?.values) return;

    const t = new Date(vibration.at ?? Date.now());

    setVibSeries((prev) => {
      const next = [
        ...prev,
        {
          time: t.toLocaleTimeString(),

          accelRms: vibration.values.accel.rms,
          accelMax: vibration.values.accel.max,
          accelPP: vibration.values.accel.peakToPeak,

          velocityRms: vibration.values.velocity.rms,
          crest: vibration.values.crestFactor,
        },
      ];
      return next.slice(-MAX_POINTS);
    });

    setLastUpdated(t);
  }, [vibration]);

  // push incoming temperature samples into chart series
  useEffect(() => {
    if (!temperature) return;
    const t = new Date();
    const value =
      typeof temperature === "number"
        ? temperature
        : Number(temperature.temperature ?? temperature.value ?? 0);

    setTempSeries((prev) => {
      const next = [
        ...prev,
        {
          time: t.toLocaleTimeString(),
          temperature: value,
        },
      ];
      return next.slice(-MAX_POINTS);
    });
    setLastUpdated(t);
  }, [temperature]);

  // Derived live stats
  const currentAccelRMS = useMemo(
    () => vibSeries.at(-1)?.accelRms ?? 0,
    [vibSeries]
  );

  const currentTemp = useMemo(
    () => tempSeries.at(-1)?.temperature ?? 0,
    [tempSeries]
  );

  // Derived history stats
  const maxTemp = useMemo(
    () =>
      historyTemp.length
        ? Math.max(...historyTemp.map((p: any) => p.temperature ?? 0))
        : 0,
    [historyTemp]
  );

  const maxRMS = useMemo(
    () =>
      historyVib.length
        ? Math.max(...historyVib.map((p: any) => p.rms ?? 0))
        : 0,
    [historyVib]
  );

  const tempDataToShow = viewMode === "live" ? tempSeries : historyTemp;
  const vibDataToShow = viewMode === "live" ? vibSeries : historyVib;

  async function loadHistory() {
    try {
      setLoadingHistory(true);
      setHistoryError(null);

      const params = new URLSearchParams();
      if (from) params.set("from", new Date(from).toISOString());
      if (to) params.set("to", new Date(to).toISOString());
      params.set("limit", "500");

      const [vibRes, tempRes] = await Promise.all([
        fetch(`${apiBase}/api/vibration/history?${params.toString()}`),
        fetch(`${apiBase}/api/temperature/history?${params.toString()}`),
      ]);

      if (!vibRes.ok || !tempRes.ok) {
        throw new Error("Failed to load history");
      }

      const vibJson = await vibRes.json();
      const tempJson = await tempRes.json();

      const vibPoints =
        (vibJson.data || []).map((s) => ({
          time: new Date(s.at).toLocaleTimeString(),

          accelRms: s.accel?.rms ?? 0,
          accelMax: s.accel?.max ?? 0,
          accelPP: s.accel?.peakToPeak ?? 0,

          velocityRms: s.velocity?.rms ?? 0,
          crest: s.crestFactor ?? 0,
        })) ?? [];

      const tempPoints =
        (tempJson.data || tempJson?.results || []).map((s: any) => ({
          time: new Date(s.timestamp).toLocaleTimeString(),
          temperature: Number(s.temperature ?? 0),
        })) ?? [];

      setHistoryVib(vibPoints);
      setHistoryTemp(tempPoints);
      setViewMode("history");
    } catch (err: any) {
      setHistoryError(err.message || "Unable to load history");
    } finally {
      setLoadingHistory(false);
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50">
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            IoT Sensor Dashboard
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            Live monitoring + historical analysis for vibration &amp;
            temperature
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-sm px-3 py-1 rounded-full ${
              connected
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {connected ? "Live: Connected" : "Live: Disconnected"}
          </span>
          <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("live")}
              className={`px-3 py-1 rounded-full ${
                viewMode === "live"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500"
              }`}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => setViewMode("history")}
              className={`px-3 py-1 rounded-full ${
                viewMode === "history"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500"
              }`}
            >
              History
            </button>
          </div>
        </div>
      </header>

      {/* Filters for history mode */}
      <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-semibold mb-1">Time range</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">From</label>
                <input
                  type="datetime-local"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="rounded-md border border-gray-200 px-2 py-1 text-xs md:text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">To</label>
                <input
                  type="datetime-local"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="rounded-md border border-gray-200 px-2 py-1 text-xs md:text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-end">
            <button
              type="button"
              onClick={loadHistory}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              disabled={loadingHistory}
            >
              {loadingHistory ? "Loading…" : "Load history"}
            </button>
            {historyError && (
              <span className="text-xs text-rose-600 max-w-xs">
                {historyError}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {viewMode === "live" ? (
          <>
            <StatCard
              title="Acceleration RMS"
              value={`${currentAccelRMS.toFixed(2)} mg`}
              subtitle="Latest vibration level"
              accent="blue"
            />

            <StatCard
              title="Temperature (Live)"
              value={`${currentTemp.toFixed(2)} °C`}
              subtitle="Current reading"
              accent="red"
            />
            <StatCard
              title="Last Update"
              value={lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
              subtitle="Timestamps are local"
              accent="green"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Max RMS"
              value={maxRMS ? maxRMS.toFixed(3) : "—"}
              subtitle="Highest RMS in selected range"
              accent="blue"
            />
            <StatCard
              title="Max Temperature"
              value={maxTemp ? `${maxTemp.toFixed(2)} °C` : "—"}
              subtitle="Highest temperature in selected range"
              accent="red"
            />
            <StatCard
              title="Samples"
              value={`${historyVib.length} vib / ${historyTemp.length} temp`}
              subtitle="Records in selected time range"
              accent="gray"
            />
          </>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        <VibrationChart data={vibDataToShow} />
        <TemperatureChart data={tempDataToShow} />
      </section>

      <footer className="mt-8 text-xs text-gray-500 space-y-1">
        <div>
          Backend (Socket.IO) at{" "}
          {import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"}
        </div>
        <div>REST API at {apiBase}</div>
      </footer>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useSensorSocket } from '../hooks/useSensorSocket';
import DashboardHeader from '../components/Header';
import LivePage from './LivePage';
import HistoryPage from './HistoryPage';
import { useAuth } from '../contexts/AuthContext';

const MAX_POINTS = 10; // ~last 2 minutes if 1/sec

type ViewMode = 'live' | 'history';

export default function ViewerDashboard() {
  const { user } = useAuth();
  const { connected, vibration, temperature } = useSensorSocket();

  // Live series (socket)
  const [vibSeries, setVibSeries] = useState<any[]>([]);
  const [tempSeries, setTempSeries] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // History series (REST API)
  const [historyVib, setHistoryVib] = useState<any[]>([]);
  const [historyTemp, setHistoryTemp] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('live');

  // Filters for history
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const apiBase = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

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
      typeof temperature === 'number'
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
    [vibSeries],
  );

  const currentTemp = useMemo(
    () => tempSeries.at(-1)?.temperature ?? 0,
    [tempSeries],
  );

  // Derived history stats
  const maxTemp = useMemo(
    () =>
      historyTemp.length
        ? Math.max(...historyTemp.map((p: any) => p.temperature ?? 0))
        : 0,
    [historyTemp],
  );

  const maxRMS = useMemo(
    () =>
      historyVib.length
        ? Math.max(...historyVib.map((p: any) => p.rms ?? 0))
        : 0,
    [historyVib],
  );

  const tempDataToShow = viewMode === 'live' ? tempSeries : historyTemp;
  const vibDataToShow = viewMode === 'live' ? vibSeries : historyVib;

  async function loadHistory() {
    try {
      setLoadingHistory(true);
      setHistoryError(null);

      const params = new URLSearchParams();
      if (from) params.set('from', new Date(from).toISOString());
      if (to) params.set('to', new Date(to).toISOString());
      params.set('limit', '500');

      const [vibRes, tempRes] = await Promise.all([
        fetch(`${apiBase}/api/vibration/history?${params.toString()}`),
        fetch(`${apiBase}/api/temperature/history?${params.toString()}`),
      ]);

      if (!vibRes.ok || !tempRes.ok) {
        throw new Error('Failed to load history');
      }

      const vibJson = await vibRes.json();
      const tempJson = await tempRes.json();

      const vibPoints =
        (vibJson.data || []).map((s: any) => ({
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
      setViewMode('history');
    } catch (err: any) {
      setHistoryError(err.message || 'Unable to load history');
    } finally {
      setLoadingHistory(false);
    }
  }

  const getDescription = () => {
    if (viewMode === 'live') {
      return vibSeries.length > 0
        ? `Live monitoring - ${lastUpdated?.toLocaleTimeString() || 'Connecting...'}`
        : connected
        ? 'Waiting for data...'
        : 'Connecting to live data stream...';
    } else {
      return historyVib.length > 0
        ? `Historical data analysis - ${historyVib.length} data points`
        : 'Select date range to view historical data';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <DashboardHeader
        mode={viewMode}
        onModeChange={setViewMode}
        description={getDescription()}
      />

      {viewMode === 'live' ? (
        <LivePage liveData={vibDataToShow} isLoading={!vibSeries.length} />
      ) : (
        <HistoryPage
          historyData={historyVib}
          isLoading={loadingHistory}
          error={historyError || undefined}
          fromDate={from}
          toDate={to}
          limit={500}
          onFromDateChange={setFrom}
          onToDateChange={setTo}
          onLimitChange={() => {}}
          onFetchHistory={loadHistory}
          onExport={() => {
            // Export functionality can be added here
            console.log('Export clicked');
          }}
        />
      )}
    </div>
  );
}

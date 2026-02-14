import React, { useState } from "react";
import * as XLSX from "xlsx";
import DashboardHeader from "./Header";
import LivePage from "../pages/LivePage";
import HistoryPage from "../pages/HistoryPage";

const VibrationDashboardWithHistory = ({ liveData }) => {
  const [mode, setMode] = useState("live");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [limit, setLimit] = useState(100);
  const [historyData, setHistoryData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Dynamic descriptions based on current state
  const getDescription = () => {
    if (mode === "live") {
      return liveData?.length > 0 
        ? `Live monitoring - ${new Date().toLocaleTimeString()}`
        : "Connecting to live data stream...";
    } else {
      return historyData?.length > 0
        ? `Historical data analysis`
        : "Select date range to view historical data";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const transformHistoryData = (apiResponse) => {
    return apiResponse.map((item) => ({
      time: formatTime(item.timestamp),
      rawTimestamp: item.timestamp,
      accelRms: item.accel?.rms,
      accelMax: item.accel?.max,
      accelPP: item.accel?.peakToPeak,
      crest: item.crestFactor,
      velocityRms: item.velocity?.rms,
    }));
  };

  const handleFetchHistory = async () => {
    if (!fromDate || !toDate) {
      setHistoryError("Please select both from and to dates");
      return;
    }
    setIsLoadingHistory(true);
    setHistoryError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SOCKET_URL}/api/vibration/history?from=${new Date(
          fromDate
        ).toISOString()}&to=${new Date(toDate).toISOString()}&limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      const transformed = transformHistoryData(data.data);
      setHistoryData(transformed);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleExportExcel = () => {
    if (!historyData.length) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Timestamp",
      "Accel RMS (mg)",
      "Accel Max (mg)",
      "Accel Peak-to-Peak (mg)",
      "Crest Factor",
      "Velocity RMS (mm/s)",
    ];
    
    const rows = historyData.map((d) => [
      d.rawTimestamp ? new Date(d.rawTimestamp).toLocaleString() : d.time,
      d.accelRms,
      d.accelMax,
      d.accelPP,
      d.crest,
      d.velocityRms,
    ]);

    const wsData = [headers, ...rows];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Vibration History");
    XLSX.writeFile(
      wb,
      `vibration_history_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6">
      <DashboardHeader
        mode={mode}
        onModeChange={setMode}
        description={getDescription()}
      />

      {mode === "live" ? (
        <LivePage liveData={liveData} isLoading={!liveData?.length} />
      ) : (
        <HistoryPage
          historyData={historyData}
          isLoading={isLoadingHistory}
          error={historyError}
          fromDate={fromDate}
          toDate={toDate}
          limit={limit}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onLimitChange={setLimit}
          onFetchHistory={handleFetchHistory}
          onExport={handleExportExcel}
        />
      )}
    </div>
  );
};

export default VibrationDashboardWithHistory;
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function Home() {
  const [data, setData] = useState([]);
  const [selectedPrst, setSelectedPrst] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const handleUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, {
        type: "binary",
        cellDates: true,
      });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const json = XLSX.utils.sheet_to_json(sheet, {
        raw: false,
      });

      const cleaned = json.map((row) => ({
        ...row,

        Prst: String(row["Prst"] || "").trim(),

        Stav: String(row["Stav"] || "").trim(),

        "Datum vytvoreni": row["Datum vytvoreni"]
          ? new Date(row["Datum vytvoreni"])
          : null,
      }));

      setData(cleaned);
    };

    reader.readAsBinaryString(file);
  };

  const prsty = [
    ...new Set(
      data
        .map((item) => String(item.Prst || "").trim())
        .filter((item) => item !== "" && item !== "undefined")
    ),
  ].sort();

  const statuses = useMemo(() => {
    return [...new Set(data.map((r) => r["Stav"]).filter(Boolean))];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const prstMatch =
        selectedPrst.length === 0 ||
        selectedPrst.includes(row["Prst"]);

      const statusMatch =
        selectedStatus === "ALL" ||
        row["Stav"] === selectedStatus;

      return prstMatch && statusMatch;
    });
  }, [data, selectedPrst, selectedStatus]);

  const prstStats = useMemo(() => {
    const counts = {};

    filteredData.forEach((row) => {
      const prst = row["Prst"] || "Unknown";

      counts[prst] = (counts[prst] || 0) + 1;
    });

    return Object.keys(counts)
      .map((key) => ({
        name: key,
        value: counts[key],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredData]);

  const statusStats = useMemo(() => {
    const counts = {};

    filteredData.forEach((row) => {
      const status = row["Stav"] || "Unknown";

      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
    }));
  }, [filteredData]);

  const timelineStats = useMemo(() => {
    const counts = {};

    filteredData.forEach((row) => {
      const created = row["Datum vytvoreni"];

      if (!created) return;

      const date = new Date(created);

      if (isNaN(date.getTime())) return;

      const hour = date.getHours();

      counts[hour] = (counts[hour] || 0) + 1;
    });

    return Object.keys(counts)
      .map((key) => ({
        hour: `${key}:00`,
        count: counts[key],
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [filteredData]);

  const topPrst = prstStats[0]?.name || "-";

  const colors = [
    "#2563eb",
    "#16a34a",
    "#f59e0b",
    "#dc2626",
    "#9333ea",
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>📦 Parcel Analytics</h2>

        <label className="uploadButton">
          Upload Excel

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleUpload}
          />
        </label>

        <div className="filterBox">
          <p>Prsty</p>

          <div className="checkboxList">
            {prsty.map((prst) => (
              <label key={prst} className="checkboxItem">
                <input
                  type="checkbox"
                  checked={selectedPrst.includes(prst)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPrst([
                        ...selectedPrst,
                        prst,
                      ]);
                    } else {
                      setSelectedPrst(
                        selectedPrst.filter(
                          (p) => p !== prst
                        )
                      );
                    }
                  }}
                />

                {prst}
              </label>
            ))}
          </div>
        </div>

        <div className="filterBox">
          <p>Status</p>

          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value)
            }
          >
            <option value="ALL">All</option>

            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
      </aside>

      <main className="content">
        <h1>Parcel Analytics Dashboard</h1>

        <div className="statsGrid">
          <div className="card">
            <h3>Balíky</h3>
            <p>{filteredData.length}</p>
          </div>

          <div className="card">
            <h3>Prsty</h3>
            <p>{prsty.length}</p>
          </div>

          <div className="card">
            <h3>Top Prst</h3>
            <p>{topPrst}</p>
          </div>

          <div className="card">
            <h3>Statusy</h3>
            <p>{statusStats.length}</p>
          </div>
        </div>

        <div className="chartsGrid">
          <div className="chartCard">
            <h3>Top prsty</h3>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={prstStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#4f46e5"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chartCard">
            <h3>Status Overview</h3>

            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={statusStats}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                >
                  {statusStats.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        colors[index % colors.length]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chartCard">
          <h3>Balíky podľa hodiny</h3>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={timelineStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="count"
                stroke="#4f46e5"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="tableCard">
          <h3>Data Preview</h3>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  {filteredData[0] &&
                    Object.keys(filteredData[0]).map(
                      (key) => (
                        <th key={key}>{key}</th>
                      )
                    )}
                </tr>
              </thead>

              <tbody>
                {filteredData
                  .slice(0, 50)
                  .map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map(
                        (value, i) => (
                          <td key={i}>
                            {value instanceof Date
                              ? value.toLocaleString()
                              : String(value)}
                          </td>
                        )
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

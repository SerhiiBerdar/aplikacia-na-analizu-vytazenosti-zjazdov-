
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Home() {
  const [data, setData] = useState([]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      setData(json);
    };

    reader.readAsBinaryString(file);
  };

  const chartData = useMemo(() => {
    const counts = {};

    data.forEach((row) => {
      const prst = row["Prst"] || "Unknown";
      counts[prst] = (counts[prst] || 0) + 1;
    });

    return Object.keys(counts).map((key) => ({
      prst: key,
      count: counts[key]
    }));
  }, [data]);

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

        <p className="info">
          Nahraj Excel súbor a dashboard automaticky zobrazí analýzu.
        </p>
      </aside>

      <main className="content">
        <h1>Dashboard</h1>

        <div className="stats">
          <div className="card">
            <h3>Počet riadkov</h3>
            <p>{data.length}</p>
          </div>

          <div className="card">
            <h3>Počet prstov</h3>
            <p>{new Set(data.map((r) => r["Prst"])).size}</p>
          </div>
        </div>

        <div className="chartCard">
          <h3>Balíky podľa prsta</h3>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis dataKey="prst" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="tableCard">
          <h3>Dáta</h3>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  {data[0] &&
                    Object.keys(data[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {data.slice(0, 30).map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{String(value)}</td>
                    ))}
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

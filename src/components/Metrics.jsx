"use client";

import { useEffect, useState } from "react";
import { Activity, Database, Zap, Users } from "lucide-react";

const metricsData = [
  { label: "Companies Analyzed", value: 12453, icon: Database, color: "var(--emerald-400)" },
  { label: "Active Models", value: 4, icon: Zap, color: "var(--amber-400)" },
  { label: "Tokens Processed", value: 1450200, icon: Activity, color: "var(--blue-400)" },
  { label: "Active Users", value: 892, icon: Users, color: "var(--red-400)" },
];

export default function Metrics() {
  const [metrics, setMetrics] = useState(metricsData);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          if (m.label === "Companies Analyzed") {
            return { ...m, value: m.value + Math.floor(Math.random() * 2) };
          }
          if (m.label === "Tokens Processed") {
            return { ...m, value: m.value + Math.floor(Math.random() * 5000) };
          }
          if (m.label === "Active Users") {
            return { ...m, value: m.value + (Math.random() > 0.5 ? 1 : -1) };
          }
          return m;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "24px",
      width: "100%",
      maxWidth: "1000px",
      margin: "0 auto",
      position: "relative",
      zIndex: 1,
    }}>
      {metrics.map((metric, i) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="glass-card animate-fade-in-up" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px", animationDelay: `${i * 0.1}s` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: `color-mix(in srgb, ${metric.color} 15%, transparent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: metric.color,
              }}>
                <Icon size={20} />
              </div>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-secondary)" }}>
                {metric.label}
              </span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-primary)", fontFamily: "monospace" }}>
              {metric.value.toLocaleString('en-US')}
            </div>
          </div>
        );
      })}
    </div>
  );
}

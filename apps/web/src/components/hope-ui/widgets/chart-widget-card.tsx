"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type HopeColor = "primary" | "info" | "success" | "warning" | "danger";

const colorMap: Record<HopeColor, string> = {
  danger: "#c03221",
  info: "#079aa2",
  primary: "#3a57e8",
  success: "#1aa053",
  warning: "#f16a1b",
};

type ChartWidgetCardProps = {
  title: string;
  value: string;
  badge: string;
  color: HopeColor;
  data: number[];
};

export function ChartWidgetCard({ title, value, badge, color, data }: ChartWidgetCardProps) {
  return (
    <div className="card hope-widget-card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <span className="fw-semibold">{title}</span>
            <h2 className="counter mt-2 mb-0">{value}</h2>
          </div>
          <span className={`badge bg-${color}`}>{badge}</span>
        </div>
        <div className="hope-sparkline mt-3">
          <Chart
            height={86}
            options={{
              chart: { sparkline: { enabled: true }, toolbar: { show: false } },
              colors: [colorMap[color]],
              dataLabels: { enabled: false },
              fill: {
                gradient: { opacityFrom: 0.5, opacityTo: 0, shadeIntensity: 1 },
                type: "gradient",
              },
              stroke: { curve: "smooth", width: 3 },
              tooltip: { x: { show: false } },
            }}
            series={[{ data, name: title }]}
            type="area"
          />
        </div>
      </div>
    </div>
  );
}

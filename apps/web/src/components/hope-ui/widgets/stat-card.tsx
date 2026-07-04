type HopeColor = "primary" | "info" | "success" | "warning" | "danger";

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  color: HopeColor;
  trend?: "up" | "down";
  progress: number;
};

function TrendIcon({ trend = "up" }: { trend?: "up" | "down" }) {
  const path =
    trend === "down" ? "M19 14l-7 7m0 0l-7-7m7 7V3" : "M5 10l7-7m0 0l7 7m-7-7v18";

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="20"
    >
      <path d={path} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export function StatCard({
  title,
  value,
  change,
  color,
  trend = "up",
  progress,
}: StatCardProps) {
  return (
    <div className="card hope-widget-card h-100">
      <div className="card-body">
        <div className="text-center text-muted">{title}</div>
        <div className="d-flex align-items-center justify-content-between mt-3">
          <div>
            <h2 className="counter mb-1">{value}</h2>
            <span className={`text-${color}`}>{change}</span>
          </div>
          <div className={`border bg-soft-${color} rounded p-3 text-${color}`}>
            <TrendIcon trend={trend} />
          </div>
        </div>
        <div className="mt-4">
          <div
            aria-label={`${title} ilerleme`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            className={`progress bg-soft-${color} shadow-none w-100 hope-progress`}
            role="progressbar"
          >
            <div className={`progress-bar bg-${color}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

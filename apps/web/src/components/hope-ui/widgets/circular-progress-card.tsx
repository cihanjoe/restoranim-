type HopeColor = "primary" | "info" | "success" | "warning" | "danger";

const colorMap: Record<HopeColor, string> = {
  danger: "#c03221",
  info: "#079aa2",
  primary: "#3a57e8",
  success: "#1aa053",
  warning: "#f16a1b",
};

type CircularProgressCardProps = {
  title: string;
  value: string;
  detail: string;
  progress: number;
  color: HopeColor;
};

export function CircularProgressCard({
  title,
  value,
  detail,
  progress,
  color,
}: CircularProgressCardProps) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(progress, 0), 100) / 100) * circumference;

  return (
    <div className={`card hope-widget-card bg-soft-${color} h-100`}>
      <div className="card-body d-flex align-items-center justify-content-between gap-3">
        <div>
          <span className="text-muted">{title}</span>
          <h2 className="counter mt-2 mb-1">{value}</h2>
          <div className={`badge bg-${color}`}>{detail}</div>
        </div>
        <div className="hope-circular-progress" style={{ color: colorMap[color] }}>
          <svg aria-label={`${title} ${progress}%`} role="img" viewBox="0 0 100 100">
            <circle className="hope-circular-track" cx="50" cy="50" r={radius} />
            <circle
              className="hope-circular-value"
              cx="50"
              cy="50"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <strong>{progress}%</strong>
        </div>
      </div>
    </div>
  );
}

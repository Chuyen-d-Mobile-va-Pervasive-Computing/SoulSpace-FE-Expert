import StatCard from "./StatCard";

export default function AveragePositiveStat({
  period,
  value,
  percent,
  trend,
}: {
  period: string; // "week" | "month" | "year"
  value: string;
  percent: string;
  trend: "up" | "down" | "equal";
}) {
  return (
    <StatCard
      title="Average Positive Emotion"
      value={value}
      percent={percent}
      change={trend}
      bg="bg-[#ffffff]"
      compareText={`compare to last ${period}`}
    />
  );
}

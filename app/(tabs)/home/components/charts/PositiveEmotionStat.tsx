import StatCard from "./StatCard";

export default function PositiveEmotionStat({
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
      title="Positive"
      value={value}
      percent={percent}
      change={trend}
      bg="bg-[#ffffff]"
      compareText={`compare to last ${period}`}
    />
  );
}

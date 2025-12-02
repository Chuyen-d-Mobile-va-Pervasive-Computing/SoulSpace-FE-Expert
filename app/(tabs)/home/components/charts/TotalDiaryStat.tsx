import StatCard from "./StatCard";

export default function TotalDiaryStat({
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
      title="Total Diary Entries"
      value={value}
      percent={percent}
      change={trend}
      bg="bg-[#ffffff]"
      compareText={`compare to last ${period}`}
    />
  );
}

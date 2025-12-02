import React from "react";
import EmotionLineChart from "./charts/EmotionLineChart";
import EmotionMonthChart from "./charts/EmotionMonthChart";
import EmotionYearChart from "./charts/EmotionYearChart";

export default function EmotionChartWrapper({ type }: { type: "week" | "month" | "year" }) {
  if (type === "week") return <EmotionLineChart />;
  if (type === "month") return <EmotionMonthChart />;
  return <EmotionYearChart />;
}
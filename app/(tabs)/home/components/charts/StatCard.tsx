import { TrendingDown, TrendingUp } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

interface StatCardProps {
  title: string;
  value: string;
  percent: string;
  change: "up" | "down" | "equal";
  bg: string;
  compareText?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  percent,
  change,
  bg,
  compareText = "so với tháng trước",
}) => {
  return (
    <View className={`p-6 rounded-2xl shadow-md ${bg} hover:shadow-lg`}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-base font-[Poppins-SemiBold] text-gray-700">
          {title}
        </Text>
      </View>

      <View className="flex-row wfull justify-between items-center mb-2">
        {/* Value */}
        <Text className="text-3xl font-[Poppins-Bold] text-gray-900 mb-2">
          {value} days
        </Text>
        {/* Change */}
        <View
          className={`flex-row items-center gap-2 mb-1 px-4 py-1 rounded-full ${
            change === "up"
              ? "bg-[#E8FFEB]"
              : change === "down"
                ? "bg-[#FFE9F2]"
                : ""
          }`}
        >
          {change === "up" ? (
            <TrendingUp color="#22c55e" />
          ) : change === "down" ? (
            <TrendingDown color="#ef4444" />
          ) : null}
          <Text
            className={`text-lg font-[Poppins-SemiBold] ${
              change === "up"
                ? "text-green-600"
                : change === "down"
                  ? "text-red-500"
                  : "text-gray-500"
            }`}
          >
            {percent}
          </Text>
        </View>
      </View>

      {/* Compare text */}
      <Text className="text-sm text-gray-500 font-[Poppins-Regular]">
        {compareText}
      </Text>
    </View>
  );
};

export default StatCard;

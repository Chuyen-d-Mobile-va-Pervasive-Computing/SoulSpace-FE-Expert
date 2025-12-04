import React from "react";
import { Text, View } from "react-native";

interface StatsCardProps {
  value: string | number;
  label: string;
  glowColor?: string;
}

export default function StatsCard({
  value,
  label,
  glowColor = "#7F56D9",
}: StatsCardProps) {
  return (
    <View
      className="flex-1 mx-1 bg-white rounded-2xl p-5"
      style={{
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 30,
        elevation: 16,
      }}
    >
      <Text
        className="text-center font-[Poppins-Bold] text-3xl mb-2"
        style={{ color: glowColor }}
      >
        {value}
      </Text>

      <Text className="text-center font-[Poppins-SemiBold] text-gray-700">
        {label}
      </Text>
    </View>
  );
}

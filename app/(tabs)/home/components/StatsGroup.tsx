import React from "react";
import { View } from "react-native";
import StatsCard from "./StatsCard";

export default function StatsGroup() {
  return (
    <View className="flex-row mt-6">
      <StatsCard value="2" label="Appointments Today" glowColor="#34D1BF" />
      <StatsCard value="$500" label="Balance" glowColor="#FFB34D" />
    </View>
  );
}

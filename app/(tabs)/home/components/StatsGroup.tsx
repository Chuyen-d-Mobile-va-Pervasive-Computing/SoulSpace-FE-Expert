import React from "react";
import { View } from "react-native";
import StatsCard from "./StatsCard";

export default function StatsGroup({ stats }: { stats: any }) {
  return (
    <View className="flex-row mt-6">
      <StatsCard
        value={stats?.appointments_today ?? 0}
        label="Appointments Today"
        glowColor="#34D1BF"
      />

      <StatsCard
        value={`$${stats?.balance ?? 0}`}
        label="Balance"
        glowColor="#FFB34D"
      />
    </View>
  );
}

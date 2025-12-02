import Heading from "@/components/Heading";
import WeekMonthYearSelector from "@/components/WeekMonthYearSelector";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import EmotionChartWrapper from "./components/EmotionChartWrapper";
import AveragePositiveStat from "./components/charts/AveragePositiveStat";
import NegativeEmotionStat from "./components/charts/NegativeEmotionStat";
import PositiveEmotionStat from "./components/charts/PositiveEmotionStat";
import TotalDiaryStat from "./components/charts/TotalDiaryStat";

export default function AnalyticScreen() {
  const { tab: initialTab } = useLocalSearchParams<{
    tab?: "week" | "month" | "year";
  }>();
  const [tab, setTab] = useState<"week" | "month" | "year">("week");
  useEffect(() => {
    if (
      initialTab === "week" ||
      initialTab === "month" ||
      initialTab === "year"
    ) {
      setTab(initialTab);
    }
  }, [initialTab]);
  return (
    <View className="flex-1 bg-[#FAF9FF]">
      <Heading title="Analytic" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1 px-4 mt-4"
      >
        {/* Tabs */}
        <View className="flex-row mb-4 bg-purple-100 rounded-full overflow-hidden">
          {["week", "month", "year"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t as any)}
              className={`flex-1 py-2 ${
                tab === t ? "bg-[#7F56D9]" : "bg-purple-100"
              }`}
            >
              <Text
                className={`text-center font-[Poppins-Bold] ${
                  tab === t ? "text-white" : "text-[#7F56D9]"
                }`}
              >
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <WeekMonthYearSelector
          mode={tab}
          onChange={(range) => {
            console.log(`Selected ${tab}:`, range);
          }}
        />

        {/* Chart */}
        <View className="mb-6">
          <EmotionChartWrapper type={tab} />
        </View>

        {/* Stats */}
        <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tab === "week" && (
            <>
              <PositiveEmotionStat
                period="week"
                value="65"
                percent="5%"
                trend="up"
              />
              <NegativeEmotionStat
                period="week"
                value="35"
                percent="15%"
                trend="down"
              />
            </>
          )}
          {tab === "month" && (
            <>
              <PositiveEmotionStat
                period="month"
                value="70"
                percent="2%"
                trend="up"
              />
              <TotalDiaryStat
                period="month"
                value="10"
                percent="2%"
                trend="up"
              />
            </>
          )}
          {tab === "year" && (
            <AveragePositiveStat
              period="year"
              value="65%"
              percent="-"
              trend="equal"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

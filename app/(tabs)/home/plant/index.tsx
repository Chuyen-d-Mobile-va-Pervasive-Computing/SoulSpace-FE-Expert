"use client";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { Sun, ArrowLeft } from "lucide-react-native";
import { FontAwesome } from "@expo/vector-icons";

import Plant1 from "@/assets/images/plant1.svg";
import Plant2 from "@/assets/images/plant2.svg";
import Plant3 from "@/assets/images/plant3.svg";
import Plant4 from "@/assets/images/plant4.svg";
import Plant5 from "@/assets/images/plant5.svg";
import Plant6 from "@/assets/images/plant6.svg";
import Plant7 from "@/assets/images/plant7.svg";
import Plant8 from "@/assets/images/plant8.svg";

const API_BASE = process.env.EXPO_PUBLIC_API_PATH;

export default function PlantScreen() {
  const [level, setLevel] = useState(1);
  const [currentXp, setCurrentXp] = useState(0);
  const [nextLevelXp, setNextLevelXp] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [canWater, setCanWater] = useState(true);
  const [backendMessage, setBackendMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const PlantImages = {1: Plant1,2: Plant2,3: Plant3,4: Plant4,5: Plant5,6: Plant6,7: Plant7,8: Plant8};
  const CurrentPlant = PlantImages[level as keyof typeof PlantImages] || Plant1;

  useEffect(() => {
    const fetchTreeStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/api/v1/tree/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) return;

        setLevel(data.current_level_calculated);
        setCurrentXp(data.current_xp_in_level);
        setNextLevelXp(data.xp_for_next_level);
        setStreakDays(data.streak_days);
        setCanWater(data.can_water_today);

        if (!data.can_water_today && data.detail) {
          setBackendMessage(data.detail);
          Toast.show({
            type: "info",
            text1: data.detail,
            position: "bottom"
          });
        }

      } catch (err) {
        console.error("Fetch tree error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTreeStatus();
  }, []);

  const progress = nextLevelXp > 0 ? (currentXp / nextLevelXp) * 100 : 0;

  if (loading)
    return (
      <View className="flex-1 bg-[#FAF9FF] items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <View className="flex-1 bg-[#FAF9FF]">
      <View className="flex-row items-center justify-between py-4 px-4 border-b border-gray-200 mt-8">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
            <ArrowLeft width={36} height={36} />
          </TouchableOpacity>
          <Text
            className="ml-3 text-2xl text-[#7F56D9]"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Plant
          </Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="flex-1 px-4">
        <View className="py-3 px-1 gap-8 items-center">

          <View className="mt-10">
            <CurrentPlant width={200} height={250} />
          </View>

          <View className="w-full p-3">
            <View className="flex-row justify-between items-center mb-1">
              <View className="flex-row items-center">
                <Text className="text-[#4F3422] font-[Poppins-Medium] text-base mr-2">
                  Level {level}:
                </Text>
                <FontAwesome name="tree" size={14} color="#4A3728" style={{ marginRight: 4 }} />
                <Text className="text-[#4F3422] font-[Poppins-Medium] text-base">
                  {currentXp}/{nextLevelXp} XP
                </Text>
              </View>
              <View className="flex-row items-center">
                <Sun strokeWidth={1.5} color="#ABABAB" />
                <Text className="text-[#ABABAB] font-[Poppins-Medium] text-base ml-2">
                  {streakDays} Day Streak
                </Text>
              </View>
            </View>
            <View className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
              <View className="h-3 rounded-full" style={{ width: `${progress}%`, backgroundColor: "#7CB342" }} />
            </View>

            <View className="flex-row justify-center mt-14">
              <TouchableOpacity
                disabled={!canWater}
                className={`h-16 rounded-xl items-center justify-center w-full ${
                  canWater ? "bg-[#7F56D9]" : "bg-gray-400"
                }`}
                onPress={() => router.push("/(tabs)/home/plant/list")}
              >
                <Text className="text-white font-[Poppins-Bold] text-base">
                  {canWater ? "Nourish Your Tree Today" : backendMessage || "Come Back Tomorrow"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </View>
  );
}
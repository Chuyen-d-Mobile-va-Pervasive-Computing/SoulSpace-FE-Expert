"use client";

import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// SVGs
import Plant1 from "@/assets/images/plant1.svg";
import Plant2 from "@/assets/images/plant2.svg";
import Plant3 from "@/assets/images/plant3.svg";
import Plant4 from "@/assets/images/plant4.svg";
import Plant5 from "@/assets/images/plant5.svg";
import Plant6 from "@/assets/images/plant6.svg";
import Plant7 from "@/assets/images/plant7.svg";
import Plant8 from "@/assets/images/plant8.svg";
import WaterDrop from "@/assets/images/water.svg";

SplashScreen.preventAutoHideAsync();
const { height } = Dimensions.get("window");
const API_BASE = process.env.EXPO_PUBLIC_API_PATH;

export default function ActionScreen() {
  const [currentXp, setCurrentXp] = useState(0);
  const [addedXp, setAddedXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextLevelXp, setNextLevelXp] = useState(50);
  const [progress, setProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [showDrop, setShowDrop] = useState(true);
  const [showXpText, setShowXpText] = useState(false);
  const [loading, setLoading] = useState(true);

  const xpThresholds = [0, 50, 100, 200, 300, 500, 1000, 2000];
  const getLevel = (xp: number) => {
    let lvl = 1;
    for (let i = 1; i < xpThresholds.length; i++) {
      if (xp >= xpThresholds[i]) lvl = i + 1;
    }
    return lvl > 8 ? 8 : lvl;
  };

  const PlantImages = {
    1: Plant1,
    2: Plant2,
    3: Plant3,
    4: Plant4,
    5: Plant5,
    6: Plant6,
    7: Plant7,
    8: Plant8,
  };
  const PlantToShow = PlantImages[level as keyof typeof PlantImages];

  const dropY = useSharedValue(height * 0.1);
  const xpTranslateY = useSharedValue(0);

  useEffect(() => {
    const fetchTreeStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) throw new Error("No token");

        const [res, prevXpStr] = await Promise.all([
          fetch(`${API_BASE}/api/v1/tree/status`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          AsyncStorage.getItem("prev_total_xp"),
        ]);

        const data = await res.json();
        if (!res.ok) {
          console.warn("Fetch tree failed:", data);
          return;
        }

        const prevXp = prevXpStr ? parseInt(prevXpStr, 10) : data.total_xp - 10;
        const added = Math.max(data.total_xp - prevXp, 0);

        setCurrentXp(prevXp);
        setAddedXp(added);
        const lvl = getLevel(data.total_xp);
        setLevel(lvl);
        setNextLevelXp(data.xp_for_next_level);

        const pct =
          ((prevXp - xpThresholds[lvl - 1]) /
            (data.xp_for_next_level - xpThresholds[lvl - 1])) *
          100;
        setProgress(pct);
      } catch (err) {
        console.error("Fetch tree error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTreeStatus();
  }, []);

  // Animation XP + drop
  useEffect(() => {
    if (loading) return;

    dropY.value = withTiming(
      height * 0.3,
      { duration: 1500, easing: Easing.out(Easing.quad) },
      () => {
        runOnJS(setShowDrop)(false);
        runOnJS(setShowXpText)(true);
        xpTranslateY.value = withTiming(-40, { duration: 1000 });
      }
    );

    const timeout = setTimeout(() => {
      let value = currentXp;
      const interval = setInterval(() => {
        value += 1;
        const newXp = Math.min(currentXp + addedXp, value);
        const newLevel = getLevel(newXp);
        const newNext = newLevel < 8 ? xpThresholds[newLevel] : xpThresholds[7];
        const newCurrent = xpThresholds[newLevel - 1] || 0;
        const pct = ((newXp - newCurrent) / (newNext - newCurrent)) * 100;

        setCurrentXp(newXp);
        setLevel(newLevel);
        setProgress(pct);

        if (value >= currentXp + addedXp) {
          clearInterval(interval);
          setShowButton(true);
        }
      }, 100);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [loading]);

  const dropStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dropY.value }],
  }));
  const xpStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: xpTranslateY.value }],
  }));

  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF9FF]">
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#FAF9FF" }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      extraScrollHeight={50}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
    >
      <View className="flex-1 bg-[#FAF9FF]">
        <View className="flex-row items-center justify-between py-4 px-4 border-b border-gray-200 mt-8">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.push("/(tabs)/home/plant")}>
              <ArrowLeft width={36} height={36} />
            </TouchableOpacity>
            <Text
              className="ml-3 text-2xl text-[#7F56D9]"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              Plant Tree
            </Text>
          </View>
        </View>
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 40, alignItems: "center" }}
        >
          {/* Plant */}
          <View className="mt-16">
            <PlantToShow width={200} height={250} />
          </View>

          {/* +XP Text */}
          {showXpText && (
            <Animated.Text
              style={[
                xpStyle,
                {
                  position: "absolute",
                  top: height * 0.38,
                  fontSize: 24,
                  fontFamily: "Poppins-Bold",
                  color: "#7CB342",
                },
              ]}
            >
              +{addedXp} XP
            </Animated.Text>
          )}

          {/* Water Drop */}
          {showDrop && (
            <Animated.View
              style={[dropStyle, { position: "absolute", left: "50%", marginLeft: -30 }]}
            >
              <WaterDrop width={60} height={60} />
            </Animated.View>
          )}

          {/* XP display */}
          <Text className="mt-8 text-[#4F3422] font-[Poppins-Medium] text-base">
            {currentXp}/{nextLevelXp} XP
          </Text>

          {/* Progress bar */}
          <View className="mt-2 w-full px-6">
            <View className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
              <View
                style={{
                  width: `${progress}%`,
                  backgroundColor: "#7CB342",
                  height: "100%",
                }}
              />
            </View>
          </View>

          <Text className="font-[Poppins-Bold] text-[#4F3422] text-xl mt-10 text-center">
            Your tree has grown more! Keep cultivating positivity.
          </Text>

          {showButton && (
            <TouchableOpacity
              className="bg-[#7F56D9] h-14 rounded-xl mt-10 items-center justify-center w-full"
              onPress={() => router.replace("/(tabs)/home/plant")}
            >
              <Text className="text-white font-[Poppins-Bold] text-base">
                Turn Back to My Tree
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </KeyboardAwareScrollView>
  );
}
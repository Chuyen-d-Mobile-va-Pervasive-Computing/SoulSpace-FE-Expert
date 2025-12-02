import React, { useCallback, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Modal,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import dayjs from "dayjs";
import { emotionMap } from "@/constants/EmotionMap";
import TagSelector from "@/components/TagSelector";
import { router, useFocusEffect } from "expo-router";
import Heading from "@/components/Heading";
import { Plus, SlidersHorizontal } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_PATH;

function normalizeEmotionLabel(label?: string) {
  if (!label) return "";
  return label.trim().toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export default function Calendar() {
  const [entries, setEntries] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<"recent" | "older">("recent");
  const animValue = useRef(new Animated.Value(1)).current;
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const year = currentDate.year();
  const month = currentDate.month();
  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfWeek = dayjs(new Date(year, month, 1)).day();

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem("access_token");
    } catch (err) {
      console.error("Failed to get token", err);
      return null;
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const token = await getToken();
          const res = await fetch(`${API_BASE}/api/v1/journal/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            console.warn("Failed to fetch journals", res.status);
            return;
          }
          const json = await res.json();
          setEntries(json || []);
        } catch (err) {
          console.log("Error loading journals", err);
        }
      };

      loadData();
    }, [])
  );

  const sortedEntries = useMemo(() => {
    const arr = [...entries];
    return arr.sort((a, b) => {
      if (sortOrder === "recent") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [entries, sortOrder]);
  
  const entryMap = useMemo(() => {
    const map: Record<number, any> = {};
    (sortedEntries || []).reverse().forEach((e) => {
      const d = dayjs(e.created_at);
      if (d.isValid() && d.year() === year && d.month() === month) {
        const day = d.date();
        if (!map[day]) {
          map[day] = e;
        }
      }
    });

    return map;
  }, [entries, year, month]);

  const triggerAnim = (dir: "next" | "prev") => {
    setDirection(dir);
    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const goPrev = () => {
    triggerAnim("prev");
    setCurrentDate((p) => p.subtract(1, "month"));
  };

  const goNext = () => {
    triggerAnim("next");
    setCurrentDate((p) => p.add(1, "month"));
  };

  const goCreate = (day: number) => {
    const dateStr = dayjs(new Date(year, month, day)).format("YYYY-MM-DD");
    router.push(`/(tabs)/diary?date=${dateStr}`);
  };

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: direction === "next" ? [50, 0] : [-50, 0],
  });

  const cellWidth = `${100 / 7}%`;

  return (
    <View className="flex-1 bg-[#FAF9FF]">
      <Heading title="Diary" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginBottom: 32,
            borderRadius: 12,
            backgroundColor: "#7F56D9",
          }}
        >
          <TouchableOpacity onPress={goPrev}>
            <Text className="text-3xl font-[Poppins-Regular] text-white">{"<"}</Text>
          </TouchableOpacity>
          <Text className="text-lg font-[Poppins-Regular] text-white">
            {currentDate.format("MMMM YYYY")}
          </Text>
          <TouchableOpacity onPress={goNext}>
            <Text className="text-3xl font-[Poppins-Regular] text-white">{">"}</Text>
          </TouchableOpacity>
        </View>

        {/* week labels */}
        <View className="flex-row mb-1.5">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
            <Text
              key={d}
              className="text-center text-xs text-gray-500 font-[Poppins-Regular]"
              style={{ width: cellWidth }}
            >
              {d}
            </Text>
          ))}
        </View>

        {/* dates grid */}
        <Animated.View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            transform: [{ translateX }],
            opacity: animValue,
          }}
        >
          {/* empty offsets */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <View
              key={`empty-${i}`}
              className="items-center justify-center"
              style={{ width: cellWidth, height: 56 }}
            />
          ))}

          {/* days */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const emotionRaw = entryMap[day]?.emotion_label;
            const emotion = normalizeEmotionLabel(emotionRaw);
            const Icon = emotion ? (emotionMap[emotion] as any) : null;

            const dateObj = dayjs(new Date(year, month, day));
            const isToday = dayjs().isSame(dateObj, "day");
            const isFuture = dateObj.isAfter(dayjs(), "day");

            return (
              <TouchableOpacity
                key={day}
                disabled={isFuture}
                onPress={() => !emotion && !isFuture && goCreate(day)}
                className="items-center justify-center"
                style={{ width: cellWidth, height: 60 }}
                activeOpacity={0.8}
              >
                {emotion && Icon ? (
                  <View className="items-center">
                    <Icon width={32} height={32} />
                    <Text className="text-xs mt-1">{day}</Text>
                  </View>
                ) : isToday ? (
                  <View className="items-center">
                    <View className="bg-[#7F56D9] rounded-full p-2 mb-4">
                      <Text className="text-xs text-white w-9 h-7 text-center mt-2 font-[Poppins-Regular]">
                        {day}
                      </Text>
                    </View>
                  </View>
                ) : isFuture ? (
                  <Text className="text-xs text-gray-400 font-[Poppins-Regular]">{day}</Text>
                ) : (
                  <View className="items-center">
                    <View className="bg-[#F0EAFF] border-[5px] border-[#E0D7F9] rounded-full p-2 mb-1">
                      <Plus width={18} height={18} color={"#7F56D9"} />
                    </View>
                    <Text className="text-xs text-gray-600 font-[Poppins-Regular]">{day}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* History */}
        <View className="flex-1 w-full gap-2.5 px-4 mt-6">
          <View className="flex flex-row justify-between">
            <Text className="text-black text-lg font-[Poppins-SemiBold]">History</Text>
            <TouchableOpacity
              className="flex-row justify-end items-center mb-4"
              onPress={() => setFilterVisible(true)}
            >
              <Text className="text-black font-[Poppins-Bold] text-xs mr-2">Filter</Text>
              <SlidersHorizontal width={20} height={20} color="black" />
            </TouchableOpacity>
          </View>

          {sortedEntries.map((item) => {
            const emotion = normalizeEmotionLabel(item.emotion_label);
            const Icon = emotion ? (emotionMap[emotion] as any) : null;
            const itemId = item.id || item._id || JSON.stringify(item.created_at);

            return (
              <TouchableOpacity
                key={itemId}
                className="w-full flex-row items-center gap-3 rounded-xl border-[2px] border-[#f4f4f4] bg-white p-4 mb-4 shadow-md"
                onPress={() => router.push(`/(tabs)/home/diary/detail?id=${item.id || item._id}`)}
              >
                {Icon ? <Icon width={43} height={43} /> : <View style={{ width: 43, height: 43, borderRadius: 22, backgroundColor: "#EEE" }} />}
                <View className="flex-1">
                  <Text className="text-[16px] font-[Poppins-Medium]">
                    {dayjs(item.created_at).format("DD/MM/YYYY")}
                  </Text>
                  <Text numberOfLines={1} className="mt-1 text-[16px] text-[#736B66]">
                    {item.text_content || ""}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFilterVisible(false)}>
          <View className="flex-1 bg-black/50 items-center justify-center">
            <View className="w-80 bg-white p-6 rounded-2xl">
              <Text className="text-lg font-[Poppins-Bold] mb-4">Sort</Text>
              <TagSelector
                options={[
                  { id: 1, name: "Recent" },
                  { id: 2, name: "Older" },
                ]}
                multiSelect={false}
                onChange={(ids) => {
                  const isSelected = (val: number) =>
                    Array.isArray(ids) ? ids.includes(val) : ids === val;

                  if (isSelected(1)) setSortOrder("recent");
                  if (isSelected(2)) setSortOrder("older");
                }}
              />
              <Pressable
                className="mt-4 bg-[#7F56D9] py-2 rounded-xl"
                onPress={() => setFilterVisible(false)}
              >
                <Text className="text-center text-white font-[Poppins-Bold]"> Apply</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
import Heading from "@/components/Heading";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();
const API_BASE = process.env.EXPO_PUBLIC_API_PATH;

export default function ListScreen() {
  const [actions, setActions] = useState<any[]>([]);
  const [pickedAction, setPickedAction] = useState<any>(null);
  const [thoughts, setThoughts] = useState(["", "", ""]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>(["", "", ""]);
  const [backendErrors, setBackendErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/api/v1/tree/positive-actions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setActions(data);
          setPickedAction(data[Math.floor(Math.random() * data.length)]);
        }
      } catch (e) {
        console.log("Error fetch actions:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, []);

  // Validate thoughts và set errors
  useEffect(() => {
    const newErrors = thoughts.map((t) =>
      t.length > 200 ? "Max 200 characters" : ""
    );
    setErrors(newErrors);

    // Chỉ enable khi tất cả input có nội dung + không lỗi
    const allFilled = thoughts.every((t) => t.trim() !== "");
    const noErrors = newErrors.every((e) => e === "");
    setCanSubmit(allFilled && noErrors);
  }, [thoughts]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setBackendErrors([]);
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      // Lưu lại XP hiện tại để so sánh
      const resStatus = await fetch(`${API_BASE}/api/v1/tree/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const prevData = await resStatus.json();
      if (resStatus.ok) {
        await AsyncStorage.setItem("prev_total_xp", String(prevData.total_xp));
      }

      const res = await fetch(`${API_BASE}/api/v1/tree/nourish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action_id: pickedAction._id,
          positive_thoughts: thoughts,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msgs = Array.isArray(data.detail)
          ? data.detail.map((d: any) => d.msg)
          : [data.detail || "Unknown error"];
        setBackendErrors(msgs);
        setSubmitting(false);
        return;
      }
      router.replace("/(tabs)/home/plant/action");
    } catch (err) {
      console.log("Nourish error:", err);
      setBackendErrors(["Network error"]);
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF9FF]">
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <View className="flex-1 bg-[#FAF9FF]">
      <Heading title="Action List" />
      <ScrollView
        className="flex-1 px-4 pt-2"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="mt-4 mb-4 items-center gap-4">
          <Text className="text-[#000000] font-[Poppins-Bold] text-3xl text-center">
            {pickedAction?.action_name}
          </Text>
          <Text className="text-[#736B66] font-[Poppins-Medium] text-base text-center">
            {pickedAction?.description}
          </Text>
          <Text className="text-[#736B66] font-[Poppins-Bold] text-xl text-center mt-1">
            {formattedDate}
          </Text>
        </View>

        {thoughts.map((val, i) => (
          <View
            key={i}
            className="flex-row items-center bg-white rounded-2xl px-4 py-3 mb-2"
            style={{ elevation: 3 }}
          >
            <Text className="text-[#ABABAB] font-[Poppins-Bold] text-3xl mr-3">
              {i + 1}
            </Text>
            <TextInput
              className="flex-1 font-[Poppins-Regular] text-base"
              placeholder="Share your positive thing…"
              value={val}
              maxLength={200}
              onChangeText={(t) => {
                const clone = [...thoughts];
                clone[i] = t;
                setThoughts(clone);
              }}
            />
          </View>
        ))}

        {errors.map(
          (err, i) =>
            err && (
              <Text key={i} className="text-red-500 font-[Poppins-Medium] mb-1">
                {`Input ${i + 1}: ${err}`}
              </Text>
            )
        )}

        {backendErrors.map((err, i) => (
          <Text key={i} className="text-red-500 font-[Poppins-Medium] mb-1">
            {err}
          </Text>
        ))}

        <TouchableOpacity
          className={`h-16 rounded-xl items-center justify-center w-full mt-6 ${
            canSubmit && !submitting ? "bg-[#7F56D9]" : "bg-gray-400"
          }`}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-[Poppins-Bold] text-base">
              Cultivate My Thoughts
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
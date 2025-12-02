import CircularTimeSelector from "@/components/CircularTimeSelector";
import CustomSwitch from "@/components/CustomSwitch";
import Heading from "@/components/Heading";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ToastAndroid,
  KeyboardAvoidingView, 
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const API_BASE = process.env.EXPO_PUBLIC_API_PATH;

export default function AddScreen() {
  const [once, setOnce] = useState(true);
  const [daily, setDaily] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState<any>(null);
  const [time, setTime] = useState(() => new Date());
  const days = ["M", "Tu", "W", "Th", "F", "Sa", "Su"];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorDetail(null);

    try {
      const repeat_type = once ? "once" : daily ? "daily" : "custom";

      const hours = time.getHours().toString().padStart(2, "0");
      const minutes = time.getMinutes().toString().padStart(2, "0");
      const time_of_day = `${hours}:${minutes}`;

      let repeat_days: number[] = [];

      if (repeat_type === "daily") {
        repeat_days = [0, 1, 2, 3, 4, 5, 6];
      } else if (repeat_type === "custom") {
        repeat_days = selectedDays.map((d) => days.indexOf(d));
      }

      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        Alert.alert("Error", "No access token found!");
        return;
      }

      const body: any = {
        title,
        message,
        time_of_day,
        repeat_type,
      };

      if (repeat_days.length > 0) {
        body.repeat_days = repeat_days;
      }

      const response = await fetch(`${API_BASE}/api/v1/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorDetail(data.detail);
        return;
      }

      ToastAndroid.show("Reminder added successfully!", ToastAndroid.SHORT);
      router.push("/(tabs)/home/remind");
    } catch (error: any) {
      ToastAndroid.show("Something went wrong!", ToastAndroid.SHORT);
      console.log("Error creating reminder:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#FAF9FF" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 bg-[#FAF9FF]">
          <Heading title="Add new reminder" />

          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <TouchableOpacity disabled={loading} onPress={handleSave}>
              <Text className="text-[#7F56D9] font-[Poppins-Bold] text-lg text-right">
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>

            <View className="items-center mt-4">
              <CircularTimeSelector time={time} setTime={setTime} />
            </View>

            {/* Title */}
            <View className="mt-8">
              <Text className="text-lg font-[Poppins-SemiBold] text-gray-700 mb-2">
                Title
              </Text>
              <TextInput
                placeholder="Enter reminder title ..."
                value={title}
                onChangeText={setTitle}
                className="bg-white rounded-xl px-4 py-3 border border-gray-200 text-base font-[Poppins-Regular]"
              />
            </View>

            {/* Description */}
            <View className="mt-4">
              <Text className="text-lg font-[Poppins-SemiBold] text-gray-700 mb-2">
                Description
              </Text>
              <TextInput
                placeholder="Enter reminder description ..."
                value={message}
                onChangeText={setMessage}
                className="bg-white rounded-xl px-4 py-3 border border-gray-200 text-base font-[Poppins-Regular]"
                multiline
                numberOfLines={4}
                style={{ minHeight: 100, textAlignVertical: "top" }}
              />
            </View>

            {/* Repeat */}
            <View className="bg-white rounded-2xl mt-6 p-4">
              <View className="flex-row items-center mb-4">
                <Bell size={18} color="#7F56D9" />
                <Text className="ml-2 font-[Poppins-SemiBold] text-base">
                  Repeat
                </Text>
              </View>

              {/* Days */}
              <View className="flex-row justify-between mb-4">
                {days.map((d) => {
                  const active = selectedDays.includes(d);
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => toggleDay(d)}
                      className={`w-9 h-9 rounded-full border items-center justify-center ${
                        active
                          ? "bg-[#7F56D9] border-[#7F56D9]"
                          : "border-[#7F56D9]"
                      }`}
                    >
                      <Text
                        className={`text-sm font-[Poppins-Regular] ${
                          active ? "text-white" : "text-[#7F56D9]"
                        }`}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Once / Daily */}
              <View className="flex-row items-center justify-between border-t border-gray-200 py-3">
                <Text className="text-base font-[Poppins-Regular]">Once</Text>
                <CustomSwitch value={once} onValueChange={setOnce} />
              </View>
              <View className="flex-row items-center justify-between border-t border-gray-200 py-3">
                <Text className="text-base font-[Poppins-Regular]">Daily</Text>
                <CustomSwitch value={daily} onValueChange={setDaily} />
              </View>
            </View>

            {errorDetail && Array.isArray(errorDetail) && (
              <View className="bg-red-100 border border-red-300 rounded-xl mt-6 p-3">
                {errorDetail.map((err: any, idx: number) => (
                  <Text
                    key={idx}
                    className="text-red-700 text-sm font-[Poppins-Regular]"
                  >
                    {err.loc?.join(". ")}: {err.msg}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}
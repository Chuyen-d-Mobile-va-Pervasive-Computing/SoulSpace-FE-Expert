import CustomSwitch from "@/components/CustomSwitch";
import { useRouter } from "expo-router";
import { Pencil, PlusCircle, ArrowLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_PATH;

export default function RemindScreen() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
          console.log("No token found");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE}/api/v1/reminders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (!response.ok) {
          console.error("Error fetching reminders:", data);
          setReminders([]);
          return;
        }

        const formatted = data.map((r: any) => ({
          _id: r.id || r._id,
          title: r.title,
          message: r.message,
          time_of_day: r.time_of_day,
          repeat_type: r.repeat_type,
          repeat_days: r.repeat_days,
          active: r.is_active,
        }));

        setReminders(formatted);
      } catch (error) {
        console.error("Fetch reminders failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAF9FF]">
        <ActivityIndicator size="large" color="#7F56D9" />
        <Text className="mt-2 text-[#7F56D9] font-[Poppins-Regular]">
          Loading reminders...
        </Text>
      </View>
    );
  }

  const toggleReminder = async (id: string) => {
    try {
      const current = reminders.find((r) => r._id === id);
      if (!current) return;

      setReminders((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, active: !item.active } : item
        )
      );

      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        console.log("No access token found");
        ToastAndroid.show("No access token found", ToastAndroid.SHORT);
        return;
      }

      const response = await fetch(`${API_BASE}/api/v1/reminders/toggle/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !current.active }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Toggle failed:", data);
        setReminders((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, active: current.active } : item
          )
        );
        ToastAndroid.show(
          data?.detail?.[0]?.msg || "Toggle failed!",
          ToastAndroid.SHORT
        );
        return;
      }

      console.log("✅ Toggle success:", data);
      ToastAndroid.show(
        !current.active
          ? "Reminder activated"
          : "Reminder deactivated",
        ToastAndroid.SHORT
      );
    } catch (error) {
      console.error("❌ Toggle error:", error);
      ToastAndroid.show("Something went wrong!", ToastAndroid.SHORT);
    }
  };

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
            Remind
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1 px-4 pt-2"
      >
        <TouchableOpacity
          className="flex-row items-center justify-center mb-4"
          onPress={() => router.push("/(tabs)/home/remind/add")}
        >
          <PlusCircle size={22} color="#7F56D9" />
          <Text className="ml-2 text-lg font-[Poppins-SemiBold] text-[#7F56D9]">
            Create a reminder
          </Text>
        </TouchableOpacity>

        {/* Danh sách reminders */}
        {reminders.map((item) => (
          <TouchableOpacity
            key={item._id}
            className="flex-row items-center justify-between bg-white rounded-2xl p-4 mb-3 shadow-sm"
            onPress={() => router.push({
              pathname: "/(tabs)/home/remind/update",
              params: { reminder: JSON.stringify(item) }
            })}
            activeOpacity={0.8}
          >
            {/* Left */}
            <View className="flex-row items-center">
              <View className="bg-[#fff1f1] p-3 rounded-xl mr-3">
                <Pencil size={20} color="#FF6B6B" strokeWidth={2.75} />
              </View>
              <View>
                <Text className="text-xl font-[Poppins-SemiBold] text-gray-800">
                  {item.title}
                </Text>
                <Text className="text-base text-gray-500 font-[Poppins-Regular]">
                  {item.time_of_day}
                </Text>
              </View>
            </View>

            <CustomSwitch
              value={item.active}
              onValueChange={() => toggleReminder(item._id)}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
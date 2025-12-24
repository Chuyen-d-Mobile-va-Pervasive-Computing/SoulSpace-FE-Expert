import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  CircleUserRound,
  Info,
  Lock,
  LogOut,
} from "lucide-react-native";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function SettingsScreen() {
  const [showConfirm, setShowConfirm] = useState(false);
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "token",
        "username",
        "role",
        "expert_status",
        "profile_id",
        "profile_completed",
      ]);

      router.replace("/(auth)/login");
    } catch (err) {
      console.log("LOGOUT ERROR:", err);
    }
  };

  return (
    <View className="flex-1 bg-[#FAF9FF]">
      {/* Heading */}
      <View className="w-full relative flex-row items-center justify-center py-4 px-4 border-b border-gray-200 bg-[#FAF9FF] mt-8">
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home")}
          className="absolute left-4"
          accessibilityLabel="Back"
        >
          <ArrowLeft width={40} height={30} />
        </TouchableOpacity>
        <Text className="text-2xl font-[Poppins-Bold] text-center">
          Setting
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="py-3 px-1 gap-4">
          {/* Account */}
          <TouchableOpacity
            className="w-full h-14 rounded-xl border border-[#EEEEEE] bg-white px-3 justify-center"
            onPress={() => router.push("/setting/account")}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <CircleUserRound width={24} height={24} strokeWidth={1} />
                <Text className="font-[Poppins-Regular] text-base">
                  Username
                </Text>
              </View>

              <ChevronRight width={24} height={24} strokeWidth={1} />
            </View>
          </TouchableOpacity>

          {/* Account */}
          <TouchableOpacity
            className="w-full h-14 rounded-xl border border-[#EEEEEE] bg-white px-3 justify-center"
            onPress={() => router.push("/setting/profile")}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Info width={24} height={24} strokeWidth={1} />
                <Text className="font-[Poppins-Regular] text-base">
                  Account
                </Text>
              </View>

              <ChevronRight width={24} height={24} strokeWidth={1} />
            </View>
          </TouchableOpacity>

          {/* Password */}
          <TouchableOpacity
            className="w-full h-14 rounded-xl border border-[#EEEEEE] bg-white px-3 justify-center"
            onPress={() => router.push("/setting/password")}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Lock width={24} height={24} strokeWidth={1} />
                <Text className="font-[Poppins-Regular] text-base">
                  Password
                </Text>
              </View>

              <ChevronRight width={24} height={24} strokeWidth={1} />
            </View>
          </TouchableOpacity>

          {/* Sign out */}
          <TouchableOpacity
            className="w-full h-14 px-3 justify-center"
            onPress={() => setShowConfirm(true)}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <LogOut width={24} height={24} color="#FF0000" />
                <Text className="text-[#FF0000] font-[Poppins-Bold] text-base">
                  Sign Out
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* CONFIRM LOGOUT MODAL */}
      <Modal
        transparent
        visible={showConfirm}
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowConfirm(false)}>
          <View className="flex-1 bg-black/60 justify-center items-center">
            <View className="bg-white w-4/5 rounded-2xl p-6 items-center">
              <Text className="text-lg font-[Poppins-SemiBold] mb-6 text-gray-800">
                Are you sure you want to logout?
              </Text>

              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => setShowConfirm(false)}
                  className="bg-gray-300 px-8 py-4 rounded-xl"
                >
                  <Text className="text-base font-[Poppins-SemiBold] text-gray-800">
                    No
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLogout}
                  className="bg-red-500 px-8 py-4 rounded-xl"
                >
                  <Text className="text-base font-[Poppins-SemiBold] text-white">
                    Yes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

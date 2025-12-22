import Heading from "@/components/Heading";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

import { getMe, updateUsername } from "@/lib/api";

export default function ChangeAccount() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  // popup state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadMe();
  }, []);

  const loadMe = async () => {
    try {
      const res = await getMe();
      setUsername(res.username || "");
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to load user info.");
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setErrorMessage("Username cannot be empty.");
      return;
    }

    if (username.length > 30) {
      setErrorMessage("Username must be 30 characters or less.");
      return;
    }

    try {
      setLoading(true);
      await updateUsername(username.trim());
      setShowSuccess(true);
    } catch (e: any) {
      setErrorMessage(e.message || "Update username failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FAF9FF]">
      <Heading title="Change Account" />

      <View className="py-2 px-4 gap-1">
        {/* USERNAME INPUT */}
        <TextInput
          className="h-16 w-full rounded-xl border border-[#EEEEEE] bg-white px-3 font-[Poppins-Regular]"
          value={username}
          onChangeText={setUsername}
          placeholder="user1234567"
          placeholderTextColor="#7B7B7B"
          maxLength={30}
        />

        {/* COUNTER */}
        <Text className="self-stretch text-right text-xs text-gray-400 font-[Poppins-Regular]">
          {username.length}/30
        </Text>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          disabled={!username || loading}
          className={`w-full h-14 rounded-xl items-center justify-center ${
            !username || loading ? "opacity-40 bg-[#7F56D9]" : "bg-[#7F56D9]"
          }`}
          onPress={handleSave}
        >
          <Text className="text-white text-base font-[Poppins-Bold]">
            {loading ? "Saving..." : "SAVE"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ❌ ERROR POPUP */}
      <Modal transparent visible={!!errorMessage} animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white w-4/5 rounded-2xl px-6 py-7 items-center">
            <Text className="text-lg font-[Poppins-Bold] text-red-500 mb-3">
              Error
            </Text>

            <Text className="text-center font-[Poppins-Regular] text-gray-600 mb-6">
              {errorMessage}
            </Text>

            <TouchableOpacity
              onPress={() => setErrorMessage(null)}
              className="w-full h-12 rounded-xl bg-red-500 items-center justify-center"
            >
              <Text className="text-white font-[Poppins-Bold]">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ✅ SUCCESS POPUP */}
      <Modal transparent visible={showSuccess} animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white w-4/5 rounded-2xl px-6 py-7 items-center">
            <Text className="text-lg font-[Poppins-Bold] text-[#7F56D9] mb-3">
              Success
            </Text>

            <Text className="text-center font-[Poppins-Regular] text-gray-600 mb-6">
              Username updated successfully!
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowSuccess(false);
                router.push("/setting");
              }}
              className="w-full h-12 rounded-xl bg-[#7F56D9] items-center justify-center"
            >
              <Text className="text-white font-[Poppins-Bold]">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

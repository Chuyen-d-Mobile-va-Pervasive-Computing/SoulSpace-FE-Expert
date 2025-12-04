import Heading from "@/components/Heading";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ChangeAccount() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username cannot be empty.");
      return;
    }

    if (username.length > 30) {
      Alert.alert("Error", "Username must be 30 characters or less.");
      return;
    }

    // Mock saving like API
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success", "Username updated successfully!", [
        { text: "OK", onPress: () => router.push("/setting") },
      ]);
    }, 800);
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
    </View>
  );
}

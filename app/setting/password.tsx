import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ChangePassword() {
  const [old_password, setOldPassword] = useState("");
  const [new_password, setNewPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = () => {
    if (!old_password || !new_password || !confirm_password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (new_password !== confirm_password) {
      Alert.alert("Error", "New password and confirmation do not match.");
      return;
    }

    if (new_password.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long.");
      return;
    }

    // Mock Success
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success", "Password changed successfully!", [
        { text: "OK", onPress: () => router.push("/setting") },
      ]);
    }, 800);
  };

  return (
    <View className="flex-1 bg-[#FAF9FF]">
      {/* Heading */}
      <View className="w-full relative flex-row items-center justify-center py-4 px-4 border-b border-gray-200 bg-[#FAF9FF] mt-8">
        <TouchableOpacity
          onPress={() => router.push("/setting")}
          className="absolute left-4"
          accessibilityLabel="Back"
        >
          <ArrowLeft width={40} height={30} />
        </TouchableOpacity>
        <Text className="text-2xl font-[Poppins-Bold] text-center">
          Change Password
        </Text>
      </View>

      <View className="py-2 px-4 gap-4">
        {/* OLD PASSWORD */}
        <TextInput
          className="h-16 w-full rounded-xl border border-[#EEEEEE] bg-white px-4 font-[Poppins-Regular]"
          value={old_password}
          onChangeText={setOldPassword}
          placeholder="Old Password"
          placeholderTextColor="#7B7B7B"
          secureTextEntry
        />

        {/* NEW PASSWORD */}
        <TextInput
          className="h-16 w-full rounded-xl border border-[#EEEEEE] bg-white px-4 font-[Poppins-Regular]"
          value={new_password}
          onChangeText={setNewPassword}
          placeholder="New Password"
          placeholderTextColor="#7B7B7B"
          secureTextEntry
        />

        {/* CONFIRM PASSWORD */}
        <TextInput
          className="h-16 w-full rounded-xl border border-[#EEEEEE] bg-white px-4 font-[Poppins-Regular]"
          value={confirm_password}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          placeholderTextColor="#7B7B7B"
          secureTextEntry
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity
          disabled={
            !old_password || !new_password || !confirm_password || loading
          }
          className={`w-full h-14 rounded-xl items-center justify-center ${
            !old_password || !new_password || !confirm_password || loading
              ? "opacity-40 bg-[#7F56D9]"
              : "bg-[#7F56D9]"
          }`}
          onPress={handleChangePassword}
        >
          <Text className="text-white text-base font-[Poppins-Bold]">
            {loading ? "Saving..." : "SAVE"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

"use client";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const API_BASE = process.env.EXPO_PUBLIC_API_PATH;

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("@/assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("@/assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Light": require("@/assets/fonts/Poppins-Light.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role: "user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Registration failed. Please try again.";

        if (typeof data?.detail === "string") {
          errorMessage = data.detail;
        } else if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
          errorMessage = data.detail[0].msg;
        }

        Alert.alert("Error", errorMessage);
        setLoading(false);
        return;
      }

      Alert.alert(
        "Success",
        `Welcome ${data.username}! Your account has been created.`,
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    } catch (error) {
      console.error("Register error:", error);
      Alert.alert("Network error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#FAF9FF" }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      extraScrollHeight={50}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
    >
      <View className="flex-1 bg-[#FAF9FF] pt-12">
        {/* Nút Back */}
        <View className="mt-8 ml-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 bg-white rounded-[10px] items-center justify-center"
          >
            <ChevronLeft size={30} color="#000000" />
          </TouchableOpacity>
        </View>
        {/* Title */}
        <View className="px-6 mt-24">
          <Text className="text-black text-3xl font-[Poppins-Bold]">
            Welcome back! Glad
          </Text>
          <Text className="text-black text-3xl font-[Poppins-Bold] leading-[50px]">
            to see you, Again!
          </Text>
        </View>
        <View className="px-6 mt-12">
          {/* Email */}
          <View className="mb-4">
            <Text className="text-gray-500 text-sm mb-1 font-[Poppins-Regular]">
              Email Address
            </Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="w-full h-16 bg-transparent rounded-[10px] px-4 border border-[#DADADA] font-[Poppins-Regular]"
            />
          </View>
          {/* Password */}
          <View className="mb-4">
            <Text className="text-gray-500 text-sm mb-1 font-[Poppins-Regular]">
              Password
            </Text>
            <View className="w-full h-16 bg-transparent px-4 flex-row items-center border border-[#DADADA] rounded-[10px]">
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#ccc"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                className="flex-1 font-[Poppins-Regular]"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <Eye size={22} color="#B5A2E9" />
                ) : (
                  <EyeOff size={22} color="#B5A2E9" />
                )}
              </Pressable>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className={`w-full h-16 rounded-lg items-center justify-center mb-4 ${
              loading ? "bg-[#BCA8F4]" : "bg-[#7F56D9]"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-[Poppins-Bold] text-base">
                Register
              </Text>
            )}
          </TouchableOpacity>
          {/* Or Login */}
          <View className="flex-row justify-center">
            <Text className="text-black font-[Poppins-Regular]">Or </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text className="text-[#7F56D9] font-[Poppins-Medium]">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
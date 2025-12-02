"use client";

import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_PATH;

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("@/assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("@/assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Light": require("@/assets/fonts/Poppins-Light.ttf"),
    "Poppins-ExtraBold": require("@/assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-Black": require("@/assets/fonts/Poppins-Black.ttf"),
    "Poppins-Thin": require("@/assets/fonts/Poppins-Thin.ttf"),
    "Poppins-ExtraLight": require("@/assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Italic": require("@/assets/fonts/Poppins-Italic.ttf"),
  });

  // Tự động redirect nếu đã có token
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          router.replace("/(tabs)/home");
          return;
        }
      } catch (err) {
        console.log("Token check error:", err);
      } finally {
        setCheckingToken(false);
      }
    };
    checkToken();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  // Hàm parse lỗi từ backend
  const parseErrorDetail = (data: any): string => {
    if (!data) return "An unknown error occurred.";

    if (typeof data.detail === "string") return data.detail;

    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return data.detail[0].msg || "Invalid input.";
    }

    return "Login failed.";
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Notice", "Please fill in your email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const msg = parseErrorDetail(data);
        throw new Error(msg);
      }

      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem("access_token", data.access_token);
      await AsyncStorage.setItem("username", data.username);
      await AsyncStorage.setItem("role", data.role);

      Alert.alert("Success", `Welcome ${data.username} to SoulSpace!`);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.log("Login error:", error);
      Alert.alert("Login Error", error.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FAF9FF" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
        <SafeAreaView className="flex-1 bg-white" onLayout={onLayoutRootView}>
          {/* Header */}
          <View className="bg-[#B5A2E9] rounded-b-[70%] pb-[20%] -mx-40 pl-40 pr-40 pt-20">
            {/* Back */}
            <View className="px-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-12 h-12 bg-white rounded-[10px] items-center justify-center"
              >
                <ChevronLeft size={30} color="#000000" />
              </TouchableOpacity>
            </View>

            <View className="w-full">
              {/* Title */}
              <View className="px-6 mt-24">
                <Text className="text-black text-3xl font-[Poppins-Bold]">
                  Welcome back! Glad
                </Text>
                <Text className="text-black text-3xl font-[Poppins-Bold] leading-[50px]">
                  to see you, Again!
                </Text>
              </View>

              {/* Email */}
              <View className="px-6 mt-20">
                <Text className="text-white mb-1 font-[Poppins-Medium]">
                  Email Address
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#ccc"
                  className="w-full h-16 bg-white rounded-xl px-4 mb-4 font-[Poppins-Regular]"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                {/* Password */}
                <Text className="text-white mb-1 font-[Poppins-Medium]">
                  Password
                </Text>
                <View className="w-full h-16 bg-white rounded-xl px-4 flex-row items-center">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#ccc"
                    secureTextEntry={!showPassword}
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
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/forgot-pw")}
                  className="self-end mt-2"
                >
                  <Text className="text-[#ffffff] font-[Poppins-Italic]">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="flex-1 px-6 pt-10">
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              className={`h-16 rounded-xl items-center justify-center ${
                loading ? "bg-[#A08CE2]" : "bg-[#7F56D9]"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-[Poppins-Bold] text-base">
                  Login
                </Text>
              )}
            </TouchableOpacity>

            {/* Register */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-black font-[Poppins-Regular]">
                Don’t have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text className="text-[#7F56D9] font-[Poppins-Medium]">
                  Register Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
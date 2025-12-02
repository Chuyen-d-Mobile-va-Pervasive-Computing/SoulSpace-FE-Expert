import CreateAccount from "@/assets/images/account_create.svg";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import PagerView from "react-native-pager-view";
import NewPassword from "./components/NewPassword";
import OTPInput from "./components/OTPInput";

const API_BASE = process.env.EXPO_PUBLIC_API_PATH;

export default function SignupPager() {
  const [page, setPage] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const pagerRef = useRef<PagerView>(null);
  const router = useRouter();

  const totalSteps = 4;

  const goNext = () => {
    const next = Math.min(page + 1, totalSteps - 1);
    pagerRef.current?.setPage(next);
    setPage(next);
  };
  const goPrev = () => {
    if (page === 0) {
      router.back();
    } else {
      const prev = Math.max(page - 1, 0);
      pagerRef.current?.setPage(prev);
      setPage(prev);
    }
  };

  // Các tiêu đề cho từng trang (trang cuối không cần heading)
  const headings = [
    "Add your email",
    "Verify your email",
    "Create your password",
  ];

  const Heading = () =>
    page < totalSteps - 1 ? (
      <View className="px-6 pt-12 mb-4">
        {/* Back button + heading */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={goPrev}
            className="w-12 h-12 rounded-[10px] items-center justify-center mr-4"
          >
            <ChevronLeft size={30} color="#000000" />
          </TouchableOpacity>
          <Text className="text-2xl font-[Poppins-Medium] text-black">
            {headings[page]}
          </Text>
        </View>

        {/* Progress bar */}
        <View className="flex-row justify-center">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const active = i <= page;
            return (
              <View
                key={i}
                className="flex-1 h-2 mx-0.5 rounded-full"
                style={{
                  backgroundColor: active ? "#7F56D9" : "#E0D8F5",
                }}
              />
            );
          })}
        </View>
      </View>
    ) : null;

  return (
    <View className="flex-1 bg-[#FAF9FF] w-full">
      {/* Heading + Progress */}
      <Heading />

      {/* PagerView */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        scrollEnabled={false} // không cho vuốt thủ công
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {/* Screen 1 */}
        <View key="1" className="flex-1 px-6">
          <Text className="text-base font-[Poppins-Medium] text-gray-700 mb-2 mt-8">
            Email Address
          </Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            className="w-full h-16 bg-transparent rounded-[10px] px-4 border border-[#DADADA] font-[Poppins-Regular]"
          />

          <TouchableOpacity
            onPress={async () => {
              if (!email) return;
              try {
                await fetch(`${API_BASE}/api/v1/auth/forgot-password`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email }),
                });
                goNext();
              } catch (err) {
                console.log(err);
              }
            }}
            className="w-full h-16 rounded-lg items-center justify-center mb-4 bg-[#7F56D9] mt-8"
          >
            <Text className="text-white font-[Poppins-Bold] text-base">
              Send OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Screen 2 */}
        <View key="2" className="flex-1 px-6">
          <Text className="text-base font-[Poppins-Medium] text-gray-700 mb-2 mt-8 text-center">
            We just sent a 6-digit code to {email || "exampleemail@gmail.com"},
            enter it below:
          </Text>

          <OTPInput length={6} onComplete={(val) => setCode(val)} />

          <TouchableOpacity
            onPress={goNext}
            disabled={code.length < 6}
            className={`w-full h-16 rounded-lg items-center justify-center mt-8 ${
              code.length < 6 ? "bg-gray-300" : "bg-[#7F56D9]"
            }`}
          >
            <Text className="text-white font-[Poppins-Bold] text-base">
              Confirm OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Screen 3 */}
        <View key="3" className="flex-1 px-6 mt-8">
          <NewPassword
            onValidChange={(valid, val) => {
              setPassword(valid ? val : "");
            }}
          />

          <TouchableOpacity
            onPress={async () => {
              if (!password || code.length < 6) return;
              try {
                await fetch(`${API_BASE}/api/v1/auth/reset-password`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email,
                    otp: code,
                    new_password: password,
                  }),
                });
                goNext();
              } catch (err) {
                console.log(err);
              }
            }}
            disabled={!password || code.length < 6}
            className={`w-full h-16 rounded-lg items-center justify-center mt-8 ${
              !password || code.length < 6 ? "bg-gray-300" : "bg-[#7F56D9]"
            }`}
          >
            <Text className="text-white font-[Poppins-Bold] text-base">
              Confirm Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Screen 4: Success */}
        <View key="4" className="flex-1 items-center justify-center px-6">
          <CreateAccount width={250} height={250} />
          <Text className="text-3xl font-[Poppins-Bold] mb-6 text-center">
            Your account was successfully created!
          </Text>
          <Text className="text-xl font-[Poppins-Regular] mb-6 text-center">
            Only one click to explore SoulSpace.
          </Text>
          <TouchableOpacity
            className="w-full h-16 rounded-lg items-center justify-center bg-[#7F56D9]"
            onPress={() => router.push("/login")}
          >
            <Text
              className="text-white font-[Poppins-Bold]"
              onPress={() => router.push("/(auth)/login")}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </PagerView>
    </View>
  );
}

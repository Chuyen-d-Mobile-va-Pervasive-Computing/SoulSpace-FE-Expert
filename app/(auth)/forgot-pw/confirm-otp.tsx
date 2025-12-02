import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Gift } from "lucide-react-native";
import React, { useRef } from "react";
import {
    NativeSyntheticEvent,
    Text,
    TextInput,
    TextInputKeyPressEventData,
    TouchableOpacity,
    View,
} from "react-native";

export default function ConfirmOTPScreen() {
    const router = useRouter();
    const inputRefs = useRef<TextInput[]>([]);
    const [otp, setOtp] = React.useState(["", "", "", ""]);

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (
        e: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number
    ) => {
        if (e.nativeEvent.key === "Backspace" && otp[index] === "") {
        if (index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        }
    };

    // Check đủ 6 số 
    const isOtpComplete = otp.every((digit) => digit !== "");

    return (
        <LinearGradient
            colors={["#010440", "#020659"]}
            className="flex-1 justify-center px-4"
        >
            {/* Logo */}
            <View className="items-center mb-8">
                <LinearGradient
                    colors={["#8736D9", "#cdaded"]}
                    className="w-24 h-24 rounded-full items-center justify-center shadow-lg"
                >
                    <Gift size={42} color="#fff" />
                </LinearGradient>
                <Text className="text-white text-2xl font-inter_bold mt-5 tracking-widest">
                    SOULSPACE
                </Text>
            </View>

            <View className="mb-6 px-4">
                <Text className="text-white text-[11px] text-center leading-5">
                    Enter 6-digit verification code sent to your email
                </Text>
            </View>

            {/* OTP Input */}
            <View className="flex-row justify-center space-x-6 gap-2 mb-10">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <TextInput
                    key={i}
                    ref={(el) => {
                        if (el) inputRefs.current[i] = el;
                    }}
                    maxLength={1}
                    keyboardType="number-pad"
                    onChangeText={(text) => handleChange(text, i)}
                    onKeyPress={(e) => handleKeyPress(e, i)}
                    className="w-[52px] h-[56px] rounded-md border border-[#9badca] text-center text-base text-white font-bold"
                    />
                ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
                disabled={!isOtpComplete}
                onPress={() => router.push("/(auth)/forgot-pw/new-pw")}
                className={`w-full rounded-2xl overflow-hidden shadow-xl ${
                !isOtpComplete ? "opacity-40" : ""
                }`}
            >
                <LinearGradient
                    colors={["#8736D9", "#5204BF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="py-4 items-center"
                >
                    <Text className="text-white font-bold text-lg tracking-wide">
                        Verify
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </LinearGradient>
    );
}
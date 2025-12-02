import React from "react";
import { Pressable, Text, View, ColorValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface MiniGameCardProps {
    title: string;
    subtitle: string;
    points?: number;
    icon: React.ReactNode;
    gradient?: readonly [ColorValue, ColorValue, ...ColorValue[]];
    onPress?: () => void;
}

export default function MiniGameCard({
    title,
    subtitle,
    points = 100,
    icon,
    gradient = ["#6FA9FF", "#3A6FE6"] as const,
    onPress,
}: MiniGameCardProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
                shadowColor: pressed ? gradient[1] : "#000",
                shadowOpacity: pressed ? 0.45 : 0.15,
                shadowRadius: pressed ? 18 : 8,
                shadowOffset: { width: 0, height: pressed ? 6 : 4 },
            })}
            className="w-full p-2"
        >
            <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16 }}
                className="px-4 py-5"
            >
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-3 flex-1">
                        <View className="rounded-full p-2 bg-white/25">{icon}</View>
                        <View className="flex-1">
                            <Text className="text-white font-[Poppins-Bold] text-lg">{title}</Text>
                            <Text className="text-white/90 font-[Poppins-Regular] text-sm">{subtitle}</Text>
                        </View>
                    </View>
                    <View className="bg-white/25 rounded-lg px-3 py-1">
                        <Text className="text-white font-[Poppins-SemiBold] text-sm">+{points} pts</Text>
                    </View>
                </View>
            </LinearGradient>
        </Pressable>
    );
}
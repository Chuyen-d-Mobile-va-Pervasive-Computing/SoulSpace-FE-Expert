import HappyIcon from "@/assets/images/happy.svg";
import { emotionMap } from "@/constants/EmotionMap";
import React from "react";
import { View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

type EmotionDisplayProps = {
  emotionLabel: keyof typeof emotionMap;
};

export default function EmotionDisplay({ emotionLabel }: EmotionDisplayProps) {
  const offset = useSharedValue(0);

  React.useEffect(() => {
    if (["Vui vẻ", "Hào hứng"].includes(emotionLabel)) {
      offset.value = withRepeat(
        withTiming(10, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else if (["Buồn", "Lo lắng"].includes(emotionLabel)) {
      offset.value = withRepeat(
        withTiming(8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else if (["Tức giận", "Bực bội"].includes(emotionLabel)) {
      offset.value = withRepeat(
        withTiming(5, { duration: 100, easing: Easing.linear }),
        -1,
        true
      );
    } else if (["Điềm tĩnh", "Thư giãn"].includes(emotionLabel)) {
      offset.value = withRepeat(
        withTiming(1.1, { duration: 1200 }),
        -1,
        true
      );
    } else if (["Bối rối", "Xấu hổ"].includes(emotionLabel)) {
      offset.value = withRepeat(
        withTiming(15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [emotionLabel]);

  const animatedStyle = useAnimatedStyle(() => {
    if (["Vui vẻ", "Hào hứng"].includes(emotionLabel)) {
      return { transform: [{ translateY: -offset.value }] };
    }
    if (["Buồn", "Lo lắng"].includes(emotionLabel)) {
      return { transform: [{ translateY: -offset.value }] };
    }
    if (["Tức giận", "Bực bội"].includes(emotionLabel)) {
      return { transform: [{ translateX: offset.value }] };
    }
    if (["Điềm tĩnh", "Thư giãn"].includes(emotionLabel)) {
      return { transform: [{ scale: offset.value }] };
    }
    if (["Bối rối", "Xấu hổ"].includes(emotionLabel)) {
      return { transform: [{ rotate: `${offset.value}deg` }] };
    }
    return {};
  });

  const Icon = emotionMap[emotionLabel] || HappyIcon; // fallback

  return (
    <View className="items-center mt-4">
      {/* <Text className="text-white text-xs">Cảm xúc gần nhất của bạn</Text> */}
      <Animated.View style={[animatedStyle]} className="mt-2">
        <Icon width={100} height={100} color="white" />
      </Animated.View>
      {/* <Text className="text-white font-semibold text-base mt-1">
        {emotionLabel}
      </Text> */}
    </View>
  );
}
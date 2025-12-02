import React, { useEffect, useState } from "react";
import { Animated, TouchableOpacity } from "react-native";

interface Props {
  value: boolean;
  onValueChange: (val: boolean) => void;
}

export default function CustomSwitch({ value, onValueChange }: Props) {
  const [animValue] = useState(new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22], // di chuyển nút
  });

  const bgColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E5E7EB", "#7F56D9"], // xám -> tím
  });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onValueChange(!value)}>
      <Animated.View
        style={{
          width: 50,
          height: 28,
          borderRadius: 30,
          backgroundColor: bgColor,
          justifyContent: "center",
          padding: 2,
        }}
      >
        <Animated.View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: "#fff",
            transform: [{ translateX }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.5,
            elevation: 2,
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

import React from "react";
import { View } from "react-native";

export default function SvgAvatar({ children, size = 40 }: { children: React.ReactNode; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );
}
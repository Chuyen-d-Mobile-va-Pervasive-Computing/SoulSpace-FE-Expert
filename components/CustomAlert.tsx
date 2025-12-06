import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  message: string | null;
  onClose: () => void;
};

export default function CustomAlert({ message, onClose }: Props) {
  if (!message) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 40,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingHorizontal: 24,
      }}
    >
      <View className="bg-red-500 rounded-xl px-4 py-3 shadow-lg flex-row justify-between items-center">
        <Text
          className="text-white flex-1 mr-3 text-base"
          style={{ fontFamily: "Poppins-Regular" }}
        >
          {message}
        </Text>

        <TouchableOpacity onPress={onClose}>
          <Text
            className="text-white text-xl"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            ✕
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

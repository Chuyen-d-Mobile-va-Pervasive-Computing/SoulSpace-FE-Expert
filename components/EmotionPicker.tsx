import React, { useRef, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import AnnoyIcon from "@/assets/images/annoy.svg";
import AngryIcon from "@/assets/images/angry.svg";
import CalmIcon from "@/assets/images/calm.svg";
import ChillIcon from "@/assets/images/chill.svg";
import ExcitedIcon from "@/assets/images/excited.svg";
import ConfusedIcon from "@/assets/images/confused.svg";
import HappyIcon from "@/assets/images/happy.svg";
import EmbarrassedIcon from "@/assets/images/embarrassed.svg";
import WorriedIcon from "@/assets/images/worried.svg";
import SadIcon from "@/assets/images/sad.svg";

export const emotionList = [
  { id: 1, name: "Excited", icon: ExcitedIcon },
  { id: 2, name: "Happy", icon: HappyIcon },
  { id: 3, name: "Chill", icon: ChillIcon },
  { id: 4, name: "Calm", icon: CalmIcon },
  { id: 5, name: "Confused", icon: ConfusedIcon },
  { id: 6, name: "Embarrassed", icon: EmbarrassedIcon },
  { id: 7, name: "Worried", icon: WorriedIcon },
  { id: 8, name: "Annoy", icon: AnnoyIcon },
  { id: 9, name: "Sad", icon: SadIcon },
  { id: 10, name: "Angry", icon: AngryIcon },
];

const ITEM_HEIGHT = 100;
const VISIBLE_ITEMS = 5;

export default function EmotionPicker({
  onSelect,
}: {
  onSelect: (emotion: { id: number; name: string; icon: any }) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const handleSelect = (emotion: any, index: number) => {
    setSelected(emotion.id);
    onSelect(emotion);

    // Scroll tới đúng item
    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  return (
    <View
      className="relative items-center w-full"
      style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
    >
      {/* Highlight bar */}
      <View
        className="absolute left-0 right-0 rounded-full border-2 border-purple-400"
        style={{
          top: (ITEM_HEIGHT * VISIBLE_ITEMS) / 2 - ITEM_HEIGHT / 2,
          height: ITEM_HEIGHT,
          backgroundColor: "rgba(147, 112, 219, 0.1)",
          zIndex: 1,
        }}
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled={true}
        contentContainerStyle={{
          paddingVertical: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
        }}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          const index = Math.round(offsetY / ITEM_HEIGHT);
          if (index >= 0 && index < emotionList.length) {
            setSelected(emotionList[index].id);
            onSelect(emotionList[index]);
          }
        }}
        scrollEventThrottle={16}
      >
        {emotionList.map((emotion, index) => {
          const Icon = emotion.icon;
          const isActive = selected === emotion.id;
          return (
            <TouchableOpacity
              key={emotion.id}
              activeOpacity={0.7}
              style={{
                height: ITEM_HEIGHT,
                justifyContent: "center",
                alignItems: "center",
              }}
              className={`px-4 w-full ${
                isActive ? "opacity-100" : "opacity-50"
              }`}
              onPress={() => handleSelect(emotion, index)}
            >
              <View className="flex-row items-center justify-between w-full">
                <Text className="text-sm font-[Poppins-Medium] text-black">
                  {emotion.name}
                </Text>
                <Icon width={48} height={48} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
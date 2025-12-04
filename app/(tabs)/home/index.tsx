import Angry from "@/assets/images/angry.svg";
import Confused from "@/assets/images/confused.svg";
import Decor from "@/assets/images/decor.svg";
import Excited from "@/assets/images/excited.svg";
import Happy from "@/assets/images/happy.svg";
import Logo from "@/assets/images/logo.svg";
import Worried from "@/assets/images/worried.svg";
import { useNavigation } from "@react-navigation/native";
import { Bell, Settings } from "lucide-react-native";
import { useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const navigation = useNavigation();
  const totalSteps = 10;
  const currentStep = 7.5; // mock progress
  const progressPercent = (currentStep / totalSteps) * 100;

  const icons = [Angry, Worried, Confused, Happy, Excited];

  const scrollRef = useRef<ScrollView>(null);
  const [activitiesY, setActivitiesY] = useState(0);

  const handleExploreMore = () => {
    scrollRef.current?.scrollTo({ y: activitiesY - 5, animated: true });
  };
  return (
    <View className="flex-1 bg-[#FAF9FF]">
      {/* Heading */}
      <View className="w-full flex-row items-center justify-between py-4 px-4 border-b border-gray-200 bg-[#FAF9FF] mt-8">
        <View className="flex-row items-center">
          <Logo width={80} height={30} />
          <Text className="font-[Poppins-Bold] text-2xl text-[#7F56D9] ml-2">
            SOULSPACE
          </Text>
        </View>
        <View className="flex-row items-center gap-4">
          <Bell strokeWidth={1.5} />
          <Settings strokeWidth={1.5} />
        </View>
      </View>

      {/* Body */}
      <View className="flex-1 bg-[#FAF9FF]">
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ flexGrow: 1 }}
          className="p-4"
        >
          {/* Greeting Card */}
          <View className="flex-row justify-between items-center bg-[#7F56D9] rounded-2xl">
            {/* Left side*/}
            <View className="flex-1 pl-4 pt-4 pb-4">
              <Text className="text-white font-[Poppins-Bold] text-2xl">
                Hello, SE405
              </Text>
              <Text className="text-white mt-2 font-[Poppins-Regular] text-sm">
                Hope you are enjoying your day. If not then we are here for you
                as always.
              </Text>
              <TouchableOpacity
                className="mt-4 bg-white rounded-full px-4 py-2 self-start"
                onPress={handleExploreMore}
              >
                <Text className="text-[#7F56D9] font-[Poppins-SemiBold]">
                  Explore more
                </Text>
              </TouchableOpacity>
            </View>

            {/* Right side */}
            <Decor width={100} height={170} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

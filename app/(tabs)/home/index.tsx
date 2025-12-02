import Activity1 from "@/assets/images/activity1.svg";
import Activity2 from "@/assets/images/activity2.svg";
import Activity3 from "@/assets/images/activity3.svg";
import Activity4 from "@/assets/images/activity4.svg";
import Activity5 from "@/assets/images/activity5.svg";
import Activity6 from "@/assets/images/activity6.svg";
import Angry from "@/assets/images/angry.svg";
import Confused from "@/assets/images/confused.svg";
import Decor from "@/assets/images/decor.svg";
import Excited from "@/assets/images/excited.svg";
import Happy from "@/assets/images/happy.svg";
import Logo from "@/assets/images/logo.svg";
import Worried from "@/assets/images/worried.svg";
import MoodTrends from "@/components/MoodTrends";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { ArrowBigRight, Bell, Settings } from "lucide-react-native";
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

          {/* Progress */}
          <Text className="text-black font-[Poppins-Bold] text-2xl mt-6">
            How are you feeling today ?
          </Text>
          <View className="w-full items-center mt-6">
            <TouchableOpacity
              className="w-full"
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/home/diary")}
            >
              <View className="w-full h-6 bg-gray-200 rounded-full relative overflow-hidden">
                {/* Thanh progress */}
                <View
                  style={{ width: `${progressPercent}%` }}
                  className="absolute left-0 top-0 h-6 bg-[#7F56D9] rounded-full"
                />
              </View>
              {/* Icon cảm xúc */}
              <View className="flex-row justify-between w-full mt-[-25] px-2">
                {icons.map((Icon, index) => (
                  <View
                    key={index}
                    className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center shadow"
                  >
                    <Icon width={20} height={20} />
                  </View>
                ))}
              </View>
            </TouchableOpacity>
            <MoodTrends />
          </View>

          <View onLayout={(e) => setActivitiesY(e.nativeEvent.layout.y)}>
            <Text className="text-black font-[Poppins-Bold] text-2xl mt-6 mb-6">
              Activities you may like
            </Text>
            <View>
              <View className="self-stretch inline-flex flex-col justify-start items-start gap-4">
                <View className="flex-row w-full gap-4">
                  {/* Ảnh 1 */}
                  <View className="relative flex-1 items-center">
                    <Activity2 width={180} height={180} />
                    <TouchableOpacity
                      className="absolute bottom-2 right-2 bg-[#FFB34D] rounded-full p-3 shadow"
                      onPress={() => router.push("/(tabs)/home/remind")}
                    >
                      <ArrowBigRight color="white" size={24} />
                    </TouchableOpacity>
                  </View>

                  {/* Ảnh 2 */}
                  <View className="relative flex-1 items-center">
                    <Activity1
                      width={180}
                      height={180}
                      preserveAspectRatio="xMidYMid meet"
                    />
                    <TouchableOpacity
                      className="absolute bottom-2 right-2 bg-[#3A6FE6] rounded-full p-3 shadow"
                      onPress={() => router.push("/(tabs)/explore")}
                    >
                      <ArrowBigRight color="white" size={24} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row w-full gap-4">
                  {/* Ảnh 3 */}
                  <View className="relative flex-1 items-center">
                    <Activity3 width={180} height={180} />
                    <TouchableOpacity
                      className="absolute bottom-2 right-2 bg-[#D15743] rounded-full p-3 shadow"
                      onPress={() => router.push("/(tabs)/home/minigame")}
                    >
                      <ArrowBigRight color="white" size={24} />
                    </TouchableOpacity>
                  </View>

                  {/* Ảnh 4 */}
                  <View className="relative flex-1 items-center">
                    <Activity4 width={180} height={180} />
                    <TouchableOpacity
                      className="absolute bottom-2 right-2 bg-[#4CAADD] rounded-full p-3 shadow"
                      onPress={() => router.push("/(tabs)/home/diary")}
                    >
                      <ArrowBigRight color="white" size={24} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row w-full mb-8 gap-4">
                  {/* Ảnh 5 */}
                  <View className="relative flex-1 items-center">
                    <Activity5
                      width={180}
                      height={180}
                      preserveAspectRatio="xMidYMid meet"
                    />
                    <TouchableOpacity
                      className="absolute bottom-2 right-2 bg-[#34D1BF] rounded-full p-3 shadow"
                      onPress={() => router.push("/(tabs)/home/plant")}
                    >
                      <ArrowBigRight color="white" size={24} />
                    </TouchableOpacity>
                  </View>

                  {/* Ảnh 6 */}
                  <View className="relative flex-1 items-center">
                    <Activity6
                      width={180}
                      height={180}
                      preserveAspectRatio="xMidYMid meet"
                    />
                    <TouchableOpacity
                      className="absolute bottom-2 right-2 bg-[#D3A819] rounded-full p-3 shadow"
                      onPress={() => router.navigate("/(tabs)/community")}
                    >
                      <ArrowBigRight color="white" size={24} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

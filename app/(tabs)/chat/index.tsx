import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatScreen() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  // MOCK DATA
  const experts = [
    {
      id: 1,
      name: "Peter Smith",
      desc: "Worem consectetur adipisicing elit.",
      avatar: "https://i.pravatar.cc/100?img=12",
      time: "12.50",
      unread: 2,
    },
    {
      id: 2,
      name: "Linda Johnson",
      desc: "Worem consectetur adipisicing elit.",
      avatar: "https://i.pravatar.cc/100?img=13",
      time: "12.50",
      unread: 0,
    },
    {
      id: 3,
      name: "James Williams",
      desc: "Worem consectetur adipisicing elit.",
      avatar: "https://i.pravatar.cc/100?img=14",
      time: "12.50",
      unread: 1,
    },
    {
      id: 4,
      name: "Patricia Brown",
      desc: "Worem consectetur adipisicing elit.",
      avatar: "https://i.pravatar.cc/100?img=15",
      time: "12.50",
      unread: 0,
    },
    {
      id: 5,
      name: "Michael Davis",
      desc: "Worem consectetur adipisicing elit.",
      avatar: "https://i.pravatar.cc/100?img=16",
      time: "12.50",
      unread: 3,
    },
  ];

  const filtered = experts.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-[#FAF9FF] px-4 pt-6">
      {/* SEARCH BAR */}
      <View className="flex-row items-center bg-white rounded-full px-4 py-3 shadow-sm mb-4">
        <Search size={18} color="#A1A1A1" />
        <TextInput
          placeholder="Search expert by name ..."
          placeholderTextColor="#C3C3C3"
          value={search}
          onChangeText={setSearch}
          className="flex-1 ml-2 font-[Poppins-Regular] text-[15px]"
        />
      </View>

      {/* LIST */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-[#F4ECFF] rounded-2xl px-4 py-3 mb-4 flex-row items-center"
            onPress={() =>
              router.push({
                pathname: "/(tabs)/chat/[id]",
                params: { id: String(item.id) },
              })
            }
            style={{ minHeight: 80 }}
          >
            {/* LEFT SIDE */}
            <Image
              source={{ uri: item.avatar }}
              className="w-12 h-12 rounded-full mr-4"
            />

            <View className="flex-1">
              <Text className="text-[15px] font-[Poppins-SemiBold] text-black">
                {item.name}
              </Text>
              <Text className="text-[12px] text-gray-600 font-[Poppins-Regular] mt-[1px]">
                {item.desc}
              </Text>
            </View>

            {/* RIGHT SIDE */}
            <View className="items-end ml-2">
              <Text className="text-[13px] font-[Poppins-Medium] text-black mb-2">
                {item.time}
              </Text>

              {item.unread > 0 && (
                <View className="bg-[#7F56D9] rounded-full px-3 py-[2px]">
                  <Text className="text-white font-[Poppins-SemiBold] text-[12px]">
                    {item.unread}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

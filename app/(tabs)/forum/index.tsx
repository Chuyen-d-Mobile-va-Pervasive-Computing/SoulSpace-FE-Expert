import { useRouter } from "expo-router";
import {
  Bookmark,
  Clock,
  Heart,
  Home,
  MessageCircle,
  MoreVertical,
  Search,
  SlidersHorizontal,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";

type Post = {
  id: number;
  user: string;
  time: number;
  content: string;
  likes: number;
  comments: number;
  saved: boolean;
};

// ===================== MOCK DATA =====================
const mockPosts: Post[] = [
  {
    id: 1,
    user: "Anonymous 264",
    time: 60,
    content:
      "Today I felt anxious at work, but writing it down here makes me feel a bit lighter.",
    likes: 48800,
    comments: 160000,
    saved: true,
  },
  {
    id: 2,
    user: "Anonymous 512",
    time: 10,
    content: "Trying to stay positive today. Hope everyone has a good week!",
    likes: 15000,
    comments: 8000,
    saved: false,
  },
  {
    id: 3,
    user: "Anonymous 118",
    time: 120,
    content: "Any tips on handling burnout? Feeling exhausted lately.",
    likes: 98000,
    comments: 200000,
    saved: true,
  },
];

// ============================== COMPONENT ==============================

export default function ForumScreen() {
  const router = useRouter();

  const tabs = ["Home", "Pending", "History"];
  const tabIcons = [Home, Clock, Bookmark];

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(mockPosts);

  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState("Newest");

  const pagerRef = useRef<React.ElementRef<typeof PagerView>>(null);

  // ===================== FILTER LOGIC =====================
  const applyFilter = (data: Post[]): Post[] => {
    let sorted = [...data];

    switch (filterType) {
      case "Most Liked":
        sorted = sorted.sort((a, b) => b.likes - a.likes);
        break;
      case "Oldest":
        sorted = sorted.sort((a, b) => b.time - a.time);
        break;
      case "Newest":
        sorted = sorted.sort((a, b) => a.time - b.time);
        break;
      case "Most Commented":
        sorted = sorted.sort((a, b) => b.comments - a.comments);
        break;
    }
    return sorted;
  };

  // ===================== SEARCH + FILTER UPDATE =====================
  useEffect(() => {
    let list = [...mockPosts];

    if (page === 1) {
      // PENDING
      list = mockPosts.filter((p) => p.likes < 20000);
    } else if (page === 2) {
      // HISTORY
      list = mockPosts.filter((p) => p.saved === true);
    }

    list = applyFilter(list);

    list = list.filter((p) =>
      p.content.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredData(list);
  }, [search, page, filterType]);

  // ============================== UI START ==============================
  return (
    <View className="flex-1 bg-[#FAF9FF] px-4">
      {/* ===================== SWIPE TABS ===================== */}
      <View className="flex-row justify-between mt-4">
        {tabs.map((t, index) => {
          const Icon = tabIcons[index];
          const isActive = page === index;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setPage(index);
                pagerRef.current?.setPage(index);
              }}
              className="flex-1 items-center"
            >
              <Icon size={22} color={isActive ? "#7F56D9" : "#B4B4B4"} />
              <Text
                className={`text-sm mt-1 font-[Poppins-SemiBold] ${
                  isActive ? "text-[#7F56D9]" : "text-gray-400"
                }`}
              >
                {t}
              </Text>

              {isActive && (
                <View className="w-10 h-[3px] bg-[#7F56D9] rounded-full mt-1" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ===================== SEARCH + FILTER ===================== */}
      <View className="flex-row items-center bg-white mt-5 rounded-full px-4 py-3 shadow-sm">
        <Search size={18} color="#7C7C7C" />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search something..."
          placeholderTextColor="#B4B4B4"
          className="flex-1 pl-3 font-[Poppins-Regular]"
        />

        <TouchableOpacity onPress={() => setShowFilter(true)}>
          <SlidersHorizontal size={20} color="#7F56D9" />
        </TouchableOpacity>
      </View>

      {/* ===================== FILTER MODAL ===================== */}
      <Modal visible={showFilter} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="w-80 bg-white p-6 rounded-2xl">
            <Text className="text-xl font-[Poppins-SemiBold] mb-4 text-[#7F56D9]">
              Filter Posts
            </Text>

            {["Newest", "Oldest", "Most Liked", "Most Commented"].map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setFilterType(type);
                    setShowFilter(false);
                  }}
                  className="py-3"
                >
                  <Text
                    className={`text-[16px] font-[Poppins-Regular] ${
                      filterType === type ? "text-[#7F56D9]" : "text-black"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              )
            )}

            <TouchableOpacity
              onPress={() => setShowFilter(false)}
              className="mt-4"
            >
              <Text className="text-center text-gray-500">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===================== SWIPE CONTENT ===================== */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {/* 3 TAB PAGES */}
        {[0, 1, 2].map((tabIndex) => (
          <ScrollView
            key={tabIndex}
            className="mt-4 pb-24"
            showsVerticalScrollIndicator={false}
          >
            {filteredData.map((item) => {
              // ===================== PENDING CARD =====================
              if (tabIndex === 1) {
                return (
                  <View
                    key={item.id}
                    className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#EAEAEA]"
                  >
                    {/* HEADER */}
                    <View className="flex-row justify-between items-start">
                      <View style={{ flex: 1 }}>
                        <Text className="text-[16px] font-[Poppins-SemiBold] text-black">
                          Dr . Arsitlms
                        </Text>

                        <Text className="text-gray-500 text-[13px] mt-[2px]">
                          Menth Health CLC - Clinic
                        </Text>

                        <Text className="text-gray-500 text-[12px] mt-[1px]">
                          12/12/1212
                        </Text>
                      </View>

                      <MoreVertical size={20} color="#6B6B6B" />
                    </View>

                    {/* CONTENT */}
                    <Text className="mt-3 text-[14px] text-gray-700 leading-5 font-[Poppins-Regular]">
                      Today I felt anxious at work, but writing it down here
                      makes me feel a bit lighter. Today I felt anxious at work,
                      but writing it down here makes me feel a bit lighter.
                    </Text>

                    {/* TIME LIST */}
                    <View className="mt-3">
                      <Text className="text-[14px] text-gray-700">
                        • 9:00 – 12:00
                      </Text>
                      <Text className="text-[14px] text-gray-700 mt-1">
                        • 13:00 – 15:00
                      </Text>
                    </View>

                    {/* IMAGE BANNER */}
                    <Image
                      source={{
                        uri: "https://i.pravatar.cc/200?img=10",
                      }}
                      className="w-full h-40 rounded-xl mt-4"
                      resizeMode="cover"
                    />

                    {/* STATUS */}
                    <View className="items-end mt-4">
                      <View className="bg-[#E9D8FD] px-5 py-[6px] rounded-xl">
                        <Text className="text-[#7F56D9] font-[Poppins-SemiBold] text-[13px]">
                          Pending
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              }

              // ===================== NORMAL POST CARD =====================
              return (
                <View
                  key={item.id}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[15px] font-[Poppins-SemiBold]">
                      {item.user}
                    </Text>
                    <MoreVertical size={18} color="#969696" />
                  </View>

                  <Text className="text-gray-500 text-[12px] mt-[1px]">
                    {item.time} minutes ago
                  </Text>

                  <Text className="mt-3 text-[15px] font-[Poppins-Regular] text-black">
                    {item.content}
                  </Text>

                  <View className="flex-row mt-4 items-center gap-6">
                    <View className="flex-row items-center gap-1">
                      <Heart size={18} color="#E54D4D" />
                      <Text>{(item.likes / 1000).toFixed(1)}K</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MessageCircle size={18} color="#7C7C7C" />
                      <Text>{(item.comments / 1000).toFixed(1)}K</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ))}
      </PagerView>

      {/* ===================== FLOATING + BUTTON ===================== */}
      <TouchableOpacity
        onPress={() => router.push("/forum/create")}
        className="absolute bottom-8 right-6 bg-[#7F56D9] w-14 h-14 rounded-full justify-center items-center shadow-lg"
        style={{ elevation: 6 }}
      >
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>
    </View>
  );
}

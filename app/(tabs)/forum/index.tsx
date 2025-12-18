import { useRouter } from "expo-router";
import {
  Bookmark,
  Clock,
  Home,
  MoreVertical,
  Search,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";

import { getExpertArticles } from "@/lib/api";

/* ===================== TYPES ===================== */

type MockPost = {
  id: number;
  user: string;
  time: number;
  content: string;
};

type Article = {
  _id: string;
  title: string;
  content: string;
  image_url?: string;
  status: "pending" | "approved";
  created_at: string;
};

/* ===================== MOCK HOME DATA ===================== */

const mockPosts: MockPost[] = [
  {
    id: 1,
    user: "Anonymous 264",
    time: 60,
    content:
      "Today I felt anxious at work, but writing it down here makes me feel a bit lighter.",
  },
  {
    id: 2,
    user: "Anonymous 512",
    time: 10,
    content: "Trying to stay positive today. Hope everyone has a good week!",
  },
  {
    id: 3,
    user: "Anonymous 118",
    time: 120,
    content: "Any tips on handling burnout? Feeling exhausted lately.",
  },
];

/* ===================== COMPONENT ===================== */

export default function ForumScreen() {
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);

  const tabs = ["Home", "Pending", "History"];
  const tabIcons = [Home, Clock, Bookmark];

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  // API data
  const [articles, setArticles] = useState<Article[]>([]);
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [approvedArticles, setApprovedArticles] = useState<Article[]>([]);

  /* ===================== FETCH API (ONLY ONCE) ===================== */

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await getExpertArticles();
        setArticles(res);
      } catch (err) {
        console.error("Fetch articles failed", err);
      }
    };

    fetchArticles();
  }, []);

  /* ===================== SPLIT DATA ===================== */

  useEffect(() => {
    setPendingArticles(articles.filter((a) => a.status === "pending"));
    setApprovedArticles(articles.filter((a) => a.status === "approved"));
  }, [articles]);

  /* ===================== UI ===================== */

  return (
    <View className="flex-1 bg-[#FAF9FF] px-4">
      {/* ===================== TABS ===================== */}
      <View className="flex-row justify-between mt-4">
        {tabs.map((t, index) => {
          const Icon = tabIcons[index];
          const active = page === index;

          return (
            <TouchableOpacity
              key={t}
              onPress={() => {
                setPage(index);
                pagerRef.current?.setPage(index);
              }}
              className="flex-1 items-center"
            >
              <Icon size={22} color={active ? "#7F56D9" : "#B4B4B4"} />
              <Text
                className={`text-sm mt-1 font-[Poppins-SemiBold] ${
                  active ? "text-[#7F56D9]" : "text-gray-400"
                }`}
              >
                {t}
              </Text>
              {active && (
                <View className="w-10 h-[3px] bg-[#7F56D9] rounded-full mt-1" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ===================== SEARCH ===================== */}
      <View className="flex-row items-center bg-white mt-5 rounded-full px-4 py-3 shadow-sm">
        <Search size={18} color="#7C7C7C" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search..."
          className="flex-1 pl-3"
        />
      </View>

      {/* ===================== CONTENT ===================== */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {/* ===================== HOME (MOCK) ===================== */}
        <ScrollView key="home" className="mt-4 pb-24">
          {mockPosts
            .filter((p) =>
              p.content.toLowerCase().includes(search.toLowerCase())
            )
            .map((item) => (
              <View
                key={item.id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
              >
                <Text className="font-[Poppins-SemiBold]">{item.user}</Text>
                <Text className="text-xs text-gray-500">
                  {item.time} minutes ago
                </Text>
                <Text className="mt-3">{item.content}</Text>
              </View>
            ))}
        </ScrollView>

        {/* ===================== PENDING (API) ===================== */}
        <ScrollView
          key="pending"
          className="mt-4 pb-24"
          showsVerticalScrollIndicator={false}
        >
          {pendingArticles
            .filter(
              (a) =>
                a.title.toLowerCase().includes(search.toLowerCase()) ||
                a.content.toLowerCase().includes(search.toLowerCase())
            )
            .map((item) => (
              <View
                key={item._id}
                className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#EAEAEA]"
              >
                <View className="flex-row justify-between">
                  <Text className="font-[Poppins-SemiBold] text-[16px]">
                    {item.title}
                  </Text>
                  <MoreVertical size={18} />
                </View>

                <Text className="mt-2 text-gray-600">{item.content}</Text>

                {item.image_url && (
                  <Image
                    source={{ uri: item.image_url }}
                    className="w-full h-40 rounded-xl mt-4"
                  />
                )}

                <View className="items-end mt-4">
                  <View className="bg-[#E9D8FD] px-4 py-1 rounded-xl">
                    <Text className="text-[#7F56D9] text-xs font-semibold">
                      Pending
                    </Text>
                  </View>
                </View>
              </View>
            ))}
        </ScrollView>

        {/* ===================== HISTORY (APPROVED) ===================== */}
        <ScrollView
          key="history"
          className="mt-4 pb-24"
          showsVerticalScrollIndicator={false}
        >
          {approvedArticles
            .filter(
              (a) =>
                a.title.toLowerCase().includes(search.toLowerCase()) ||
                a.content.toLowerCase().includes(search.toLowerCase())
            )
            .map((item) => (
              <View
                key={item._id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
              >
                <Text className="font-[Poppins-SemiBold] text-[16px]">
                  {item.title}
                </Text>
                <Text className="mt-2">{item.content}</Text>

                {item.image_url && (
                  <Image
                    source={{ uri: item.image_url }}
                    className="w-full h-40 rounded-xl mt-4"
                  />
                )}
              </View>
            ))}
        </ScrollView>
      </PagerView>

      {/* ===================== FAB ===================== */}
      <TouchableOpacity
        onPress={() => router.push("/forum/create")}
        className="absolute bottom-8 right-6 bg-[#7F56D9] w-14 h-14 rounded-full justify-center items-center"
      >
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>
    </View>
  );
}

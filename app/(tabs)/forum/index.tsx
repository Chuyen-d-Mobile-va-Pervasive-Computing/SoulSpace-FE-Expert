import { getExpertArticles, getFeed } from "@/lib/api";
import { useRouter } from "expo-router";
import {
  Bookmark,
  Clock,
  Heart,
  Home,
  MessageCircle,
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

type Article = {
  _id: string;
  title: string;
  content: string;
  image_url?: string;
  status: "pending" | "approved";
  created_at: string;
  hashtags?: string[];
  like_count: number;
  comment_count: number;
  type?: "user_post" | "expert_article";
};

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
  // HOME FEED
  const PAGE_SIZE = 20;

  const [feedAll, setFeedAll] = useState<any[]>([]);
  const [feedPage, setFeedPage] = useState<any[]>([]);
  const [pageHome, setPageHome] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingHome, setLoadingHome] = useState(false);

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

  /* ===================== SPLIT DATA ===================== */

  useEffect(() => {
    if (page !== 0) return;

    const fetchFeed = async () => {
      try {
        setLoadingHome(true);
        const res = await getFeed(100); // lấy full 100 bài
        setFeedAll(res);
        setTotalPages(Math.ceil(res.length / PAGE_SIZE));
      } catch (err) {
        console.error("Fetch feed failed", err);
      } finally {
        setLoadingHome(false);
      }
    };

    fetchFeed();
  }, [page]);

  useEffect(() => {
    const start = (pageHome - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setFeedPage(feedAll.slice(start, end));
  }, [feedAll, pageHome]);

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
        {/* ===================== HOME ===================== */}
        <ScrollView key="home" className="mt-4 pb-32">
          {loadingHome && (
            <Text className="text-center text-gray-400 mt-6">Loading...</Text>
          )}

          {!loadingHome &&
            feedPage
              .filter((item) =>
                item.content?.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <TouchableOpacity
                  key={item._id}
                  onPress={() =>
                    router.push({
                      pathname: "/forum/article-detail",
                      params: {
                        id: item._id,
                        type: item.type, // "user_post" | "expert_article"
                      },
                    })
                  }
                >
                  <View
                    key={item._id}
                    className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                  >
                    {/* AUTHOR */}
                    <View className="flex-row items-center mb-2">
                      <View className="w-9 h-9 rounded-full bg-gray-200 mr-3 justify-center items-center">
                        {item.author_avatar ? (
                          <Image
                            source={{ uri: item.author_avatar }}
                            className="w-9 h-9 rounded-full"
                          />
                        ) : (
                          <Text className="text-xs text-gray-500 font-[Poppins-SemiBold]">
                            {item.author_name?.[0]}
                          </Text>
                        )}
                      </View>

                      <View className="flex-1">
                        <Text className="font-[Poppins-SemiBold] text-[16px]">
                          {item.author_name}
                        </Text>

                        {item.author_role === "expert" && (
                          <Text className="text-[14px] text-[#7F56D9] font-[Poppins-Regular]">
                            Expert
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* TITLE (chỉ expert_article có) */}
                    {item.title && (
                      <Text className="font-[Poppins-Bold] text-[16px] mb-1">
                        {item.title}
                      </Text>
                    )}

                    {/* CONTENT */}
                    <Text className="font-[Poppins-Regular]">
                      {item.content}
                    </Text>

                    {/* HASHTAGS */}
                    {item.hashtags?.length > 0 && (
                      <View className="flex-row flex-wrap mt-3">
                        {item.hashtags.map((tag: string, index: number) => (
                          <View
                            key={index}
                            className="bg-[#E0D7F9] px-3 py-1 rounded-full mr-2 mb-2"
                          >
                            <Text className="text-[#7F56D9] text-xs font-[Poppins-SemiBold]">
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* IMAGE */}
                    {item.image_url && (
                      <Image
                        source={{ uri: item.image_url }}
                        className="w-full h-40 rounded-xl mt-4"
                      />
                    )}

                    {/* LIKE & COMMENT */}
                    <View className="flex-row items-center mt-4 border-t border-gray-100 pt-3">
                      <View className="flex-row items-center mr-6">
                        <Heart size={18} color="#7F56D9" />
                        <Text className="ml-2 text-sm font-[Poppins-Medium]">
                          {item.like_count}
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        <MessageCircle size={18} color="#7F56D9" />
                        <Text className="ml-2 text-sm font-[Poppins-Medium]">
                          {item.comment_count}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

          {/* PAGINATION */}
          <View className="flex-row justify-center items-center mt-4 mb-8">
            <TouchableOpacity
              disabled={pageHome === 1}
              onPress={() => setPageHome((p) => p - 1)}
              className={`px-4 py-2 rounded-xl mr-4 ${
                pageHome === 1 ? "bg-gray-200" : "bg-gray-100"
              }`}
            >
              <Text className="font-[Poppins-Regular]">Prev</Text>
            </TouchableOpacity>

            <Text className="text-sm font-[Poppins-Medium]">
              {pageHome} / {totalPages}
            </Text>

            <TouchableOpacity
              disabled={pageHome === totalPages}
              onPress={() => setPageHome((p) => p + 1)}
              className={`px-4 py-2 rounded-xl ml-4 ${
                pageHome === totalPages ? "bg-gray-200" : "bg-gray-100"
              }`}
            >
              <Text className="font-[Poppins-Regular]">Next</Text>
            </TouchableOpacity>
          </View>
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
              <TouchableOpacity
                key={item._id}
                onPress={() =>
                  router.push({
                    pathname: "/forum/article-detail",
                    params: {
                      id: item._id,
                      type: "expert_article",
                      status: "pending",
                    },
                  })
                }
              >
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

                  {item.hashtags && item.hashtags.length > 0 && (
                    <View className="flex-row flex-wrap mt-3">
                      {item.hashtags.map((tag, index) => (
                        <View
                          key={index}
                          className="bg-[#E0D7F9] px-3 py-1 rounded-full mr-2 mb-2"
                        >
                          <Text className="text-[#7F56D9] text-xs font-[Poppins-SemiBold]">
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <Text className="mt-2 text-gray-600 font-[Poppins-Regular]">
                    {item.content}
                  </Text>

                  {item.image_url && (
                    <Image
                      source={{ uri: item.image_url }}
                      className="w-full h-40 rounded-xl mt-4"
                    />
                  )}

                  <View className="items-end mt-4">
                    <View className="bg-[#E0D7F9] px-4 py-1 rounded-xl">
                      <Text className="text-[#7F56D9] text-xs font-[Poppins-SemiBold]">
                        Pending
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
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
              <TouchableOpacity
                key={item._id}
                onPress={() =>
                  router.push({
                    pathname: "/forum/article-detail",
                    params: {
                      id: item._id,
                      type: "expert_article",
                      status: "approved",
                    },
                  })
                }
              >
                <View
                  key={item._id}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                >
                  <Text className="font-[Poppins-SemiBold] text-[16px]">
                    {item.title}
                  </Text>

                  {item.hashtags && item.hashtags.length > 0 && (
                    <View className="flex-row flex-wrap mt-3">
                      {item.hashtags.map((tag, index) => (
                        <View
                          key={index}
                          className="bg-[#E0D7F9] px-3 py-1 rounded-full mr-2 mb-2"
                        >
                          <Text className="text-[#7F56D9] text-xs font-[Poppins-SemiBold]">
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <Text className="mt-2 font-[Poppins-Regular]">
                    {item.content}
                  </Text>

                  {item.image_url && (
                    <Image
                      source={{ uri: item.image_url }}
                      className="w-full h-40 rounded-xl mt-4"
                    />
                  )}
                  <View className="flex-row items-center mt-4  pt-3">
                    {/* LIKE */}
                    <View className="flex-row items-center mr-6">
                      <Heart size={18} color="#7F56D9" />
                      <Text className="ml-2 text-sm text-gray-700 font-[Poppins-Medium]">
                        {item.like_count}
                      </Text>
                    </View>

                    {/* COMMENT */}
                    <View className="flex-row items-center">
                      <MessageCircle size={18} color="#7F56D9" />
                      <Text className="ml-2 text-sm text-gray-700 font-[Poppins-Medium]">
                        {item.comment_count}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
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

import { getChats } from "@/lib/api";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatScreen() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatMessageTime = (ts: string | number | undefined) => {
    try {
      if (!ts) return "";
      const d = new Date(ts);
      // Adjust by +7 hours to correct server/client offset
      d.setHours(d.getHours() + 7);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    let alive = true;

    const fetchChats = async () => {
      try {
        const res = await getChats();
        if (!alive) return;

        // ✅ CHỈ SET DATA TỪ BE – KHÔNG ĐỤNG GÌ THÊM
        setChats(res.data || []);
      } catch (error) {
        console.error("Fetch chats error:", error);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchChats();
    const poll = setInterval(fetchChats, 5000);

    return () => {
      alive = false;
      clearInterval(poll);
    };
  }, []);

  const filteredChats = useMemo(() => {
    return chats.filter((item) =>
      item.partner.full_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, chats]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF9FF]">
        <Text>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAF9FF] px-4 pt-6">
      {/* SEARCH BAR */}
      <View className="flex-row items-center bg-white rounded-full px-4 py-3 shadow-sm mb-4">
        <Search size={18} color="#A1A1A1" />
        <TextInput
          placeholder="Search clients by name ..."
          placeholderTextColor="#C3C3C3"
          value={search}
          onChangeText={setSearch}
          className="flex-1 ml-2 font-[Poppins-Regular] text-[15px]"
        />
      </View>

      {/* CHAT LIST */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredChats.map((item, index) => {
          const unreadCount = item.unread_count ?? 0;

          return (
            <TouchableOpacity
              key={`${item.chat_id}-${index}`}
              className="bg-[#ffffff] rounded-2xl px-4 py-3 mb-4 flex-row items-center"
              style={{ minHeight: 80 }}
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/chat/[id]",
                  params: {
                    id: item.chat_id,
                    name: item.partner.full_name,
                    avatar: item.partner.avatar_url,
                    online: String(item.partner.online_status),
                    scroll: "1",
                  },
                });
              }}
            >
              {/* AVATAR */}
              <Image
                source={{ uri: item.partner.avatar_url }}
                className="w-12 h-12 rounded-full mr-4"
              />

              {/* CENTER */}
              <View className="flex-1">
                <Text className="text-[15px] text-black font-[Poppins-Medium]">
                  {item.partner.full_name}
                </Text>

                <Text
                  className={`text-[12px] mt-[2px] ${
                    unreadCount > 0
                      ? "text-black font-[Poppins-SemiBold]"
                      : "text-gray-600 font-[Poppins-Regular]"
                  }`}
                  numberOfLines={1}
                >
                  {item.last_message || "No messages yet"}
                </Text>
              </View>

              {/* RIGHT */}
              <View className="items-end ml-2">
                <Text className="text-[12px] text-gray-500 mb-2">
                  {formatMessageTime(item.last_message_at)}
                </Text>

                {unreadCount > 0 && (
                  <View className="mt-1 bg-[#EF4444] rounded-full px-2 py-1">
                    <Text className="text-[12px] text-white font-[Poppins-SemiBold]">
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredChats.length === 0 && (
          <View className="items-center mt-10">
            <Text className="text-gray-500">No chats found</Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

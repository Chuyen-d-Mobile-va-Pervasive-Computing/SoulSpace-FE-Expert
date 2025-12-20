import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, MessageCircle, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  createAnonComment,
  deleteAnonComment,
  deleteExpertArticle,
  getAnonPostComments,
  getAnonPostDetail,
  getAnonPostLikes,
  getExpertArticleDetail,
  likeAnonPost,
  unlikeAnonPost,
} from "@/lib/api";

type DetailType = "user_post" | "expert_article";
type ArticleStatus = "pending" | "approved";

export default function ArticleDetail() {
  const router = useRouter();

  const { id, type, status } = useLocalSearchParams<{
    id: string;
    type: DetailType;
    status?: ArticleStatus;
  }>();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [showLikes, setShowLikes] = useState(false);
  const [loading, setLoading] = useState(true);

  const isPendingExpert = type === "expert_article" && status === "pending";

  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  const openImage = (url: string) => {
    setModalImageUrl(url);
    setImageModalVisible(true);
  };

  const closeImage = () => {
    setModalImageUrl(null);
    setImageModalVisible(false);
  };

  const handleToggleLike = async () => {
    if (type !== "user_post") return;

    try {
      if (post.is_liked) {
        await unlikeAnonPost(id);
        setPost((prev: any) => ({
          ...prev,
          is_liked: false,
          like_count: prev.like_count - 1,
        }));
      } else {
        await likeAnonPost(id);
        setPost((prev: any) => ({
          ...prev,
          is_liked: true,
          like_count: prev.like_count + 1,
        }));
      }
    } catch (err) {
      Alert.alert("Error", "Like failed");
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);

      const newComment = await createAnonComment(id, commentText);

      setComments((prev) => [newComment, ...prev]);
      setPost((prev: any) => ({
        ...prev,
        comment_count: prev.comment_count + 1,
      }));

      setCommentText("");
    } catch (err) {
      Alert.alert("Error", "Comment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (comment_id: string) => {
    Alert.alert("Delete Comment", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAnonComment(comment_id);
            setComments((prev) => prev.filter((c) => c._id !== comment_id));
            setPost((prev: any) => ({
              ...prev,
              comment_count: prev.comment_count - 1,
            }));
          } catch {
            Alert.alert("Error", "Delete failed");
          }
        },
      },
    ]);
  };

  /* ===================== FETCH DETAIL ===================== */

  useEffect(() => {
    if (!id || !type) return;

    const fetchDetail = async () => {
      try {
        if (type === "user_post") {
          const [postRes, commentRes] = await Promise.all([
            getAnonPostDetail(id),
            getAnonPostComments(id),
          ]);

          setPost(postRes);
          setComments(commentRes);
        }

        if (type === "expert_article") {
          const res = await getExpertArticleDetail(id);
          setPost(res);
          setComments([]);
        }
      } catch (err) {
        console.error("Fetch detail failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, type]);

  /* ===================== HANDLERS ===================== */

  const handleShowLikes = async () => {
    if (type !== "user_post") return;

    try {
      const res = await getAnonPostLikes(id);
      setLikes(res);
      setShowLikes(true);
    } catch (err) {
      console.error("Fetch likes failed", err);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteExpertArticle(id);
            router.back();
          } catch (err) {
            Alert.alert("Error", "Delete failed");
          }
        },
      },
    ]);
  };

  /* ===================== LOADING / ERROR ===================== */

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAF9FF]">
        <Text className="text-gray-400">Loading...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAF9FF]">
        <Text className="text-gray-400">Post not found</Text>
      </View>
    );
  }

  /* ===================== UI ===================== */

  return (
    <KeyboardAvoidingView enabled={true} className="flex-1" behavior="padding">
      <View className="flex-1 bg-[#FAF9FF]">
        <ScrollView className="px-4 pb-32">
          {/* AUTHOR */}
          <View className="flex-row items-center mt-6">
            {type === "expert_article" && post.expert_avatar ? (
              <Image
                source={{ uri: post.expert_avatar }}
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-gray-300 mr-3 justify-center items-center">
                <Text className="text-xs text-gray-600">?</Text>
              </View>
            )}

            <View>
              <Text className="font-[Poppins-SemiBold] text-[16px]">
                {type === "expert_article"
                  ? post.expert_name
                  : post.author_name || "Ẩn danh"}
              </Text>
              <Text className="text-xs text-gray-500">
                {type === "expert_article" ? "Expert" : "Anonymous"}
              </Text>
            </View>
          </View>

          {/* TITLE (expert only) */}
          {type === "expert_article" && (
            <Text className="mt-6 text-[18px] font-[Poppins-Bold]">
              {post.title}
            </Text>
          )}

          {/* CONTENT */}
          <Text className="mt-4 text-gray-800 leading-6 font-[Poppins-Regular]">
            {post.content}
          </Text>

          {/* HASHTAGS */}
          {post.hashtags?.length > 0 && (
            <View className="flex-row flex-wrap mt-4">
              {post.hashtags.map((tag: string, index: number) => (
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
          {post.image_url && (
            <TouchableOpacity
              onPress={() => openImage(post.image_url)}
              activeOpacity={0.95}
            >
              <Image
                source={{ uri: post.image_url }}
                className="w-full h-52 rounded-2xl mt-6"
              />
            </TouchableOpacity>
          )}

          {/* LIKE & COMMENT */}
          <View className="flex-row items-center mt-6 border-t border-gray-100 pt-4">
            {type === "user_post" && (
              <TouchableOpacity
                className="flex-row items-center mr-8"
                onPress={handleToggleLike}
              >
                <Heart
                  size={20}
                  color={post.is_liked ? "#7F56D9" : "#B4B4B4"}
                />
                <TouchableOpacity onPress={handleShowLikes}>
                  <Text className="ml-2 font-[Poppins-Medium]">
                    {post.like_count}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}

            <View className="flex-row items-center">
              <MessageCircle size={20} color="#7F56D9" />
              <Text className="ml-2 font-[Poppins-Medium]">
                {post.comment_count}
              </Text>
            </View>
          </View>

          {/* LIKES LIST (user_post only) */}
          {type === "user_post" && showLikes && likes.length > 0 && (
            <View className="mt-6">
              <Text className="font-[Poppins-SemiBold] mb-2">Liked by</Text>
              {likes.map((u) => (
                <View key={u.user_id} className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
                  <Text className="font-[Poppins-Regular]">{u.username}</Text>
                </View>
              ))}
            </View>
          )}

          {/* COMMENTS (user_post only) */}
          {type === "user_post" && comments.length > 0 && (
            <View className="mt-8">
              <Text className="font-[Poppins-SemiBold] mb-3">Comments</Text>

              {comments.map((c) => (
                <View
                  key={c._id}
                  className="bg-white rounded-xl p-3 mb-3 shadow-sm"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="font-[Poppins-SemiBold]">
                      {c.username || "Anonymous"}
                    </Text>

                    {c.is_owner && (
                      <TouchableOpacity
                        onPress={() => handleDeleteComment(c._id)}
                      >
                        <Trash2 size={14} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text className="mt-1 text-gray-700 font-[Poppins-Regular]">
                    {c.content}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {type === "user_post" && (
            <View className="mt-6 bg-white rounded-xl p-3 shadow-sm">
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Write a comment..."
                multiline
                className="text-gray-800 font-[Poppins-Regular]"
              />

              <TouchableOpacity
                onPress={handleSubmitComment}
                disabled={submitting}
                className="mt-3 bg-[#7F56D9] py-2 rounded-lg"
              >
                <Text className="text-center text-white font-[Poppins-SemiBold]">
                  {submitting ? "Posting..." : "Post Comment"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* DELETE POST (pending expert only) */}
          {isPendingExpert && (
            <TouchableOpacity
              onPress={handleDelete}
              className="mt-10 mb-6 bg-red-500 py-4 rounded-xl"
            >
              <View className="flex-row justify-center items-center">
                <Trash2 size={18} color="white" />
                <Text className="ml-2 text-white font-[Poppins-SemiBold]">
                  Delete Post
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Image Modal (full-screen, zoomable) */}
        <Modal
          visible={imageModalVisible}
          transparent={true}
          onRequestClose={closeImage}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={closeImage}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>

            <ScrollView
              maximumZoomScale={3}
              minimumZoomScale={1}
              contentContainerStyle={styles.modalScrollContainer}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              {modalImageUrl && (
                <Image
                  source={{ uri: modalImageUrl }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT * 0.9,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

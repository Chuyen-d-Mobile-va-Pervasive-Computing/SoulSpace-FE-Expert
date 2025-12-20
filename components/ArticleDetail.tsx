import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, MessageCircle, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
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

  // popup modal state (info and confirm)
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [popupIsConfirm, setPopupIsConfirm] = useState(false);
  const [popupConfirmLoading, setPopupConfirmLoading] = useState(false);
  const [popupDestructive, setPopupDestructive] = useState(false);
  const [popupWarningText, setPopupWarningText] = useState<string | null>(null);
  const popupConfirmRef = React.useRef<(() => Promise<void>) | null>(null);

  const showInfoPopup = (title: string, message?: string) => {
    setPopupTitle(title);
    setPopupMessage(message || null);
    setPopupIsConfirm(false);
    setPopupDestructive(false);
    setPopupWarningText(null);
    popupConfirmRef.current = null;
    setPopupVisible(true);
  };

  type ConfirmOptions = { destructive?: boolean; warningText?: string };

  const showConfirmPopup = (
    title: string,
    message: string,
    onConfirm: () => Promise<void>,
    options?: ConfirmOptions
  ) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupIsConfirm(true);
    setPopupDestructive(!!options?.destructive);
    setPopupWarningText(options?.warningText || null);
    popupConfirmRef.current = onConfirm;
    setPopupVisible(true);
  };

  const handlePopupConfirm = async () => {
    if (!popupConfirmRef.current) {
      setPopupVisible(false);
      return;
    }

    try {
      setPopupConfirmLoading(true);
      await popupConfirmRef.current();
    } catch (err) {
      console.error("Popup confirm action failed", err);
      showInfoPopup("Error", "Action failed");
    } finally {
      setPopupConfirmLoading(false);
      setPopupVisible(false);
    }
  };

  const openImage = (url: string) => {
    setModalImageUrl(url);
    setImageModalVisible(true);
  };

  const closeImage = () => {
    setModalImageUrl(null);
    setImageModalVisible(false);
  };

  const handleToggleLike = async () => {
    if (!post) return;

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
      showInfoPopup("Error", "Like failed");
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);

      // Try creating anon comment for both anon posts and expert articles
      const newComment = await createAnonComment(id, commentText);

      // optimistic: mark the returned comment as owned so trash icon appears immediately
      if (newComment && typeof newComment === "object") {
        (newComment as any).is_owner = true;
      }

      setComments((prev) => [newComment, ...prev]);

      // refresh comments from server to ensure correct flags/order (non-blocking)
      try {
        const fresh = await getAnonPostComments(id);
        if (Array.isArray(fresh)) setComments(fresh);
      } catch (err) {
        // ignore refresh errors, optimistic list remains
        console.error("Refresh comments failed", err);
      }
      setPost((prev: any) => ({
        ...prev,
        comment_count: prev.comment_count + 1,
      }));

      setCommentText("");
    } catch (err) {
      showInfoPopup("Error", "Comment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (comment_id: string) => {
    showConfirmPopup(
      "Delete Comment",
      "Are you sure? This action cannot be undone.",
      async () => {
        try {
          await deleteAnonComment(comment_id);
          setComments((prev) => prev.filter((c) => c._id !== comment_id));
          setPost((prev: any) => ({
            ...prev,
            comment_count: prev.comment_count - 1,
          }));
        } catch (err) {
          showInfoPopup("Error", "Delete failed");
        }
      },
      { destructive: true }
    );
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
          // fetch expert article detail and try to fetch comments/likes using anon endpoints
          const [res, commentRes] = await Promise.all([
            getExpertArticleDetail(id),
            // comments for articles may be exposed via anon-comments endpoint
            getAnonPostComments(id).catch(() => []),
          ]);

          setPost(res);
          setComments(commentRes || []);
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
    try {
      const res = await getAnonPostLikes(id);
      setLikes(res || []);
      setShowLikes(true);
    } catch (err) {
      console.error("Fetch likes failed", err);
      setLikes([]);
      setShowLikes(true);
    }
  };

  const handleDelete = () => {
    showConfirmPopup(
      "Delete Post",
      "Are you sure you want to delete this post?",
      async () => {
        try {
          await deleteExpertArticle(id);
          router.back();
        } catch (err) {
          showInfoPopup("Error", "Delete failed");
        }
      },
      { destructive: true, warningText: "This action cannot be reversed." }
    );
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
            <View className="flex-row items-center mr-6">
              <TouchableOpacity onPress={handleToggleLike} className="mr-2">
                <Heart
                  size={20}
                  color={post.is_liked ? "#7F56D9" : "#B4B4B4"}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleShowLikes}>
                <Text className="ml-2 font-[Poppins-Medium]">
                  {post.like_count}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center">
              <MessageCircle size={20} color="#7F56D9" />
              <Text className="ml-2 font-[Poppins-Medium]">
                {post.comment_count}
              </Text>
            </View>
          </View>

          {/* LIKES LIST: shown in modal when `showLikes` is true */}
          {/* keep the existing trigger (handleShowLikes) on the count */}

          {/* COMMENTS */}
          {comments.length > 0 && (
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

          {/* Comment input (allow for expert_article and user_post) */}
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

        {/* Likes Modal (popup) */}
        <Modal
          visible={showLikes}
          transparent={true}
          onRequestClose={() => setShowLikes(false)}
        >
          <View style={styles.likesModalOverlay}>
            <View style={styles.likesModalContainer}>
              <Text className="font-[Poppins-SemiBold] text-[16px]">
                Liked by
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {likes.length === 0 ? (
                  <Text style={styles.likesEmpty}>No likes yet</Text>
                ) : (
                  likes.map((u) => (
                    <View key={u.user_id} style={styles.likesItemRow}>
                      {/* <View style={styles.likesAvatarPlaceholder} /> */}
                      <Text className="font-[Poppins-Regular] text-[16px]">
                        {u.username}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>

              <TouchableOpacity
                onPress={() => setShowLikes(false)}
                className="self-center bg-[#7F56D9] px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-[Poppins-SemiBold] text-[14px] text-center">
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Generic Info/Confirm Popup */}
        <Modal
          visible={popupVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPopupVisible(false)}
        >
          <View style={styles.popupOverlay}>
            <View style={styles.popupContainer}>
              {popupTitle ? (
                <Text
                  style={
                    popupDestructive
                      ? [styles.popupTitle, styles.popupTitleDestructive]
                      : styles.popupTitle
                  }
                >
                  {popupTitle}
                </Text>
              ) : null}
              {popupMessage ? (
                <Text style={styles.popupMessage}>{popupMessage}</Text>
              ) : null}
              {popupWarningText ? (
                <Text style={styles.popupWarning}>{popupWarningText}</Text>
              ) : null}

              <View style={styles.popupButtonsRow}>
                {popupIsConfirm ? (
                  <>
                    <TouchableOpacity
                      style={styles.popupBtn}
                      onPress={() => setPopupVisible(false)}
                      disabled={popupConfirmLoading}
                    >
                      <Text style={styles.popupBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={
                        popupDestructive
                          ? [styles.popupBtn, styles.popupBtnDestructive]
                          : [styles.popupBtn, styles.popupBtnPrimary]
                      }
                      onPress={handlePopupConfirm}
                      disabled={popupConfirmLoading}
                    >
                      <Text
                        style={
                          popupDestructive
                            ? [styles.popupBtnText, styles.popupBtnPrimaryText]
                            : [styles.popupBtnText, styles.popupBtnPrimaryText]
                        }
                      >
                        {popupDestructive ? "Delete" : "Confirm"}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.popupBtn, styles.popupBtnPrimary]}
                    onPress={() => setPopupVisible(false)}
                  >
                    <Text
                      style={[styles.popupBtnText, styles.popupBtnPrimaryText]}
                    >
                      OK
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>

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
  likesModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  likesModalContainer: {
    width: "100%",
    maxHeight: WINDOW_HEIGHT * 0.7,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  likesItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEE",
  },
  likesAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    marginRight: 12,
  },
  likesEmpty: {
    color: "#6B7280",
    fontStyle: "italic",
    paddingVertical: 8,
  },
  likesCloseBtn: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#7F56D9",
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  popupContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    fontFamily: "Poppins-SemiBold",
  },
  popupTitleDestructive: {
    color: "#B91C1C",
  },
  popupMessage: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  popupButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  popupBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 6,
  },
  popupBtnPrimary: {
    backgroundColor: "#7F56D9",
    borderColor: "#7F56D9",
  },
  popupBtnDestructive: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  popupBtnText: {
    fontSize: 14,
    color: "#111827",
    fontFamily: "Poppins-Regular",
  },
  popupBtnPrimaryText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
  popupWarning: {
    color: "#B91C1C",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
  },
});

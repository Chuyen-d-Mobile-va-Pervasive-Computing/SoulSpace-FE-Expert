import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, MessageCircle, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
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

// cross-platform pinch/zoom wrapper (handle both CJS and ESM default exports)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ImageZoomMod: any = require("react-native-image-pan-zoom");
const ImageZoom: any =
  _ImageZoomMod && _ImageZoomMod.default
    ? _ImageZoomMod.default
    : _ImageZoomMod;
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
  const [popupTitle, setPopupTitle] = useState<React.ReactNode | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [popupIsConfirm, setPopupIsConfirm] = useState(false);
  const [popupConfirmLoading, setPopupConfirmLoading] = useState(false);
  const [popupDestructive, setPopupDestructive] = useState(false);
  const [popupWarningText, setPopupWarningText] = useState<string | null>(null);
  const popupConfirmRef = React.useRef<(() => Promise<void>) | null>(null);

  const showInfoPopup = (title: React.ReactNode, message?: string) => {
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
    title: React.ReactNode,
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
      <Text className="font-[Poppins-Bold] text-[#EF4444] text-[16px]">
        Delete Comment
      </Text>,
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
                className="w-full rounded-2xl mt-6"
                style={{ aspectRatio: 1 }}
                resizeMode="contain"
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
          <View className="flex-1 bg-[rgba(0,0,0,0.5)] justify-center items-center px-5">
            <View className="w-full max-h-[70vh] bg-white rounded-lg p-4">
              <Text className="font-[Poppins-SemiBold] text-[16px]">
                Liked by
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} className="mt-2">
                {likes.length === 0 ? (
                  <Text className="font-[Poppins-Italic] text-[14px] mt-4 text-[#6B7280]">
                    No likes yet
                  </Text>
                ) : (
                  likes.map((u) => (
                    <View
                      key={u.user_id}
                      className="flex-row mt-4 items-center gap-2"
                    >
                      <Image
                        source={{ uri: u.avatar_url }}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <Text className="font-[Poppins-Regular] text-[16px]">
                        {u.username}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>

              <TouchableOpacity
                onPress={() => setShowLikes(false)}
                className="self-center bg-[#7F56D9] px-4 py-2 rounded-lg mt-3"
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
          <View className="flex-1 bg-[rgba(0,0,0,0.4)] justify-center items-center px-5">
            <View className="w-full bg-white rounded-lg p-4 items-center">
              {popupTitle ? (
                typeof popupTitle === "string" ? (
                  <Text
                    className={
                      popupDestructive
                        ? "text-[#B91C1C] text-[16px] font-[Poppins-SemiBold] mb-2"
                        : "text-[16px] font-[Poppins-SemiBold] mb-2"
                    }
                  >
                    {popupTitle}
                  </Text>
                ) : (
                  popupTitle
                )
              ) : null}
              {popupMessage ? (
                <Text className="font-[Poppins-Regular] text-[#374151] mt-2">
                  {popupMessage}
                </Text>
              ) : null}
              {popupWarningText ? (
                <Text className="text-[#B91C1C] mb-3 text-center font-[Poppins-Medium]">
                  {popupWarningText}
                </Text>
              ) : null}

              <View className="flex-row justify-center w-full">
                {popupIsConfirm ? (
                  <View className="flex-row mt-4">
                    <TouchableOpacity
                      className="py-2 px-4 rounded-lg border border-[#E5E7EB] mx-1"
                      onPress={() => setPopupVisible(false)}
                      disabled={popupConfirmLoading}
                    >
                      <Text className="text-[14px] text-[#111827] font-[Poppins-Regular]">
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className={`py-2 px-4 rounded-lg mx-1 ${popupDestructive ? "border border-[#EF4444] bg-[#EF4444]" : "border border-[#7F56D9] bg-[#7F56D9]"}`}
                      onPress={handlePopupConfirm}
                      disabled={popupConfirmLoading}
                    >
                      <Text className="text-white font-[Poppins-SemiBold]">
                        {popupDestructive ? "Delete" : "Confirm"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="py-2 px-4 rounded-lg border border-[#7F56D9] bg-[#7F56D9]"
                    onPress={() => setPopupVisible(false)}
                  >
                    <Text className="text-white font-[Poppins-SemiBold] text-[14px]">
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
          <View className="flex-1 bg-[rgba(0,0,0,0.95)] justify-center items-center">
            <TouchableOpacity
              className="absolute top-10 right-5 z-10 p-2"
              onPress={closeImage}
            >
              <Text className="text-white font-[Poppins-SemiBold]">Close</Text>
            </TouchableOpacity>

            {modalImageUrl && (
              <ImageZoom
                cropWidth={WINDOW_WIDTH}
                cropHeight={WINDOW_HEIGHT * 0.9}
                imageWidth={WINDOW_WIDTH}
                imageHeight={WINDOW_HEIGHT * 0.9}
                minScale={0.5}
                maxScale={3}
              >
                <Image
                  source={{ uri: modalImageUrl }}
                  style={{ width: WINDOW_WIDTH, height: WINDOW_HEIGHT * 0.9 }}
                  resizeMode="contain"
                />
              </ImageZoom>
            )}
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

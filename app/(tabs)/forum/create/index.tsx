import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ImagePlus, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  createExpertArticleWithImage,
  uploadExpertArticleImage,
} from "@/lib/api";

export default function CreateForum() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // PICK IMAGE
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([result.assets[0].uri]);
    }
  };

  const removeImage = () => {
    setImages([]);
  };

  const handlePost = async () => {
    if (!title || !content) {
      alert("Title and content are required");
      return;
    }

    try {
      setLoading(true);

      let imageUrl: string | undefined;

      // 1️⃣ upload ảnh trước (GIỐNG avatar)
      if (images.length > 0) {
        const uploadRes = await uploadExpertArticleImage(images[0]);
        imageUrl = uploadRes.image_url;
      }

      // 2️⃣ create article
      await createExpertArticleWithImage({
        title,
        content,
        hashtags: hashtags.trim() || undefined,
        imageUri: images.length > 0 ? images[0] : undefined,
      });

      alert("Post created successfully 🎉");
      router.back();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-[#FAF9FF] px-4 pt-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* TITLE */}
        <Text className="text-[16px] font-[Poppins-Bold] mb-2">Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Article title..."
          className="bg-white p-4 rounded-xl text-[15px] font-[Poppins-Regular]"
        />

        {/* CONTENT */}
        <Text className="text-[16px] font-[Poppins-Bold] mt-6 mb-2">
          Content
        </Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Write your article..."
          placeholderTextColor="#A3A3A3"
          className="bg-white p-4 rounded-2xl min-h-[160px] text-[15px] font-[Poppins-Regular]"
          multiline
          textAlignVertical="top"
        />

        {/* HASHTAGS */}
        <Text className="text-[16px] font-[Poppins-Bold] mt-6 mb-2">
          Hashtags
        </Text>
        <TextInput
          value={hashtags}
          onChangeText={setHashtags}
          placeholder="mental health, stress, life advice"
          className="bg-white p-4 rounded-xl text-[15px] font-[Poppins-Regular]"
        />
        <Text className="text-xs text-gray-400 mt-1">
          Separate hashtags with commas
        </Text>

        {/* IMAGE */}
        <Text className="text-[16px] font-[Poppins-Bold] mt-6 mb-2">
          Image (optional)
        </Text>

        {images.length === 0 ? (
          <TouchableOpacity
            onPress={pickImage}
            className="flex-row items-center justify-center bg-white border border-gray-200 py-4 rounded-xl"
          >
            <ImagePlus size={22} color="#7F56D9" />
            <Text className="ml-2 text-[#7F56D9] font-[Poppins-SemiBold]">
              Choose Image
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="relative mt-2">
            <Image
              source={{ uri: images[0] }}
              className="w-full h-48 rounded-xl"
            />
            <TouchableOpacity
              onPress={removeImage}
              className="absolute top-2 right-2 bg-black/60 w-8 h-8 rounded-full items-center justify-center"
            >
              <X size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* POST BUTTON */}
        <TouchableOpacity
          onPress={handlePost}
          disabled={loading}
          className={`mt-8 py-4 rounded-xl ${
            loading ? "bg-[#D3C8F2]" : "bg-[#7F56D9]"
          }`}
        >
          <Text className="text-center text-white text-lg font-[Poppins-SemiBold]">
            {loading ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>

        <View className="h-20" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

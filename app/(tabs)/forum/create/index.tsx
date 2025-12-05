import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ImagePlus, Search, X } from "lucide-react-native";
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

export default function CreateForum() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [topicSearch, setTopicSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const allTopics = [
    "Mental Health",
    "Work Stress",
    "Family",
    "Relationships",
    "Life Advice",
  ];

  const filteredTopics = allTopics.filter((t) =>
    t.toLowerCase().includes(topicSearch.toLowerCase())
  );

  // PICK REAL IMAGES
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  // REMOVE IMAGE
  const removeImage = (uri: string) => {
    setImages(images.filter((img) => img !== uri));
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
        {/* TEXT AREA */}
        <Text className="text-[16px] font-[Poppins-Medium] mb-2">
          What's on your mind?
        </Text>

        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Write something..."
          placeholderTextColor="#A3A3A3"
          className="bg-white p-4 rounded-2xl min-h-[150px] text-[15px] font-[Poppins-Regular]"
          multiline
          textAlignVertical="top"
        />

        {/* ADD IMAGE */}
        <Text className="text-[16px] font-[Poppins-Medium] mt-6 mb-2">
          Add Images
        </Text>

        <TouchableOpacity
          onPress={pickImage}
          className="flex-row items-center justify-center bg-white border border-gray-200 py-4 rounded-xl"
        >
          <ImagePlus size={24} color="#7F56D9" />
          <Text className="ml-2 text-[#7F56D9] font-[Poppins-SemiBold]">
            Choose from Gallery
          </Text>
        </TouchableOpacity>

        {/* SELECTED IMAGES */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            className="mt-3"
            showsHorizontalScrollIndicator={false}
          >
            {images.map((img, index) => (
              <View key={index} className="relative mr-3">
                <Image source={{ uri: img }} className="w-28 h-28 rounded-xl" />

                {/* DELETE BUTTON */}
                <TouchableOpacity
                  onPress={() => removeImage(img)}
                  className="absolute top-1 -right-2 bg-black/60 w-7 h-7 rounded-full justify-center items-center"
                >
                  <X size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* TOPIC SEARCH */}
        <Text className="text-[16px] font-[Poppins-Medium] mt-6 mb-2">
          Choose a Topic
        </Text>

        <View className="bg-white rounded-xl px-4 py-3 flex-row items-center border border-gray-200">
          <Search size={18} color="#7F56D9" />
          <TextInput
            value={topicSearch}
            onChangeText={setTopicSearch}
            placeholder="Search topics..."
            className="flex-1 ml-2 font-[Poppins-Regular]"
          />
        </View>

        {/* TOPIC LIST OR CREATE NEW */}
        <View className="mt-3">
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topic) => {
              const active = selectedTopic === topic;
              return (
                <TouchableOpacity
                  key={topic}
                  onPress={() => setSelectedTopic(topic)}
                  className={`px-4 py-3 rounded-xl mb-2 border ${
                    active
                      ? "bg-[#7F56D9] border-[#7F56D9]"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`font-[Poppins-Medium] ${
                      active ? "text-white" : "text-black"
                    }`}
                  >
                    {topic}
                  </Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <TouchableOpacity
              onPress={() => setSelectedTopic(topicSearch)}
              className="px-4 py-3 bg-[#E9D8FD] rounded-xl mb-2"
            >
              <Text className="text-[#7F56D9] font-[Poppins-Medium]">
                + Create topic "{topicSearch}"
              </Text>
            </TouchableOpacity>
          )}

          {/* SHOW NEWLY CREATED TOPIC AS SELECTED */}
          {selectedTopic && !allTopics.includes(selectedTopic) && (
            <View className="px-4 py-3 bg-[#7F56D9] rounded-xl mb-2">
              <Text className="text-white font-[Poppins-Medium]">
                {selectedTopic} (new)
              </Text>
            </View>
          )}
        </View>

        {/* POST BUTTON */}
        <TouchableOpacity
          onPress={() =>
            console.log("POST:", { content, images, selectedTopic })
          }
          disabled={!content || !selectedTopic}
          className={`mt-8 py-4 rounded-xl ${
            !content || !selectedTopic ? "bg-[#D3C8F2]" : "bg-[#7F56D9]"
          }`}
        >
          <Text className="text-center text-white text-lg font-[Poppins-SemiBold]">
            Post
          </Text>
        </TouchableOpacity>

        <View className="h-20" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

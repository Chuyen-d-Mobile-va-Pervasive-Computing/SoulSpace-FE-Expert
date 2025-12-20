import ArticleDetail from "@/components/ArticleDetail";
import { useLocalSearchParams } from "expo-router";

export default function ArticleDetailScreen() {
  const { id, type } = useLocalSearchParams<{
    id: string;
    type: "user_post" | "expert_article";
  }>();

  if (!id || !type) return null;

  return <ArticleDetail {...({ type, id } as any)} />;
}

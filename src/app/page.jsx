import { WelcomeScreen } from "@/features/welcome/WelcomeScreen";

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const topic =
    typeof params?.topic === "string" ? params.topic.slice(0, 240) : "";
  const draftKey =
    typeof params?.new === "string" ? params.new.slice(0, 40) : "";
  return <WelcomeScreen key={`${topic}:${draftKey}`} initialTopic={topic} />;
}

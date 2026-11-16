import { LessonWorkspace } from "@/features/lesson/LessonWorkspace";

export const metadata = { title: "Your lesson" };

export default async function LessonPage({ params }) {
  const { id } = await params;
  return <LessonWorkspace lessonId={id} />;
}

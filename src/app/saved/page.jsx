import { LessonLibrary } from "@/features/library/LessonLibrary";
export const metadata = { title: "Saved lessons" };
export default function SavedPage() {
  return <LessonLibrary savedOnly />;
}

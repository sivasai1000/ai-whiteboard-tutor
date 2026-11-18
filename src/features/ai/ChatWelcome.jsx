import { BrandMark } from "@/components/layout/Brand";
import { aiStyles as s } from "./style";

export function ChatWelcome({ children }) {
  return (
    <div className={s.empty}>
      <div className={s.emptyContent}>
        <BrandMark className="mb-5 size-8 text-primary sm:size-9" />
        <h1 className={s.heading}>A little clarity starts here.</h1>
        <p className={s.subtitle}>Ask a question. Work through an idea.</p>
        <div className="mt-6 w-full min-w-0 sm:mt-8">{children}</div>
      </div>
    </div>
  );
}

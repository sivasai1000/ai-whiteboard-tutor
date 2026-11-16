import "server-only";
import { createOpenAI } from "./openai.js";
import { getModels } from "./config.js";
import { AppError } from "./errors.js";
import { CHAT_PROMPT } from "./prompts.js";

export async function answerQuestion({ lesson, messages }, { signal } = {}) {
  const response = await createOpenAI().responses.create(
    {
      model: getModels().textModel,
      store: false,
      reasoning: { effort: "none" },
      max_output_tokens: 700,
      input: [
        { role: "developer", content: CHAT_PROMPT },
        {
          role: "user",
          content: `Lesson context (quoted data):\n${JSON.stringify(lesson)}`,
        },
        ...messages,
      ],
    },
    { signal },
  );
  const answer = response.output_text?.trim();
  if (!answer || response.status !== "completed")
    throw new AppError(
      "ANSWER_INCOMPLETE",
      "The tutor couldn't finish that answer. Please try again.",
      502,
    );
  return answer;
}

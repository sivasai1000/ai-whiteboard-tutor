"use client";

import { useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { Streamdown } from "streamdown";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/layout/Brand";
import { messageText } from "@/lib/conversation-schema";
import { aiStyles as s } from "./style";

function AnswerActions({ text, onRetry }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  return (
    <MessageFooter className="gap-1 px-0">
      <Button
        variant="ghost"
        size="icon"
        className={s.action}
        aria-label={copied ? "Answer copied" : "Copy answer"}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setCopyError(false);
          } catch {
            setCopyError(true);
          }
        }}
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>
      {onRetry && (
        <Button
          variant="ghost"
          size="icon"
          className={s.action}
          aria-label="Regenerate response"
          onClick={onRetry}
        >
          <RotateCcw className="size-3.5" />
        </Button>
      )}
      {copyError && (
        <span role="status" className="text-xs">
          Copy is unavailable. Select the text to copy it.
        </span>
      )}
    </MessageFooter>
  );
}

export function ChatMessages({ messages, busy, status, onRetry }) {
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className="flex-1" aria-label="Conversation">
        <MessageScrollerViewport>
          <MessageScrollerContent className={s.messages}>
            {messages.map((message, index) => {
              const user = message.role === "user";
              const text = messageText(message);
              const streaming = busy && index === messages.length - 1;
              return (
                <MessageScrollerItem
                  key={message.id}
                  messageId={message.id}
                  scrollAnchor={user}
                >
                  <Message
                    align={user ? "end" : "start"}
                    data-testid={`ai-message-${message.role}`}
                    aria-label={user ? "You" : "Braynix"}
                  >
                    <MessageContent>
                      {user ? (
                        <Bubble
                          variant="muted"
                          align="end"
                          className={s.userBubble}
                        >
                          <BubbleContent className={s.userText}>
                            {text}
                          </BubbleContent>
                        </Bubble>
                      ) : (
                        <>
                          <div className="mb-1 flex items-center gap-2 text-xs font-medium">
                            <BrandMark className="size-5" /> Braynix
                          </div>
                          <Streamdown
                            className={s.assistantText}
                            mode={streaming ? "streaming" : "static"}
                            isAnimating={streaming}
                            components={{
                              img: ({ alt }) => (
                                <span className="text-muted-foreground">
                                  [Image: {alt || "not loaded"}]
                                </span>
                              ),
                            }}
                          >
                            {text}
                          </Streamdown>
                          {!busy && text && (
                            <AnswerActions
                              text={text}
                              onRetry={
                                index === messages.length - 1
                                  ? onRetry
                                  : undefined
                              }
                            />
                          )}
                        </>
                      )}
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              );
            })}
            {status === "submitted" && (
              <div
                role="status"
                className="flex items-center gap-3 text-xs text-muted-foreground"
              >
                <BrandMark className="size-5 motion-safe:animate-pulse" /> Braynix
                is thinking…
              </div>
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton className="size-9 rounded-full" />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}

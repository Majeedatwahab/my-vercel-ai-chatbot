import { ChatRequestOptions, Message } from "ai";
import { PreviewMessage, ThinkingMessage } from "./message";
import { useScrollToBottom } from "./use-scroll-to-bottom";
import { memo, useState } from "react";
import { Vote } from "@/lib/db/schema";
import equal from "fast-deep-equal";
import LearningCard from "@/components/Learning-CardBox";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  isArtifactVisible: boolean;
}

function PureMessages({
  chatId,
  isLoading,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
    >
      {messages.map((message, index) => {
        let learningCardData = null;

        if (message.role === "assistant" && message.content) {
          try {
            const cleanedContent = message.content
              .replace(/```json|```/g, "")
              .trim();
            const parsedContent = JSON.parse(cleanedContent);

            console.log("Parsed Content:", parsedContent);

            learningCardData =
              parsedContent.learningCard || parsedContent.data?.learningCard;
          } catch (error) {
            console.log("Invalid JSON format in message:", message.content);
          }
        }

        return learningCardData ? (
          <LearningCard
            key={message.id}
            learningContent={{
              title: learningCardData.title || "No Title",
              overview: learningCardData.overview || "No Overview",
              concepts: Array.isArray(learningCardData.concepts)
                ? learningCardData.concepts
                : [],
              keyTerminologies: Array.isArray(learningCardData.keyTerminologies)
                ? learningCardData.keyTerminologies
                : [],
                
              explore: {
                relatedTopics:
                  learningCardData.explore &&
                  learningCardData.explore.relatedTopics
                    ? learningCardData.explore.relatedTopics
                    : ["No related topics available."],
                suggestedQuestions:
                  learningCardData.explore &&
                  learningCardData.explore.suggestedQuestions
                    ? learningCardData.explore.suggestedQuestions
                    : ["No suggested questions available."],
                note:
                  learningCardData.explore && learningCardData.explore.note
                    ? learningCardData.explore.note
                    : ["No notes available."],
              },
              prerequisites: learningCardData.prerequisites || [],
            }}
            
          />
        ) : (
          <PreviewMessage
            key={message.id}
            chatId={chatId}
            message={message}
            isLoading={isLoading && messages.length - 1 === index}
            vote={
              votes
                ? votes.find((vote) => vote.messageId === message.id)
                : undefined
            }
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
          />
        );
      })}

      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && <ThinkingMessage />}
      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.isLoading && nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});

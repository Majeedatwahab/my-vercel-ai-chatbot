import type { ChatRequestOptions, Message, CreateMessage } from "ai";
import { PreviewMessage, ThinkingMessage } from "./message";
import { useScrollToBottom } from "./use-scroll-to-bottom";
import { Greeting } from "./greeting";
import { memo, } from "react";
import type { Vote } from "@/lib/db/schema";
import equal from "fast-deep-equal";
import LearningCard from "@/components/LearningCard";
import LearningPathwayCard from "@/components/LearningPathwayCard"
interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
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
      {messages.length === 0 && <Greeting />}
      {messages.map((message, index) => {
        let learningCardData = null;
        let learningPathwayData = null;

        if (message.role === "assistant" && message.content) {
          try {
            const cleanedContent = message.content
              .replace(/```json|```/g, "")
              .trim();
            const parsedContent = JSON.parse(cleanedContent);

            console.log("Parsed Content:", parsedContent);

            // Extract learning card data if available
            learningCardData =
              parsedContent.learningCard || parsedContent.data?.learningCard;

            // Extract learning pathway data if available
            learningPathwayData =
              parsedContent.learningPathway ||
              parsedContent.data?.learningPathway;
          } catch (error) {
            console.log("Invalid JSON format in message:", message.content);
          }
        }

        if (learningPathwayData) {
          async function append(
            message: Message | CreateMessage,
            chatRequestOptions?: ChatRequestOptions
          ): Promise<string | null | undefined> {
            try {
              // Simulate an API call to append the message
              const response = await fetch("/api/append-message", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ message, chatRequestOptions }),
              });

              if (!response.ok) {
                throw new Error("Failed to append message");
              }

              const result = await response.json();
              return result.messageId;
            } catch (error) {
              console.error("Error appending message:", error);
              return null;
            }
          }
          // Render LearningPathwayCard if AI generated it
          return (
            <LearningPathwayCard
              key={message.id}
              chatId={chatId}
              append={append}
              title={learningPathwayData?.title ?? "No Title"}
              description={learningPathwayData?.description ?? "No Description"}
              levels={learningPathwayData?.levels ?? {}}
            />
          );
        }

        // Render Learning Card if AI generated it
        if (learningCardData) {
          return (
            <LearningCard
              key={message.id}
              learningContent={{
                title: learningCardData.title || "No Title",
                overview: learningCardData.overview || "No Overview",
                concepts: Array.isArray(learningCardData.concepts)
                  ? learningCardData.concepts
                  : [],
                keyTerminologies: Array.isArray(
                  learningCardData.keyTerminologies
                )
                  ? learningCardData.keyTerminologies
                  : [],
                explore: {
                  relatedTopics:
                    learningCardData.explore &&
                    Array.isArray(learningCardData.explore.relatedTopics)
                      ? learningCardData.explore.relatedTopics.map(
                          (t: string | { title: string }) =>
                            typeof t === "string" ? t : t.title
                        )
                      : ["No related topics available."],
                  suggestedQuestions: learningCardData.explore
                    ?.suggestedQuestions
                    ? learningCardData.explore.suggestedQuestions
                    : ["No suggested questions available."],
                  note: learningCardData.explore?.note
                    ? learningCardData.explore.note
                    : ["No notes available."],
                },
                prerequisites: learningCardData.prerequisites || [],
              }}
            />
          );
        }

        // Default: Render regular chat message
        return (
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

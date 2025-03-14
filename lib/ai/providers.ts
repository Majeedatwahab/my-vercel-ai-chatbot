import { google} from "@ai-sdk/google";
import { fireworks } from "@ai-sdk/fireworks";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  
} from "ai";

export const DEFAULT_CHAT_MODEL: string = "chat-model-small";
// need to upgrade model to gemini-2.0 since these models will become available in may 2025 and september 2025
export const myProvider = customProvider({
  languageModels: {
    "chat-model-small": google("gemini-1.5-pro-latest"),
    "chat-model-large": google("gemini-1.5-flash-latest"),
    "chat-model-reasoning": wrapLanguageModel({
      model: fireworks("accounts/fireworks/models/deepseek-r1"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": google("gemini-1.5-pro-latest"),
    "artifact-model": google("gemini-1.5-flash-latest"),
  },
 
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: "chat-model-small",
    name: "Small model",
    description: "Small model for fast, lightweight tasks",
  },
  {
    id: "chat-model-large",
    name: "Large model",
    description: "Large model for complex, multi-step tasks",
  },
  {
    id: "chat-model-reasoning",
    name: "Reasoning model",
    description: "Uses advanced reasoning",
  },
];

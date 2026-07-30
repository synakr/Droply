export type PageId =
  | "login-page"
  | "create-page"
  | "chat-page"
  | "contacts-page"
  | "loc-page"
  | "documents-page"
  | "orders-page"
  | "recordings-page"
  | "map-page";

export interface ChatMessage {
  sender: string;
  text: string;
  isUser?: boolean;
}

export interface ApiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

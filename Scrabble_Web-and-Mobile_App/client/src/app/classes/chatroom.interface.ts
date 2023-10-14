import { ChatMessage } from '@app/classes/chat-message';

export interface ChatRoom {
    name: string;
    participants: string[];
    creator: string;
    chatHistory: ChatMessage[];
}

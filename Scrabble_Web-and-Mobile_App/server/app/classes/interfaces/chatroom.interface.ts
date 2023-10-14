import { ChatMessage } from '@app/classes/chat-message';

export class ChatRoom {
    name: string;
    participants: string[];
    creator: string;
    chatHistory: ChatMessage[];
}

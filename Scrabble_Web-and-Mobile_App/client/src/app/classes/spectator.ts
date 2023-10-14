import { ChatMessage } from './chat-message';

export class Spectator {
    socketId: string;
    name: string;
    chatHistory: ChatMessage[];

    constructor(nameSpectator: string) {
        this.name = nameSpectator;
        this.socketId = '';
        this.chatHistory = [];
    }
}

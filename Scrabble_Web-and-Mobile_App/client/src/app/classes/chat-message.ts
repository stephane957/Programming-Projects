export class ChatMessage {
    senderName: string;
    msg: string;
    timestamp: number;

    constructor(senderName: string, msg: string) {
        this.senderName = senderName;
        this.msg = msg;
        this.timestamp = new Date().getTime();
    }
}

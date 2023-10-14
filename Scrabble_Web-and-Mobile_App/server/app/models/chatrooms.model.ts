import { Document, model, Schema } from 'mongoose';
import { ChatRoom } from '@app/classes/interfaces/chatroom.interface';

const messageSchema: Schema = new Schema({
    msg: {
        type: String,
        required: true,
    },
    senderName: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    },
});

const chatRoomsSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    chatHistory: [
        {
            type: messageSchema,
        },
    ],
});

const chatRoomModel = model<ChatRoom & Document>('Chatroom', chatRoomsSchema);

export default chatRoomModel;

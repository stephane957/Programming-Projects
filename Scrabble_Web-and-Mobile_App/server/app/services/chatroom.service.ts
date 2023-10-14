import { ChatRoom } from '@app/classes/interfaces/chatroom.interface';
import chatRoomModel from '@app/models/chatrooms.model';
import { Service } from 'typedi';
import { isEmpty } from '@app/utils/utils';
import * as io from 'socket.io';
import { User } from '@app/classes/users.interface';
import * as Constants from '@app/classes/global-constants';
import UserService from '@app/services/user.service';

@Service()
class ChatRoomService {
    chatRooms = chatRoomModel;
    private userService = new UserService();

    async createChatRoom(userName: string, dbUserId: string, chatRoomName: string, socket: io.Socket): Promise<ChatRoom> {
        if (isEmpty(chatRoomName)) {
            socket.emit('messageServer', 'Chat room name is empty.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }
        if (chatRoomName.toLowerCase() === 'game' || chatRoomName.toLowerCase() === 'partie') {
            socket.emit('messageServer', 'The chat room name ' + chatRoomName + ' is reserved.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }
        const chatRoom: ChatRoom = (await this.chatRooms.findOne({ name: chatRoomName })) as ChatRoom;
        if (chatRoom) {
            socket.emit('messageServer', 'The chat room ' + chatRoomName + ' already exists.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }
        const newChatRoom = await this.chatRooms.create({
            name: chatRoomName,
            participants: [dbUserId],
            creator: dbUserId,
            chatHistory: [],
        });
        if (!newChatRoom) {
            socket.emit('messageServer', 'The chat room ' + chatRoomName + ' could not be created.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }
        socket.join(chatRoomName + Constants.CHATROOM_SUFFIX);
        return newChatRoom;
    }

    async deleteChatRoom(dbUserId: string, chatRoomName: string, socket: io.Socket): Promise<ChatRoom> {
        if (isEmpty(chatRoomName)) {
            socket.emit('messageServer', 'Chat room name is empty.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }
        const chatRoom: ChatRoom = (await this.chatRooms.findOne({ name: chatRoomName })) as ChatRoom;
        if (!chatRoom) {
            socket.emit('messageServer', 'The chat room ' + chatRoomName + ' does not exist.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }
        if (chatRoom.creator.toString() !== dbUserId) {
            socket.emit('messageServer', 'You are not the creator of the chat room ' + chatRoomName + '.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }
        const deleteChatRoom = (await this.chatRooms.findOneAndDelete({ name: chatRoomName })) as ChatRoom;
        if (!deleteChatRoom) {
            socket.emit('messageServer', 'The chat room ' + chatRoomName + ' could not be deleted.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }
        return Promise.resolve({ name: 'noReturn', participants: [], creator: '', chatHistory: [] });
    }

    async joinChatRoom(dbUserId: string, chatRoomName: string, socket: io.Socket): Promise<ChatRoom> {
        if (isEmpty(chatRoomName)) {
            socket.emit('messageServer', 'Chat room name is empty.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }
        const chatRoom: ChatRoom = (await this.chatRooms.findOne({ name: chatRoomName })) as ChatRoom;
        if (!chatRoom) {
            socket.emit('messageServer', 'The chat room ' + chatRoomName + ' does not exist.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }
        if (chatRoom.participants.includes(dbUserId)) {
            socket.emit('messageServer', 'You are already a participant of the chat room ' + chatRoomName + '.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }
        const updateResult = await this.chatRooms.updateOne({ name: chatRoomName }, { $push: { participants: dbUserId } }, { new: true });
        if (!updateResult) {
            socket.emit('messageServer', 'You could not be added to the chat room ' + chatRoomName + '.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }
        socket.join(chatRoomName + Constants.CHATROOM_SUFFIX);
        return (await this.chatRooms.findOne({ name: chatRoomName })) as ChatRoom;
    }

    async leaveChatRoom(dbUserId: string, chatRoomName: string, socket: io.Socket): Promise<void> {
        if (isEmpty(chatRoomName)) {
            socket.emit('messageServer', 'Chat room name is empty.');
            return Promise.resolve();
        }
        const chatRoom: ChatRoom = (await this.chatRooms.findOne({ name: chatRoomName })) as ChatRoom;
        if (!chatRoom) {
            socket.emit('messageServer', 'The chat room ' + chatRoomName + ' does not exist.');
            return Promise.resolve();
        }
        if (!chatRoom.participants.includes(dbUserId)) {
            socket.emit('messageServer', 'You are not a participant of the chat room ' + chatRoomName + '.');
            return Promise.resolve();
        }
        // delete the chat room if the user is the creator and the chat room has no other participants
        if (chatRoom.participants.length === 1) {
            await this.deleteChatRoom(dbUserId, chatRoomName, socket);
            return Promise.resolve();
        }
        let isNewCreator = false;
        // if the user leaving is the creator, we appoint a new one
        if (chatRoom.creator.toString() === dbUserId) {
            await this.appointNewCreator(dbUserId, chatRoom, socket);
            isNewCreator = true;
        }
        const result = await this.chatRooms.updateOne({ name: chatRoomName }, { $pull: { participants: dbUserId } }, { new: true });
        if (!result) {
            socket.emit('messageServer', 'You could not be removed from the chat room ' + chatRoomName + '.');
            return Promise.resolve();
        }
        if (isNewCreator) {
            const newChatRoom = (await this.chatRooms.findOne({ name: chatRoomName })) as ChatRoom;
            const newChatRoomPopulated = await this.populateCreatorField(newChatRoom);
            socket.broadcast.to(chatRoomName + Constants.CHATROOM_SUFFIX).emit('setChatRoom', newChatRoomPopulated);
        }
        socket.leave(chatRoomName + Constants.CHATROOM_SUFFIX);
    }

    async addMsgToChatRoom(dbUser: User, chatRoomName: string, message: string, timestamp: number, socket: io.Socket): Promise<void> {
        if (isEmpty(chatRoomName)) {
            socket.emit('messageServer', 'Chat room name is empty.');
            return Promise.resolve();
        }
        const chatRoom: ChatRoom = (await this.chatRooms.findOne({ name: chatRoomName })) as ChatRoom;
        if (!chatRoom) {
            socket.emit('messageServer', 'The chat room ' + chatRoomName + ' does not exist.');
            return Promise.resolve();
        }
        // the previous function checks that dbUser.id is defined so we can disable the linting error
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (!chatRoom.participants.includes(dbUser.id!) && chatRoomName !== 'general') {
            socket.emit('messageServer', 'You are not a participant of the chat room ' + chatRoomName + '.');
            return Promise.resolve();
        }
        const result = await this.chatRooms.updateOne(
            { name: chatRoomName },
            { $push: { chatHistory: { msg: message, senderName: dbUser.name, timestamp } } },
            { new: true },
        );
        if (!result) {
            socket.emit('messageServer', 'The message could not be added to the chat room ' + chatRoomName + '.');
            return Promise.resolve();
        }
    }

    async getAllChatRooms(dbUserId: string, socket: io.Socket): Promise<ChatRoom[]> {
        const generalChatRoom: ChatRoom = (await this.chatRooms.findOne({ name: 'general' })) as ChatRoom;
        const chatRooms: ChatRoom[] = [];
        // we add the general chat to the chatRooms bc the id of the user if not in the general chatRoom
        chatRooms.push(generalChatRoom);
        const chatRoomsDb = (await this.chatRooms.find({ participants: dbUserId })) as ChatRoom[];
        for (const chatRoom of chatRoomsDb) {
            chatRooms.push(chatRoom);
        }

        if (chatRooms.length <= 0) {
            socket.emit('messageServer', 'You are not a participant of any chat room.');
            return Promise.resolve([]);
        }

        // make the socket join all the rooms
        for (const chatRoom of chatRooms) {
            socket.join(chatRoom.name + Constants.CHATROOM_SUFFIX);
        }
        return chatRooms;
    }

    async getChatRoom(chatRoomName: string, socket: io.Socket): Promise<ChatRoom> {
        if (isEmpty(chatRoomName)) {
            socket.emit('messageServer', 'Chat room name is empty.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }

        const chatRoom = (await this.chatRooms.findOne({ name: chatRoomName })) as ChatRoom;
        if (!chatRoom) {
            socket.emit('messageServer', 'The chat room ' + chatRoomName + ' does not exist.');
            return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
        }
        return chatRoom;
    }

    async populateCreatorField(chatRoom: ChatRoom): Promise<ChatRoom> {
        if (chatRoom.name === 'general') {
            return Promise.resolve(chatRoom);
        }
        try {
            const creatorName = (await this.userService.findUserById(chatRoom.creator.toString())).name;
            const chatRoomPopulated = {
                name: chatRoom.name,
                participants: chatRoom.participants,
                creator: creatorName,
                chatHistory: chatRoom.chatHistory,
            };
            return chatRoomPopulated;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error when getting creator name', error);
        }
        return Promise.resolve({ name: '', participants: [], creator: '', chatHistory: [] });
    }

    private async appointNewCreator(dbUserId: string, chatRoom: ChatRoom, socket: io.Socket) {
        const newCreator = chatRoom.participants.find((participant) => participant.toString() !== dbUserId);
        if (!newCreator) {
            return;
        }
        const result = await this.chatRooms.updateOne({ name: chatRoom.name }, { $set: { creator: newCreator } }, { new: true });
        if (!result) {
            socket.emit('messageServer', 'The creator of the chat room ' + chatRoom.name + ' could not be changed.');
            return Promise.resolve();
        }
    }
}

export default ChatRoomService;

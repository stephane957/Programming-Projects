import { Document, model, Schema } from 'mongoose';
import { GameSaved } from '@app/classes/game-saved';

const gameSavedSchema: Schema = new Schema({
    roomName: {
        type: String,
        required: true,
    },
    players: {
        type: [String],
        required: true,
    },
    scores: {
        type: [Number],
        required: true,
    },
    spectators: {
        type: [String],
        required: false,
    },
    winners: {
        type: [String],
        required: false,
    },
    numberOfTurns: {
        type: Number,
        required: true,
    },
    gameStartDate: {
        type: String,
        required: true,
    },
    playingTime: {
        type: String,
        required: true,
    },
    nbLetterReserve: {
        type: Number,
        required: true,
    },
});

const gameSavedModel = model<GameSaved & Document>('Saved-Games', gameSavedSchema);

export default gameSavedModel;

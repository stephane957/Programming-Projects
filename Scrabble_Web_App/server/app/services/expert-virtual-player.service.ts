import { GameServer } from '@app/classes/game-server';
import { Move } from '@app/classes/move';
import { Player } from '@app/classes/player';
import { Service } from 'typedi';
import { BoardExplorerService } from './board-explorer.service';
import { ChatService } from './chat.service';
import { DebugCommandService } from './debug-command.service';
import { DictionaryService } from './dictionary.service';
import { PutLogicService } from './put-logic.service';
import { ScoreCountService } from './score-count.service';
import { VirtualPlayerService } from './virtual-player.service';

@Service()
export class ExpertVP extends VirtualPlayerService {
    movesExpert: Move[];
    constructor(
        protected dictService: DictionaryService,
        protected chatService: ChatService,
        protected boardExplorerService: BoardExplorerService,
        protected scoreCountService: ScoreCountService,
        protected putLogicService: PutLogicService,
        protected debugCommandService: DebugCommandService,
    ) {
        super(dictService, chatService, boardExplorerService, scoreCountService, putLogicService, debugCommandService);
        this.movesExpert = new Array<Move>();
    }

    assignMove(move: Move) {
        // we want the moves to be ordered by their score, highest one first (priority queue maybe?)
        this.movesExpert.push(move);
    }

    randomPlacement(game: GameServer, player: Player): Move | undefined {
        let moveToPlay: Move | undefined;
        if (this.movesExpert.length === 0) {
            moveToPlay = undefined;
        } else {
            moveToPlay = this.movesExpert.sort((a, b) => b.score - a.score)[0];
            this.putLogicService.computeWordVPToDraw(game, player, moveToPlay);
            this.chatService.placeCommand('!placer ' + moveToPlay.command + ' ' + moveToPlay.word, game, player);
            this.debugCommandService.debugPrint(player, moveToPlay, game);
            this.movesExpert = [];
        }
        return moveToPlay;
    }
}

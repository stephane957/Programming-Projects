import 'dart:core';
import 'package:client_leger/constants/constants.dart';
import 'package:client_leger/constants/constants_test.dart';
import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/power-cards.dart';
import 'package:client_leger/models/spectator.dart';
import 'package:client_leger/models/tile.dart';
import 'package:client_leger/models/trie.dart';
import 'package:easy_localization/easy_localization.dart';

import 'letter-data.dart';
import 'letter.dart';

class GameServer {

  // LETTER BANK SERVICE DATA
  late Map<String, LetterData> letterBank;
  late List<String> letters;

  late String roomName;
  late String gameStart;

  // BOARD SERVICE DATA
  late List<List<Tile>> board;
  late Trie trie;

  // we are obliged to put the esLint disable because the object class we use isnt stable
  // we therefore need to use any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  late Map<String, dynamic> mapLetterOnBoard;

  late List<List<String>> bonusBoard;
  late List<String> bonuses;

  // EQUIVALENT STAND PLAYER SERVICE DATA
  late Map<String, Player> mapPlayers;
  late Map<String, Spectator> mapSpectators;
  late List<Player> winners;

  // VALIDATION SERVICE
  late bool noTileOnBoard;

  // GAME PARAMETERS SERVICE DATA
  late String gameMode;
  late num minutesByTurn;
  late bool isGamePrivate;
  late String passwd;

  // PLAY AREA SERVICE DATA
  late num nbLetterReserve;
  late bool gameStarted;
  late bool gameFinished;
  late num idxPlayerPlaying;
  late String masterTimer;

  // SKIP TURN SERVICE DATA
  late String displaySkipTurn;

  // POWER-CARDS SERVICE DATA
  late List<PowerCard> powerCards;
  late bool jmpNextEnnemyTurn;
  late num reduceEnnemyNbTurn;

  late num startTime;
  late num endTime;

  GameServer({
    required this.minutesByTurn,
    required this.gameMode,
    required this.roomName,
    required this.isGamePrivate,
    required this.passwd
  }) {
    trie = Trie();
    letters = [];
    board = [];
    winners = [];
    mapLetterOnBoard = {};
    mapPlayers = {};
    mapSpectators = {};
    nbLetterReserve = 88;
    gameStarted = false;
    gameFinished = false;
    idxPlayerPlaying = 0;
    masterTimer = '';
    displaySkipTurn = tr("WAITING_OTHER_PLAYER");
    noTileOnBoard = true;
    winners = List.from([Player('', false)]);
    bonusBoard = constBoard1;
    powerCards = [];
    jmpNextEnnemyTurn = false;
    reduceEnnemyNbTurn = 0;
    startTime = 0;
    endTime = 0;
    gameStart = '';

    letterBank = {
      'A': LetterData(quantity: 9, weight: 1),
      'B': LetterData(quantity: 2, weight: 3),
      'C': LetterData(quantity: 2, weight: 3),
      'D': LetterData(quantity: 3, weight: 2),
      'E': LetterData(quantity: 15, weight: 1),
      'F': LetterData(quantity: 2, weight: 4),
      'G': LetterData(quantity: 2, weight: 2),
      'H': LetterData(quantity: 2, weight: 4),
      'I': LetterData(quantity: 8, weight: 8),
      'J': LetterData(quantity: 1, weight: 8),
      'K': LetterData(quantity: 1, weight: 10),
      'L': LetterData(quantity: 5, weight: 1),
      'M': LetterData(quantity: 3, weight: 2),
      'N': LetterData(quantity: 6, weight: 1),
      'O': LetterData(quantity: 6, weight: 1),
      'P': LetterData(quantity: 2, weight: 3),
      'Q': LetterData(quantity: 1, weight: 8),
      'R': LetterData(quantity: 6, weight: 1),
      'S': LetterData(quantity: 6, weight: 1),
      'T': LetterData(quantity: 6, weight: 1),
      'U': LetterData(quantity: 6, weight: 1),
      'V': LetterData(quantity: 2, weight: 4),
      'W': LetterData(quantity: 1, weight: 10),
      'X': LetterData(quantity: 1, weight: 10),
      'Y': LetterData(quantity: 1, weight: 10),
      'Z': LetterData(quantity: 1, weight: 10),
      '*': LetterData(quantity: 2, weight: 0),
    };

    initializeLettersArray();
    initializeBonusBoard();
    initBoardArray();
    initPowerCards();
  }

  GameServer.fromJson(game){
    minutesByTurn = game["minutesByTurn"];
    gameMode = game["gameMode"];
    gameStart = game["gameStart"];
    //TODO Trie
    letters = List<String>.from(game["letters"]);

    board = [];
    bonusBoard = [];
    var lines = game["board"];
    for(var line in lines){
      List<Tile> tempLine = [];
      for(var tile in line){
        tempLine.add(Tile.fromJson(tile));
      }

      board.add(tempLine);
    }

    roomName = game["roomName"];
    //TODO mapLetterOnBoard
    //TODO mapPlayers
    //TODO mapSpectators
    nbLetterReserve = game["nbLetterReserve"];
    gameStarted = game["gameStarted"];
    gameFinished = game["gameFinished"];
    idxPlayerPlaying = game["idxPlayerPlaying"];
    masterTimer = game["masterTimer"];
    displaySkipTurn = game["displaySkipTurn"];
    noTileOnBoard = game["noTileOnBoard"];
    winners = [];
    var wins = game["winners"];
      for (var player in wins) {
        winners.add(Player.fromJson(player));
      }
    startTime = game["startTime"];
    endTime = game["endTime"];

    //TODO letterBank

    bonusBoard = [];
    var bonusLines = game["bonusBoard"];
    for(var bonusLine in bonusLines){
      List<String> tempLine = [];
      for(var bonus in bonusLine){
        tempLine.add(bonus);
      }
      bonusBoard.add(tempLine);
    }

  }

  initializeLettersArray() {
    letters = [];

    for(var key in letterBank.keys) {
      var letterData = letterBank[key]?.quantity;
      if(letterData != null){
        for(var i = 0; i < letterData; i++) {
          letters.add(key);
        }
      }
    }
  }

  initializeBonusBoard() {
    List<String> row1 = List.from(['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx']);
    List<String> row2 = List.from(['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx3', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx']);
    List<String> row3 = List.from(['xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx']);
    List<String> row4 = List.from(['xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx']);
    List<String> row5 = List.from(['xx', 'letterx2', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'letterx2', 'xx']);
    List<String> row6 = List.from(['xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx']);
    List<String> row7 = List.from(['xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx']);
    List<String> row8 = List.from(['xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx']);
    List<String> row9 = List.from(['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx']);
    List<String> row10 = List.from(['xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx']);
    List<String> row11 = List.from(['xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx']);
    List<String> row12 = List.from(['xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx']);
    List<String> row13 = List.from(['xx', 'letterx2', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'letterx2', 'xx'],);
    List<String> row14 = List.from(['xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx']);
    List<String> row15 = List.from(['xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx']);
    List<String> row16 = List.from(['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx3', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx']);
    List<String> row17 = List.from(['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx']);

    bonusBoard = List.from([row1, row2, row3, row4, row5, row6, row7, row8, row9, row10, row11, row12, row13, row14, row15, row16, row17]);
  }

  initBoardArray() {
    for(int i = 0; i < NUMBER_SQUARE_H_AND_W + 2; i++) {
      board.add([]);
      for(int j = 0; j < NUMBER_SQUARE_H_AND_W + 2; j++) {
        Tile newTile = Tile();
        Letter newLetter = Letter();

        newLetter.weight = 0;
        newLetter.value = '';

        newTile.letter = newLetter;
        newTile.bonus = bonusBoard[i][j];

        board[i].add(newTile);
      }
    }
  }

  // need the powers locally in the game to be able to deactivate/activate them for each game
  // by defaut they all are activated
  initPowerCards() {
    powerCards = [];
    powerCards.add(PowerCard(name: JUMP_NEXT_ENNEMY_TURN, isActivated: true));
    powerCards.add(PowerCard(name:TRANFORM_EMPTY_TILE, isActivated:true));
    powerCards.add(PowerCard(name:REDUCE_ENNEMY_TIME, isActivated:true));
    powerCards.add(PowerCard(name:EXCHANGE_LETTER_JOKER, isActivated:true));
    powerCards.add(PowerCard(name:EXCHANGE_STAND, isActivated:true));
    powerCards.add(PowerCard(name:REMOVE_POINTS_FROM_MAX, isActivated:true));
    powerCards.add(PowerCard(name:ADD_1_MIN, isActivated:true));
    powerCards.add(PowerCard(name:REMOVE_1_POWER_CARD_FOR_EVERYONE, isActivated:true));
  }
}

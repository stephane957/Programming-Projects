import 'package:client_leger/constants/constants.dart';
import 'package:client_leger/models/power-cards.dart';
import 'package:client_leger/models/tile.dart';
import 'package:client_leger/models/vec4.dart';
import 'package:flutter/cupertino.dart';

import '../services/chat-service.dart';
import 'chat.dart';
import 'letter.dart';

class Player with ChangeNotifier {
  ChatService chatService = ChatService();
  late String id;
  late String name;
  late int elo;
  late List<Tile> stand = [];
  late String avatarUri;
  late bool isCreatorOfGame;

  late Map<String, Object> mapLetterOnStand;
  late int score;
  late int nbLetterStand;

  // CHAT SERVICE DATA
  late String lastWordPlaced;
  late bool debugOn;
  late int passInARow;
  late List<ChatMessage> chatHistory = [];
  late List<ChatMessage> oldChatHistory = [];

  // MOUSE EVENT SERVICE DATA
  late int tileIndexManipulation;

  // OBJECTIVE DATA
  late int turn;
  late bool allLetterSwapped;
  late bool isMoveBingo;

  // POWERS
  late List<PowerCard> powerCards;
  late num nbValidWordPlaced;

  Player(this.name, this.isCreatorOfGame){
    powerCards = [
      PowerCard(name: JUMP_NEXT_ENNEMY_TURN, isActivated: true),
      PowerCard(name: REMOVE_POINTS_FROM_MAX, isActivated: true),
      PowerCard(name: EXCHANGE_LETTER_JOKER, isActivated: true),
    ];
    nbValidWordPlaced = 0;
    initStand();
    avatarUri = '';
  }

  Player.fromJson(Map parsed) {
    name = parsed["name"];
    elo = parsed["elo"];
    isCreatorOfGame = parsed["isCreatorOfGame"];
    id = parsed["id"];

    // TODO verify this works
    var tileList = parsed["stand"];
    for(var tile in tileList){
      stand.add(Tile.fromJson(tile));
    }

    // TODO MAPLETTERSONSTAND
    score = parsed["score"];
    nbLetterStand = parsed["nbLetterStand"];
    lastWordPlaced = parsed["lastWordPlaced"];
    // TODO CHAT
    turn = parsed['turn'];
    tileIndexManipulation = parsed["tileIndexManipulation"];
    allLetterSwapped = parsed["allLetterSwapped"];
    avatarUri = parsed["avatarUri"];
    powerCards = [];
    var powerCardsList = parsed["powerCards"];
    for(var powerCard in powerCardsList){
      powerCards.add(PowerCard.fromJson(powerCard));
    }
    nbValidWordPlaced = parsed["nbValidWordPlaced"];

    var chatH = parsed["chatHistory"];
    for(var chatMsg in chatH){
      chatHistory.add(ChatMessage.fromJson(chatMsg));
    }

    notifyListeners();
  }


  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'elo': elo,
    'isCreatorOfGame': isCreatorOfGame,
    'score': score,
    'nbLetterStand': nbLetterStand,
    'lastWordPlaced': lastWordPlaced,
    'turn': turn,
    'tileIndexManipulation': tileIndexManipulation,
    'allLetterSwapped': allLetterSwapped,
    'avatarUri': avatarUri,
    'powerCards': powerCards,
    'nbValidWordPlaced': nbValidWordPlaced,
    'chatHistory': chatHistory,
    'mapLetterOnStand': mapLetterOnStand,
  };


  static List<Player> createPLayersFromArray(Map parsed){
    var mapPlayers = parsed["players"];
    List<Player> newPlayers = [];
    for(var mapPlayer in mapPlayers){
      Player player = Player.fromJson(mapPlayer);
      // if(player.isCreatorOfGame) roomCreator = player.name;
      // if(player.idPlayer == "virtualPlayer") {
      //   numberVirtualPlayer++;
      // } else {
      //   numberRealPlayer++;
      // }
      newPlayers.add(player);
    }
    return newPlayers;

  }

  //tmp function to initialize the stand
  //DO NOT REUSE IT
  void initStand(){
    const letterInit = 'abcdefg';
    const nbOccupiedSquare = 7;
    for (
    double i = 0, j = SIZE_OUTER_BORDER_STAND;
    i < NUMBER_SLOT_STAND;
    i++, j += WIDTH_EACH_SQUARE + WIDTH_LINE_BLOCKS
    ) {
      Vec4 newPosition = Vec4();
      Tile newTile = Tile();
      Letter newLetter = Letter();

      // Initialising the position
      newPosition.x1 = j + PADDING_BOARD_FOR_STANDS + WIDTH_HEIGHT_BOARD / 2 -
          WIDTH_STAND / 2;
      newPosition.y1 =
          PADDING_BET_BOARD_AND_STAND +
              SIZE_OUTER_BORDER_STAND +
              PADDING_BOARD_FOR_STANDS +
              WIDTH_HEIGHT_BOARD;
      newPosition.width = WIDTH_EACH_SQUARE;
      newPosition.height = WIDTH_EACH_SQUARE;
      newTile.position = newPosition;

      // Fills the occupiedSquare
      if (i < nbOccupiedSquare) {
        newLetter.weight = 1;
        newLetter.value = letterInit[i.toInt()];

        newTile.letter = newLetter;
        newTile.bonus = '0';

        stand.add(newTile);
      }
      // Fills the rest
      else {
        newLetter.weight = 0;
        newLetter.value = '';

        newTile.letter = newLetter;
        newTile.bonus = '0';

        stand.add(newTile);
      }
    }
  }
}

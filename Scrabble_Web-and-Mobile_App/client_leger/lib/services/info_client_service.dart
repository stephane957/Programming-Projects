import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

import '../constants/constants.dart';
import '../models/game-server.dart';
import '../models/mock_dict.dart';
import '../models/player.dart';
import '../models/room-data.dart';
import '../models/game-saved.dart';

class InfoClientService with ChangeNotifier{

  static final InfoClientService _gameService = InfoClientService._internal();

  late GameServer game;

  Player player = Player('DefaultPlayerObject', false);

  bool isSpectator = false;
  bool creatorShouldBeAbleToStartGame = false;

  late List<RoomData> rooms = [];
  late RoomData actualRoom;
  late bool? isGamePrivate = false;

  String playerName = 'DefaultPlayerName';

  String displayTurn = "WAITING_OTHER_PLAYER".tr();
  bool isTurnOurs = false;

  bool powerUsedForTurn = false;

  String gameMode = CLASSIC_MODE;
  double eloDisparity  =  60;

  List<String> letterReserve = [];
  String incomingPlayer = "";
  String incomingPlayerId = "";

  List<MockDict> dictionaries = [];

  bool soundDisabled = false;

  Map<String, String> userAvatars = {};

  List<GameSaved> favouriteGames = [];

  factory InfoClientService(){
    return _gameService;
  }

  InfoClientService._internal() {
    actualRoom = RoomData(name: 'default', gameMode: 'classic', timeTurn: '1', passwd: 'fake', players: [], spectators: []);
    game = GameServer(minutesByTurn: 0, gameMode: 'Solo', roomName: 'defaultRoom', isGamePrivate: false, passwd: '' );
    //initForTesting
    letterReserve = [
      't', 'e', 's', 't', 'i', 'n', 'g',
      't', 'e', 's', 't', 'i', 'n', 'g',
      't', 'e', 's', 't', 'i', 'n', 'g',
      't', 'e', 's', 't', 'i',
    ];
    dictionaries.add(MockDict('Dictionnaire français par défaut', 'Ce dictionnaire contient environ trente mille mots français'));
  }

  void updatePlayer(player){
    this.player = Player.fromJson(player);
    notifyListeners();
  }

  void clearRooms(){
    rooms = [];
    notifyListeners();
  }

  void updateGame(data){
    game = GameServer.fromJson(data);
    notifyListeners();
  }

  void addRoom(room){
    rooms.add(room);
    notifyListeners();
  }

  void removeRoom(roomNameToDelete){
    rooms.removeWhere((element) => element.name == roomNameToDelete);
    notifyListeners();
  }

  void updateDictionaries(dictionariesReceived){
    List<MockDict> tempDictionaries = [];
    for(var dictionary in dictionariesReceived){
      tempDictionaries.add(MockDict.fromJson(dictionary));
    }
    dictionaries = tempDictionaries;
    notifyListeners();
  }

  void updateFavouriteGames(games) {
    List<GameSaved> tempGames = [];
    for (var game in games) {
      tempGames.add(GameSaved.fromJson(game));
    }
    favouriteGames = tempGames;
    notifyListeners();
  }

  void askForEntrance(data){
    incomingPlayer = data[0];
    incomingPlayerId = data[1];
    notifyListeners();
  }

  void clearIncomingPlayer(){
    incomingPlayer = "";
    incomingPlayerId = "";
    notifyListeners();
  }

}

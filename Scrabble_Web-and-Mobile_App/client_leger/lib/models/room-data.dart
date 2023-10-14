import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/spectator.dart';
import 'package:flutter/cupertino.dart';

class RoomData with ChangeNotifier{
  late String name;
  late String gameMode;
  late String timeTurn;
  late String? passwd;

  late String roomCreator = "";
  int numberRealPlayer = 0;
  int numberVirtualPlayer = 0;
  late int numberSpectators;

  List<Player>players = [];

  List<Spectator> spectators = [];

  RoomData(
      {required this.name, required this.gameMode, required this.timeTurn, required this.passwd, required this.players, required this.spectators});


  RoomData.fromJson(Map parsed){
    name = parsed["roomName"];
    gameMode = parsed["gameMode"];
    timeTurn = parsed["timeTurn"].toString();
    passwd = parsed["passwd"];

    var mapPlayers = parsed["players"];
    List<Player> newPlayers = [];
    for(var mapPlayer in mapPlayers){
      Player player = Player.fromJson(mapPlayer);
      if(player.isCreatorOfGame) roomCreator = player.name;
      if(player.id == "virtualPlayer") {
        numberVirtualPlayer++;
      } else {
        numberRealPlayer++;
      }
      newPlayers.add(player);
    }

    var mapSpects = parsed["spectators"];
    List<Spectator> newSpects = [];
    for(var mapSpect in mapSpects){
      Spectator spect = Spectator.fromJson(mapSpect);
      newSpects.add(spect);
    }

    players = newPlayers;
    spectators = newSpects;
    numberSpectators = parsed["spectators"].length;
  }
}

import 'package:client_leger/models/power-cards.dart';

class CreateGameModel {
  late String roomName;
  late String playerName;
  late double timeTurn;
  late String gameMode;
  late bool isGamePrivate = false;
  late String passwd = "";
  final List<PowerCard> activatedPowers = [];

  Map<String, dynamic> toJson() {
    return {
      'roomName': roomName,
      'playerName': playerName,
      'timeTurn': timeTurn,
      'gameMode': gameMode,
      'isGamePrivate': isGamePrivate,
      'passwd': passwd,
      'activatedPowers': activatedPowers,
    };
  }

  CreateGameModel(this.roomName, this.playerName, this.timeTurn, this.gameMode,
      this.isGamePrivate, this.passwd);
}

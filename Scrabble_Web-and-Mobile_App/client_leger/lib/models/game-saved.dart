import 'dart:core';
import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/spectator.dart';

class GameSaved {
  // fields for the game-saved model used in database
  late String roomName;
  late List<String> players;
  late List<String> spectators;
  late List<String> winners;
  late List<num> scores;
  late num numberOfTurns;
  late String gameStartDate;
  late String playingTime;
  late num nbLetterReserve;
  late Map<String, String> mapLetterOnStand;
  late String? _id;

  Map<String, dynamic> toJson() {
    return {
        'roomName': roomName,
        'players': players,
        'spectators': spectators,
        'winners': winners,
        'scores': scores,
        'numberOfTurns': numberOfTurns,
        'gameStartDate': gameStartDate,
        'playingTime': playingTime,
        'nbLetterReserve': nbLetterReserve,
    };
  }

  GameSaved(
      List<Player> players,
      this.roomName,
      this.numberOfTurns,
      this.playingTime,
      this.nbLetterReserve,
      this.gameStartDate,
      List<Spectator>? spectators,
      List<Player>? winners) {
    mapLetterOnStand = {};
    this.players = [];
    this.spectators = [];
    this.winners = [];
    scores = [];
    populateArrays(players, spectators, winners);
    populateMap(players);
  }

  GameSaved.fromJson(game) {
    _id = game["_id"] ?? "Failed";
    roomName = game["roomName"] ?? "Failed";
    numberOfTurns = game["numberOfTurns"] ?? "Failed";
    playingTime = game["playingTime"] ?? "Failed";
    nbLetterReserve = game["nbLetterReserve"] ?? "Failed";
    gameStartDate = game["gameStartDate"] ?? "Failed";
    var playersString = game["players"] ?? "Failed";
    players = [];
    for (var pl in playersString) {
      players.add(pl);
    }
    var winnersString = game["winners"] ?? "Failed";
    winners = [];
    for (var wn in winnersString) {
      winners.add(wn);
    }
    var spectatorsString = game["spectators"] ?? "Failed";
    spectators = [];
    for (var spec in spectatorsString) {
      spectators.add(spec);
    }
    var scoresString = game["scores"] ?? "Failed";
    scores = [];
    for (var sc in scoresString) {
      scores.add(sc);
    }
  }

  void populateArrays(List<Player> players, List<Spectator>? spectators,
      List<Player>? winners) {
    for (var pl in players) {
      this.players.add(pl.name);
    }

    for (var sc in players) {
      scores.add(sc.score);
    }

    if (spectators != null) {
      for (var spec in spectators) {
        this.spectators.add(spec.name);
      }
    }
    if (winners != null) {
      for (var wn in winners) {
        this.winners.add(wn.name);
      }
    }
  }

  void populateMap(List<Player> players) {
    for (var player in players) {
      var entry = {player.name: lettersOnStand(player)};
      mapLetterOnStand.addEntries(entry.entries);
    }
  }

  String lettersOnStand(Player player) {
    List<String> listLetterStillOnStand = [];
    for (var tile in player.stand) {
      if (tile.letter.value != '') {
        listLetterStillOnStand.add(tile.letter.value);
      }
    }
    return listLetterStillOnStand.toString();
  }
}

import 'dart:convert';
import 'dart:io' as Io;
import 'dart:typed_data';

class User {
  late List<dynamic>? actionHistory;
  late String? avatarPath;
  late String? avatarUri;
  late num? averagePointsPerGame;
  late num? averageTimePerGame;
  late String? cookie;
  late String email;
  late List<dynamic>? gameHistory;
  late List<dynamic>? favouriteGames;
  late int? gamesPlayed;
  late int? gamesWon;
  late String? id;
  late String? language;
  late String? theme;
  late String username;
  late Io.File avatarImage;
  late num? elo = 2000;

  User(this.username, this.email);

  User.fromJson(Map parsed){
    username = parsed["data"]["name"] ?? "Failed";
    email = parsed["data"]["email"] ?? "Failed";
    actionHistory = parsed["data"]["actionHistory"] ?? "Failed";
    avatarPath = parsed["data"]["avatarPath"] ?? "Failed";
    avatarUri = parsed["data"]["avatarUri"] ?? "Failed";
    averagePointsPerGame = parsed["data"]["averagePointsPerGame"] ?? "Failed";
    averageTimePerGame = parsed["data"]["averageTimePerGame"] ?? "Failed";
    gameHistory = parsed["data"]["gameHistory"] ?? "Failed";
    gamesPlayed = parsed["data"]["gamesPlayed"] ?? "Failed";
    gamesWon = parsed["data"]["gamesWon"] ?? "Failed";
    favouriteGames = parsed["data"]["favouriteGames"] ?? "Failed";
    id = parsed["data"]["_id"] ?? "Failed";
    elo = parsed["data"]["elo"];
    theme = parsed["data"]["theme"] ?? "Failed";
    language = parsed["data"]["language"] ?? "Failed";
  }

  Map<String, dynamic> toJson() => {
    'name': username,
    'email': email,
    'actionHistory': actionHistory,
    'avatarPath': avatarPath,
    'avatarUri': avatarUri,
    'averagePointsPerGame': averagePointsPerGame,
    'averageTimePerGame': averageTimePerGame,
    'gameHistory': gameHistory,
    'gamesPlayed': gamesPlayed,
    'gamesWon': gamesWon,
    'id': id,
    'elo': elo,
  };



  User clear() {
    return User("", "");
  }

  Uint8List getUriFromAvatar() {
    return base64Decode(avatarUri?.substring(22) as String);
  }

}

import 'package:client_leger/models/player.dart';

class EloChangeService{
  EloChangeService() {}

  List<Player> changeEloOfPlayers(List<Player> oldPlayers ) {
        const baseEloChangeForFirstOrLast = 20;
        const baseEloChangeForSecondOrThird = 10;
        const eloDisparityFactor = 20;
        List<Player> newPlayers = [];
        for (var i = 0;i<oldPlayers.length;i++) {
          newPlayers.add(new Player(oldPlayers[i].name, false));
          newPlayers[i].elo = oldPlayers[i].elo;
        }
        int averageElo = calculateAverageElo(oldPlayers);
        newPlayers[0].elo += (baseEloChangeForFirstOrLast + (averageElo - oldPlayers[0].elo) / eloDisparityFactor).round();
        newPlayers[1].elo += (baseEloChangeForSecondOrThird + (averageElo - oldPlayers[1].elo) / eloDisparityFactor).round();
        newPlayers[2].elo -= (baseEloChangeForSecondOrThird + (averageElo - oldPlayers[2].elo) / eloDisparityFactor).round();
        newPlayers[3].elo -= (baseEloChangeForFirstOrLast + (averageElo - oldPlayers[3].elo) / eloDisparityFactor).round();
        return newPlayers;
    }

    int calculateAverageElo(List<Player> players ) {
        int averageElo = 0;
        for(var player in players) {
          averageElo += player.elo;
        }
        return (averageElo/players.length).floor();
    }
}

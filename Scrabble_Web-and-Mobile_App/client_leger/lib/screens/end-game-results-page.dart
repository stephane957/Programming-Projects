import 'dart:convert';
import 'dart:developer';

import 'package:client_leger/constants/constants.dart';
import 'package:client_leger/models/game-saved.dart';
import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/services/eloChangeService.dart';
import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/timer.dart';
import 'package:client_leger/services/users_controller.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../env/environment.dart';
import '../models/spectator.dart';


class EndGameResultsPage extends StatefulWidget {
  const EndGameResultsPage({Key? key}) : super(key: key);

  @override
  State<EndGameResultsPage> createState() => _EndGameResultsPage();
}
class _EndGameResultsPage extends State<EndGameResultsPage> {
    final InfoClientService infoClientService = InfoClientService();
    final SocketService socketService = SocketService();
    final Controller usersController = Controller();
    final TimerService timerService = TimerService();
    final EloChangeService eloChangeService = EloChangeService();
    late GameSaved gameSaved;
    late String roomName;
    late String creator;
    List<Player> players = [];
    List<Player> newPlayersElo = [];
    List<Spectator> spectators = [];
    List<String> winners = [];
    late int numberOfTurns;
    late String playingTime;
    late String timestamp = '';
    bool isPressed = false;

    @override
  void initState() {
    super.initState();
    roomName = infoClientService.actualRoom.name;
    players = infoClientService.actualRoom.players;
    spectators = infoClientService.actualRoom.spectators;
    players.sort((element1, element2) => element2.score - element1.score);
    _findNumberOfTurns();
    _findCreatorOfGame();
    _getGameStartDate();
    _displayPlayingTime();
    _saveGame();
    if(infoClientService.gameMode == MODE_RANKED){
      newPlayersElo = eloChangeService.changeEloOfPlayers(players);
      log(newPlayersElo.toString());
      changeEloOfPlayersDB();
      log('bap');
    }
  }
    refresh() async {
    setState(() {});

  }

    @override
    Widget build(BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
          backgroundColor: Theme.of(context).colorScheme.secondary,
          insetPadding: const EdgeInsets.all(65.0),
          // insetPadding:  ,
          child: ListView(
            scrollDirection: Axis.vertical,
            addAutomaticKeepAlives: false,
            padding: const EdgeInsets.only(top: 5.0, left: 20.0, bottom: 10.0, right: 20.0),
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  ElevatedButton(
                      style: ButtonStyle(shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                        RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(120.0) ),
                      ),

                      ),
                      onPressed: _leaveGame, // passing false
                      child: Icon(Icons.close, color: Theme.of(context).colorScheme.secondary,)),
                ],
              ),
                Container(
                    height: 30,
                    color: Theme.of(context).colorScheme.primary,
                    child:

                    Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                            Text("END_GAME_RESULT_PAGE.RESULT_END_GAME".tr(),
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          color: Theme.of(context).colorScheme.secondary,
                                          fontSize: 25,
                                        ),
                                    ),
                                  ],
                        ),
                ),
                const SizedBox(height: 20.0,),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("${"END_GAME_RESULT_PAGE.ROOM".tr()}: ",
                      textAlign: TextAlign.left,
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          fontFamily: "Times New Roman"
                      ),
                    ),
                    Text(roomName,
                      textAlign: TextAlign.left,
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.tertiary,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          fontFamily: "Times New Roman"
                      ),
                    ),
                  ],
                ),
                const SizedBox(
                    height: 10,
                ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("${"END_GAME_RESULT_PAGE.CREATOR_GAME".tr()}: ",
                      textAlign: TextAlign.left,
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          fontFamily: "Times New Roman"
                      ),
                    ),
                    Text(creator,
                      textAlign: TextAlign.left,
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.tertiary,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          fontFamily: "Times New Roman"
                      ),
                    ),
                  ],
                ),
                const SizedBox(
                    height: 10,
                ),
              Text('${"END_GAME_RESULT_PAGE.GAME_SPECTATORS".tr()}: ',
                style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    fontFamily: "Times New Roman"
                ),
                textAlign: TextAlign.left,
              ),
              const SizedBox( height: 5,),
              _isThereSpectators(),
                const SizedBox(
                    height: 10,
                ),
                Text("${"END_GAME_RESULT_PAGE.GAME_WINNER".tr()}: ",
                    textAlign: TextAlign.left,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                        fontFamily: "Times New Roman"
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: List.generate(infoClientService.game.winners.length, (index) {
                            return Text("${"END_GAME_RESULT_PAGE.NAME".tr()}:  ${infoClientService.game.winners[index].name}  ${"END_GAME_RESULT_PAGE.SCORE_OF".tr()} ${infoClientService.game.winners[index].score} ${"END_GAME_RESULT_PAGE.POINTS".tr()}",
                                    style: TextStyle(
                                      color: Theme.of(context).colorScheme.tertiary,
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: "Times New Roman"
                                    ),
                                    textAlign: TextAlign.left,
                            );
                    }),
                ),
                const SizedBox(
                    height: 10,
                ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("${"END_GAME_RESULT_PAGE.NUMBER_LETTER_LEFT".tr()}: ",
                    textAlign: TextAlign.left,
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        fontFamily: "Times New Roman"
                    ),
                  ),
                  Text("${infoClientService.game.nbLetterReserve}",
                    textAlign: TextAlign.left,
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.tertiary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        fontFamily: "Times New Roman"
                    ),
                  ),
                ],
              ),
                const SizedBox(
                    height: 10,
                ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("${"END_GAME_RESULT_PAGE.NUMBER_TOTAL_TURN".tr()}: ",
                    textAlign: TextAlign.left,
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        fontFamily: "Times New Roman"
                    ),
                  ),
                  Text("$numberOfTurns",
                    textAlign: TextAlign.left,
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.tertiary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        fontFamily: "Times New Roman"
                    ),
                  ),
                ],
              ),
                const SizedBox(
                    height: 10,
                ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("${"END_GAME_RESULT_PAGE.GAME_LENGTH".tr()}: ",
                    textAlign: TextAlign.left,
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        fontFamily: "Times New Roman"
                    ),
                  ),
                  Text(playingTime,
                    textAlign: TextAlign.left,
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.tertiary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        fontFamily: "Times New Roman"
                    ),
                  ),
                ],
              ),
                const SizedBox(
                    height: 10,
                ),

              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("${"END_GAME_RESULT_PAGE.GAME_CREATION_DATE".tr()}: ",
                    textAlign: TextAlign.left,
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        fontFamily: "Times New Roman"
                    ),
                  ),
                  Text(timestamp,
                    textAlign: TextAlign.left,
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.tertiary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        fontFamily: "Times New Roman"
                    ),
                  ),
                ],
              ),
                const SizedBox(
                    height: 10,
                ),
                if(!infoClientService.isSpectator) ...[
                Row(
                    children: [
                        Text("${"END_GAME_RESULT_PAGE.ADD_GAME_IN_FAVORITE".tr()}: ",
                          textAlign: TextAlign.left,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                              fontFamily: "Times New Roman"
                          ),
                        ),
                        ElevatedButton(
                            onPressed: isPressed == false ? _addGameToFavourites : null,
                            child: const Icon(Icons.playlist_add_sharp),
                        ),
                    ],
                )],
                const SizedBox(
                    height: 15,
                ),
                Container(
                    height: 30,
                    color: Theme.of(context).colorScheme.primary,
                    child: Center(
                        child: Text("${"END_GAME_RESULT_PAGE.STATS".tr()}",
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          color: Theme.of(context).colorScheme.secondary,
                                          fontSize: 25,
                                        ),
                                    )
                        ),
                ),
                const SizedBox(
                  height: 20,
                ),
                Row(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: List.generate(players.length, (index) {
                      return
                        Column(
                            children: [
                              Center(
                                child: _isLinkEnabled(players[index], index),
                              ),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text("${"END_GAME_RESULT_PAGE.SCORE".tr()}: ",
                                      style: TextStyle(
                                        color: Theme.of(context).colorScheme.primary,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text("${players[index].score}",
                                      textAlign: TextAlign.left,
                                      style: TextStyle(
                                          color: Theme.of(context).colorScheme.tertiary,
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          fontFamily: "Times New Roman"
                                      ),
                                    ),
                                  ],
                                ),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text("${"END_GAME_RESULT_PAGE.LETTER_LEFT".tr()}: ",
                                    style: TextStyle(
                                      color: Theme.of(context).colorScheme.primary,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(lettersOnStand(players[index]),
                                    textAlign: TextAlign.left,
                                    style: TextStyle(
                                        color: Theme.of(context).colorScheme.tertiary,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        fontFamily: "Times New Roman"
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text("${"END_GAME_RESULT_PAGE.NUMBER_OF_TURN_PLAYED".tr()}: ",
                                    style: TextStyle(
                                      color: Theme.of(context).colorScheme.primary,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,

                                    ),
                                  ),
                                  Text("${players[index].turn}",
                                    textAlign: TextAlign.left,
                                    style: TextStyle(
                                        color: Theme.of(context).colorScheme.tertiary,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        fontFamily: "Times New Roman"
                                    ),
                                  ),

                                ],
                              ),
                              infoClientService.gameMode == MODE_RANKED?
                                index <=1?
                                 Text("${"END_GAME_RESULT_PAGE.ELO".tr()} ${players[index].elo} + ${newPlayersElo[index].elo - players[index].elo} = ${newPlayersElo[index].elo}",
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.primary,
                                    fontSize: 16,
                                    fontWeight: FontWeight.normal,

                                  ),
                                )
                                :Text("${"END_GAME_RESULT_PAGE.ELO".tr()} ${players[index].elo} ${newPlayersElo[index].elo - players[index].elo} = ${newPlayersElo[index].elo}",
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.primary,
                                    fontSize: 16,
                                    fontWeight: FontWeight.normal,

                                  ),
                                )
                                :Container(),
                            ],
                        );
                    }),
                ),
            ],
          )
        );
    }

    String lettersOnStand(Player player) {
        List<String> lettersStillOnStand = [];
        for (var tile in player.stand) {
            if (tile.letter.value != '') {
                lettersStillOnStand.add(tile.letter.value);
            }
        }
        return lettersStillOnStand.toString();

    }

    void changeEloOfPlayersDB() {
        for (var player in newPlayersElo) {
            socketService.socket.emit('changeElo', [player.name, player.elo]);
        }
    }

    void _leaveGame() {
      socketService.count = 1;
      socketService.socket.emit('leaveGame');
      Navigator.popUntil(context, ModalRoute.withName("/home"));
    }

    void _findNumberOfTurns() {
        numberOfTurns = infoClientService.actualRoom.players[0].turn
                        + infoClientService.actualRoom.players[1].turn
                        + infoClientService.actualRoom.players[2].turn
                        + infoClientService.actualRoom.players[3].turn;
    }

    void _getGameStartDate() {
        timestamp = infoClientService.game.gameStart.toString();
    }

    void _displayPlayingTime() {
        const secondsInMinute = 60;
        const displayZero = 9;
        final end = infoClientService.game.endTime;
        final begin = infoClientService.game.startTime;
        final timeInSeconds = (end - begin) / 1000;
        final minutesToDisplay = (timeInSeconds / secondsInMinute).floor();
        final secondsToDisplay = (timeInSeconds % secondsInMinute).floor();
        if (secondsToDisplay <= displayZero && minutesToDisplay <= displayZero) {
            playingTime = "0$minutesToDisplay:0$secondsToDisplay";
        } else if (secondsToDisplay <= displayZero && minutesToDisplay > displayZero) {
            playingTime = "$minutesToDisplay:0$secondsToDisplay";
        } else if (secondsToDisplay > displayZero && minutesToDisplay <= displayZero) {
            playingTime = "0$minutesToDisplay:$secondsToDisplay";
        } else if (secondsToDisplay > displayZero && minutesToDisplay > displayZero) {
            playingTime = "$minutesToDisplay:$secondsToDisplay";
        }
    }

    void _findCreatorOfGame() {
        creator = infoClientService.actualRoom.players.firstWhere((element) => element.isCreatorOfGame).name;
    }

    Widget _isLinkEnabled(Player player, int index) {
        if (player.id != 'virtualPlayer') {
            return ProfileReadOnlyDialog(username: players[index].name, notifyParent: refresh);
        }
        return TextButton(onPressed: (() {}), child: Text(player.name, style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 18, fontWeight: FontWeight.bold,)));
    }

    Column _isThereSpectators() {
        if (infoClientService.actualRoom.spectators.isNotEmpty) {
            return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: List.generate(infoClientService.actualRoom.spectators.length, (index) {
                                                return Column(
                                children: [
                                            Text("${"END_GAME_RESULT_PAGE.NAME".tr()}: ${infoClientService.actualRoom.spectators[index].name}",
                                            style: TextStyle(
                                                color: Theme.of(context).colorScheme.tertiary,
                                                fontSize: 15,
                                                fontWeight: FontWeight.bold,
                                                ),
                                            ),
                                ],
                            );
                }),
            );
        }
        return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [ Text("END_GAME_RESULT_PAGE.NO_SPECTATORS".tr(), style: TextStyle( color: Theme.of(context).colorScheme.tertiary, fontSize: 15, fontWeight: FontWeight.bold))],
        );
    }

    _addGameToFavourites() async {
        setState(() {
          isPressed = true;
        });
        globals.userLoggedIn = await usersController.updateFavouriteGames(socketService.gameId);
        await usersController.getFavouriteGames();
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text("END_GAME_RESULT_PAGE.FAVOURITE_GAMES_UPDATED".tr()),
          backgroundColor: Colors.green,
        ));
    }

    void _saveGame() {
      gameSaved = GameSaved(infoClientService.actualRoom.players,
                infoClientService.actualRoom.name,
                numberOfTurns,
                playingTime,
                infoClientService.game.nbLetterReserve,
                timestamp,
                infoClientService.actualRoom.spectators,
                infoClientService.game.winners);
      if (socketService.socket.id == infoClientService.game.masterTimer){
          socketService.socket.emit('saveGame', gameSaved);
      }
    }
}

class ProfileReadOnlyDialog extends StatefulWidget {
  final String username;
  final Function() notifyParent;

  const ProfileReadOnlyDialog({
      Key? key,
      required this.username,
      required this.notifyParent,
      }) : super(key: key);

  @override
  State<ProfileReadOnlyDialog> createState() => _ProfileReadOnlyStateDialog();
}

class _ProfileReadOnlyStateDialog extends State<ProfileReadOnlyDialog> {
    final Controller usersController = Controller();
    final String? serverAddress = Environment().config?.serverURL;
    late User currentUser;

      @override
    void initState() {
    super.initState();
    http.get(Uri.parse("$serverAddress/users/${widget.username}"))
        .then((res) => parseUser(res));
  }

  void parseUser(http.Response res) {
    var parsed = json.decode(res.body);
    currentUser = User.fromJson(parsed);
  }

    @override
  Widget build(BuildContext context) {
     return TextButton(
      onPressed: () => showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
            title: const Text('STATISTIQUES', textAlign: TextAlign.center,),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5.0)),
            backgroundColor: Theme.of(context).colorScheme.secondary,
            insetPadding: const EdgeInsets.all(25.0),
            actionsAlignment: MainAxisAlignment.spaceBetween,
            actions: [
                Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                        CircleAvatar(
                        radius: 30,
                        backgroundImage: MemoryImage(
                            currentUser.getUriFromAvatar()),
                        ),
                        // Text(currentUser.username, style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13, decoration: TextDecoration.none, fontWeight: FontWeight.bold))
                    ],
                ),
                Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                        Text(currentUser.username, style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13, decoration: TextDecoration.none, fontWeight: FontWeight.bold))
                    ],
                ),
                Container(
                padding: const EdgeInsets.only(top: 30, bottom: 10),
                child: Table(
                    children: [
                    TableRow(
                        children: [
                        returnRowTextElement('Parties jouees'),
                        returnRowTextElement('Parties gagnes'),
                        returnRowTextElement('Score moyen par partie'),
                        returnRowTextElement('Temps moyen par partie'),
                        ],
                    ),
                    const TableRow(
                      children: [
                        SizedBox(
                          height: 20,
                        ),
                        SizedBox(
                          height: 20,
                        ),
                        SizedBox(
                          height: 20,
                        ),
                        SizedBox(
                          height: 20,
                        ),
                      ],
                    ),
                    TableRow(
                        children: [
                        returnRowTextElement(currentUser.gamesPlayed
                            .toString()),
                        returnRowTextElement(
                            currentUser.gamesWon.toString()),
                        returnRowTextElement(currentUser.averagePointsPerGame!
                            .toStringAsFixed(2)),
                        averageTime(Duration(
                                milliseconds: currentUser.averageTimePerGame!
                                    .toInt())
                            .inSeconds),
                        ],
                    ),
                    ],
                ),
                ),
            ],
        ),
      ),
      child: Text(widget.username, style: TextStyle( color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.bold, fontSize: 18),),
     );

  }
    Text returnRowTextElement(String textData) {
    return Text((textData),
        style: TextStyle(
            color: Theme.of(context).colorScheme.primary,
            fontSize: 13,
            decoration: TextDecoration.none,
            fontWeight: FontWeight.bold));
    }

    Text averageTime(num time) {
      const secondsInMinute = 60;
      const displayZero = 9;
      final minutesToDisplay = (time / secondsInMinute).floor();
      final secondsToDisplay = (time % secondsInMinute).floor();
      if (secondsToDisplay <= displayZero && minutesToDisplay <= displayZero) {
        return Text(("0$minutesToDisplay:0$secondsToDisplay"),
            style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13, decoration: TextDecoration.none, fontWeight: FontWeight.bold));
      } else if (secondsToDisplay <= displayZero && minutesToDisplay > displayZero) {
        return Text(("$minutesToDisplay:0$secondsToDisplay"),
            style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13, decoration: TextDecoration.none, fontWeight: FontWeight.bold));
        } else if (secondsToDisplay > displayZero && minutesToDisplay <= displayZero) {
        return Text(("0$minutesToDisplay:$secondsToDisplay"),
            style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13, decoration: TextDecoration.none, fontWeight: FontWeight.bold));
        } else if (secondsToDisplay > displayZero && minutesToDisplay > displayZero) {
        return Text(("$minutesToDisplay:$secondsToDisplay"),
            style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13, decoration: TextDecoration.none, fontWeight: FontWeight.bold));
        }
      return const Text('');
    }



}

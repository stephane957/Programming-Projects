import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/tapService.dart';
import 'package:client_leger/services/timer.dart';
import 'package:client_leger/widget/list_players.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

import '../constants/constants.dart';
import '../screens/end-game-results-page.dart';
import '../screens/game_page.dart';

class InfoPanel extends StatefulWidget {
  const InfoPanel({Key? key}) : super(key: key);

  @override
  State<InfoPanel> createState() => _InfoPanelState();
}

class _InfoPanelState extends State<InfoPanel> {
  final InfoClientService infoClientService = InfoClientService();
  final SocketService socketService = SocketService();
  final TimerService timerService = TimerService();
  final TapService tapService = TapService();

  @override
  void initState() {
    super.initState();

    infoClientService.addListener(refresh);
    infoClientService.actualRoom.addListener(refresh);
    timerService.addListener(refresh);
  }

  void refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary,
        borderRadius: const BorderRadius.all(Radius.circular(10.0)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          FittedBox(
            child: Text(
              infoClientService.displayTurn,
              style: TextStyle(
                  color: Theme.of(context).colorScheme.secondary, fontSize: 20),
            ),
          ),
          const SizedBox(
            height: 5,
          ),
          Container(
            child: infoClientService.game.gameStarted
                ? Text(
                    timerService.displayTimer,
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.secondary,
                        fontSize: 20),
                  )
                : null,
          ),
          const SizedBox(
            height: 5,
          ),
          Container(
            child: infoClientService.isSpectator == true
                ? Container()
                : Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          style: ButtonStyle(
                            backgroundColor: shouldButtonBeActive() ? MaterialStatePropertyAll<Color>(Theme.of(context).colorScheme.secondary) : const MaterialStatePropertyAll<Color>(Colors.grey),
                          ),
                          onPressed: _pass,
                          child: FittedBox(
                            child: Text(
                              "INFO_PANEL.PASS".tr(),
                              style: TextStyle(
                                  color:
                                      Theme.of(context).colorScheme.primary),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(
                        width: 5,
                      ),
                      Expanded(
                        child: ElevatedButton(
                          style: ButtonStyle(
                            backgroundColor: shouldButtonBeActive() ? MaterialStatePropertyAll<Color>(Theme.of(context).colorScheme.secondary) : const MaterialStatePropertyAll<Color>(Colors.grey),
                          ),
                          onPressed: _trade,
                          child: FittedBox(
                            child: Text(
                              "INFO_PANEL.EXCHANGE".tr(),
                              style: TextStyle(
                                  color:
                                      Theme.of(context).colorScheme.primary),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(
                        width: 5,
                      ),
                      Expanded(
                        child: ElevatedButton(
                          style: ButtonStyle(
                            backgroundColor: shouldButtonBeActive() ? MaterialStatePropertyAll<Color>(Theme.of(context).colorScheme.secondary) : const MaterialStatePropertyAll<Color>(Colors.grey),
                          ),
                          onPressed: _cancel,
                          child: FittedBox(
                            child: Text(
                              "INFO_PANEL.CANCEL".tr(),
                              style: TextStyle(
                                  color:
                                      Theme.of(context).colorScheme.primary),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(
                        width: 5,
                      ),
                      Expanded(
                        child: ElevatedButton(
                          style: ButtonStyle(
                            backgroundColor: shouldButtonBeActive() ? MaterialStatePropertyAll<Color>(Theme.of(context).colorScheme.secondary) : const MaterialStatePropertyAll<Color>(Colors.grey),
                          ),
                          onPressed: _play,
                          child: FittedBox(
                            child: Text(
                              "INFO_PANEL.PLAY".tr(),
                              style: TextStyle(
                                  color:
                                      Theme.of(context).colorScheme.primary),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                child: shouldBeAbleToLeaveGame()
                    ? ElevatedButton(
                        style: ButtonStyle(
                          backgroundColor: MaterialStatePropertyAll<Color>(Theme.of(context).colorScheme.secondary),
                        ),
                        onPressed: _leaveGame,
                        child: FittedBox(
                          child: Text(
                            "GAME_PAGE.QUIT_GAME".tr(),
                            style: TextStyle(
                                color: Theme.of(context).colorScheme.primary),
                          ),
                        ),
                      )
                    : null,
              ),
              Container(
                child: shouldBeAbleToLeaveGame()
                    ? const SizedBox(
                        width: 5,
                      )
                    : null,
              ),
              Container(
                child: shouldBeAbleToGiveUpGame()
                    ? ElevatedButton(
                        style: ButtonStyle(
                          backgroundColor: MaterialStatePropertyAll<Color>(Theme.of(context).colorScheme.secondary),
                        ),
                        onPressed: () => _giveUpGame(context),
                        child: Text(
                          "GAME_PAGE.GIVE_UP".tr(),
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        ),
                      )
                    : null,
              ),
              Container(
                child: shouldBeAbleToGiveUpGame()
                    ? const SizedBox(
                        width: 5,
                      )
                    : null,
              ),
              Container(
                  child: infoClientService.creatorShouldBeAbleToStartGame ==
                          true && !infoClientService.isSpectator
                      ? ElevatedButton(
                          style: ButtonStyle(
                            backgroundColor: MaterialStatePropertyAll<Color>(Theme.of(context).colorScheme.secondary),
                          ),
                          onPressed: _startGame,
                          child: Text(
                            "GAME_PAGE.START_GAME".tr(),
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                        )
                      : null),
              Container(
                child: infoClientService.creatorShouldBeAbleToStartGame == true && !infoClientService.isSpectator
                    ? const SizedBox(
                        width: 5,
                      )
                    : null,
              ),
              Container(
                  child: shouldSpecBeAbleToBePlayer() == true
                      ? ElevatedButton(
                          style: ButtonStyle(
                            backgroundColor: MaterialStatePropertyAll<Color>(Theme.of(context).colorScheme.secondary),
                          ),
                          onPressed: spectWantsToBePlayer,
                          child: Text(
                            "GAME_PAGE.REPLACE_VIRTUAL_PLAYER".tr(),
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                        )
                      : null),
              Container(
                child: shouldSpecBeAbleToBePlayer()
                    ? const SizedBox(
                        width: 5,
                      )
                    : null,
              ),
              if (infoClientService.gameMode == POWER_CARDS_MODE && infoClientService.game.gameStarted && !infoClientService.game.gameFinished) ...[
                PowerListDialog(
                  notifyParent: refresh,
                ),
              ],
            ],
          ),
          Container(
            child: infoClientService.game.gameFinished == true
                ? const SizedBox(
                    width: 5,
                  )
                : null,
          ),
          Container(
              child: infoClientService.game.gameFinished == true
                  ? ElevatedButton(
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (context) => const EndGameResultsPage(),
                        );
                      },
                      child: Text(
                        "GAME_PAGE.END_GAME_RESULT".tr(),
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary),
                      ),
                    )
                  : null),
          const SizedBox(
            height: 5,
          ),
          const ListPlayers(),
        ],
      ),
    );
  }

  bool shouldButtonBeActive() {
    return infoClientService.isTurnOurs && infoClientService.game.gameStarted;
  }

  spectWantsToBePlayer() {
    print(infoClientService.isSpectator);
    socketService.socket.emit('spectWantsToBePlayer');
  }

  Future<void> _giveUpGame(BuildContext context) {
    return showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("GAME_PAGE.GIVE_UP_GAME".tr(), style:
          TextStyle(color: Theme.of(context).colorScheme.primary)),
          content: Text("GAME_PAGE.SURE_WANT_GIVE_UP".tr(), style:
          TextStyle(color: Theme.of(context).colorScheme.primary)),
          backgroundColor: Theme.of(context).colorScheme.secondary,
          actions: <Widget>[
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.labelLarge,
              ),
              child: Text("GAME_PAGE.GIVE_UP".tr()),
              onPressed: () {
                socketService.count = 1;
                socketService.socket.emit('giveUpGame');
                Navigator.popUntil(context, ModalRoute.withName("/game-list"));
              },
            ),
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.labelLarge,
              ),
              child: Text("GAME_PAGE.CANCEL".tr()),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  bool shouldBeAbleToGiveUpGame() {
    if (!infoClientService.isSpectator &&
        infoClientService.game.gameStarted &&
        !infoClientService.game.gameFinished) {
      return true;
    }
    return false;
  }

  bool shouldSpecBeAbleToBePlayer() {
    if (infoClientService.game.gameFinished || !infoClientService.isSpectator) {
      return false;
    }
    if (infoClientService.actualRoom.numberVirtualPlayer > 0) {
      return true;
    } else {
      return false;
    }
  }

  bool shouldBeAbleToLeaveGame() {
    if (infoClientService.isSpectator ||
        !infoClientService.game.gameStarted ||
        infoClientService.game.gameFinished) {
      return true;
    }
    return false;
  }

  void _startGame() {
    socketService.socket.emit('startGame', infoClientService.game.roomName);
    infoClientService.creatorShouldBeAbleToStartGame = false;
  }

  void _leaveGame() {
    socketService.count = 1;
    socketService.socket.emit('leaveGame');
    Navigator.popUntil(context, ModalRoute.withName("/game-list"));
  }

  void _pass() {
    if (infoClientService.isTurnOurs && infoClientService.game.gameStarted) {
      socketService.socket.emit('turnFinished');
    }
  }

  void _trade() {
    socketService.socket.emit('onExchangeClick');
  }

  void _cancel() {
    socketService.socket.emit('onAnnulerClick');
  }

  void _play() {
    tapService.play(socketService.socket);
  }
}

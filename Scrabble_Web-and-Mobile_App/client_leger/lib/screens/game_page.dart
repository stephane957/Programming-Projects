import 'dart:convert';
import 'dart:typed_data';

import 'package:client_leger/constants/constants.dart';
import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/widget/game_board.dart';
import 'package:client_leger/widget/info_panel.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flip_card/flip_card.dart';
import 'package:flutter/material.dart';

import '../models/player.dart';
import '../services/socket_service.dart';
import '../widget/chat_panel.dart';
import 'end-game-results-page.dart';

class GamePage extends StatefulWidget {
  const GamePage({Key? key}) : super(key: key);

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  InfoClientService infoClientService = InfoClientService();
  SocketService socketService = SocketService();

  @override
  void initState() {
    super.initState();
    infoClientService.addListener(refresh);
  }

  void refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (shouldBeAbleToLeaveGame()) {
          _leaveGame();
        } else if (shouldBeAbleToGiveUpGame()) {
          _giveUpGame(context);
        }
        return false;
      },
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        endDrawer: Drawer(
            width: 600,
            child: ChatPanel(
              isInGame: true,
            )),
        body: Stack(
          children: [
            Row(
              children: [
                Container(
                  color: Theme.of(context).colorScheme.secondary,
                  padding: const EdgeInsets.symmetric(
                      vertical: 20.0, horizontal: 20.0),
                  child: const GameBoard(),
                ),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.fromLTRB(50, 100, 50, 100),
                    color: Theme.of(context).colorScheme.secondary,
                    child: Column(
                      children: const [
                        InfoPanel(),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            if(infoClientService.isSpectator && infoClientService.game.gameStarted && !infoClientService.game.gameFinished)...[
              Positioned(
                top: 170,
                left: 8,
                child: Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: const BorderRadius.all(Radius.circular(10.0)),
                  ),
                  padding: const EdgeInsets.all(5),
                  width: 65,
                  child: Text(
                    infoClientService.actualRoom.players[(infoClientService.game.idxPlayerPlaying.toInt() + 1) % 4].name,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.secondary,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
              Positioned(
                top: 7,
                left: 525,
                child: Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: const BorderRadius.all(Radius.circular(10.0)),
                  ),
                  padding: const EdgeInsets.all(5),
                  width: 65,
                  child: Text(
                    infoClientService.actualRoom.players[(infoClientService.game.idxPlayerPlaying.toInt() + 2) % 4].name,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.secondary,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
              Positioned(
                top: 520,
                left: 690,
                child: Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: const BorderRadius.all(Radius.circular(10.0)),
                  ),
                  padding: const EdgeInsets.all(5),
                  width: 65,
                  child: Text(
                    infoClientService.actualRoom.players[(infoClientService.game.idxPlayerPlaying.toInt() + 3) % 4].name,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.secondary,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
              Positioned(
                top: 680,
                left: 170,
                child: Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: const BorderRadius.all(Radius.circular(10.0)),
                  ),
                  padding: const EdgeInsets.all(5),
                  width: 65,
                  child: Text(
                    infoClientService.actualRoom.players[infoClientService.game.idxPlayerPlaying.toInt()].name,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.secondary,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ],
            if(!infoClientService.isSpectator && infoClientService.game.gameStarted && !infoClientService.game.gameFinished)...[
              Positioned(
                top: 680,
                left: 170,
                child: Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: const BorderRadius.all(Radius.circular(10.0)),
                  ),
                  padding: const EdgeInsets.all(5),
                  width: 65,
                  child: Text(
                    infoClientService.playerName,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.secondary,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ],
            const Positioned(top: 550.0, right: 225.0, child: ChatPanelOpenButton()),
            if (infoClientService.game.gameFinished == true) ... [
              const EndGameResultsPage(),
            ],
            if (infoClientService.incomingPlayer != "")
              AlertDialog(
                backgroundColor: Theme.of(context).colorScheme.secondary,
                title: Text(
                  '${"GAME_PAGE.THE_PLAYER".tr()}${infoClientService.incomingPlayer}${"GAME_PAGE.TRY_CONNECT".tr()}',
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.primary),
                ),
                actions: <Widget>[
                  ElevatedButton(
                    child: Text(
                      "GAME_PAGE.REFUSE".tr(),
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.secondary),
                    ),
                    onPressed: () {
                      acceptPlayer(false);
                    },
                  ),
                  ElevatedButton(
                    child: Text(
                      "GAME_PAGE.ACCEPT".tr(),
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.secondary),
                    ),
                    onPressed: () {
                      acceptPlayer(true);
                    },
                  ),
                ],
              )
            else
              Container(),
            StatefulBuilder(
                builder: (BuildContext context, StateSetter setState) {
                  return Positioned(
                    top: 20,
                    right: 30,
                    child: IconButton(
                      iconSize: 35,
                      icon: infoClientService.soundDisabled ? Icon(Icons.volume_off_sharp, color: Theme.of(context).colorScheme.primary) : Icon(Icons.volume_up_outlined, color: Theme.of(context).colorScheme.primary),
                      color: Theme.of(context).colorScheme.primary,
                      onPressed: () {
                        setState(() =>{infoClientService.soundDisabled = !infoClientService.soundDisabled});
                        infoClientService.notifyListeners();
                        socketService.notifyListeners();
                      },
                    ),
                  );
                }),
          ],
        ),
      ),
    );
  }

  void acceptPlayer(bool isPlayerAccepted) {
    if (isPlayerAccepted) {
      socketService.socket
          .emit('acceptPlayer', [true, infoClientService.incomingPlayerId]);
    } else {
      socketService.socket
          .emit('acceptPlayer', [false, infoClientService.incomingPlayerId]);
    }
    infoClientService.clearIncomingPlayer();
  }

  bool shouldBeAbleToLeaveGame() {
    if (infoClientService.isSpectator ||
        !infoClientService.game.gameStarted ||
        infoClientService.game.gameFinished) {
      return true;
    }
    return false;
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

  spectWantsToBePlayer() {
    socketService.socket.emit('spectWantsToBePlayer');
  }

  void _leaveGame() {
    socketService.count = 1;
    socketService.socket.emit('leaveGame');
    // Navigator.pushNamed(
    //     context, "/home");
    Navigator.popUntil(context, ModalRoute.withName("/home"));
  }

  Future<void> _giveUpGame(BuildContext context) {
    return showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Theme.of(context).colorScheme.secondary,
          title: Text("GAME_PAGE.GIVE_UP_GAME".tr(), style: TextStyle(
            color: Theme.of(context).colorScheme.primary,)),
          content: Text("GAME_PAGE.SURE_WANT_GIVE_UP".tr(), style: TextStyle(
            color: Theme.of(context).colorScheme.primary,)),
          actions: <Widget>[
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.labelLarge,
              ),
              child: Text("GAME_PAGE.GIVE_UP".tr(), style: TextStyle(
                color: Theme.of(context).colorScheme.primary,)),
              onPressed: () {
                socketService.count = 1;
                socketService.socket.emit('giveUpGame');
                Navigator.popUntil(context, ModalRoute.withName("/home"));
              },
            ),
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.labelLarge,
              ),
              child: Text("GAME_PAGE.CANCEL".tr(), style: TextStyle(
                color: Theme.of(context).colorScheme.primary,)),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }
}

class PowerListDialog extends StatefulWidget {
  final Function() notifyParent;

  const PowerListDialog({super.key, required this.notifyParent});

  @override
  State<PowerListDialog> createState() => _PowerListDialog();
}

class _PowerListDialog extends State<PowerListDialog> {
  final _formKey = GlobalKey<FormState>();
  late String? coords = "";

  InfoClientService infoClientService = InfoClientService();
  SocketService socketService = SocketService();
  late String? newName = "";
  int idxChosenLetterStand = 0;
  String chosenLetterReserve = "";

  @override
  Widget build(BuildContext context) {
    if (infoClientService.letterReserve.isNotEmpty) {
      chosenLetterReserve = infoClientService.letterReserve[0];
    } else {
      chosenLetterReserve = '';
    }
    for (int i = 0; i < infoClientService.player.stand.length; i++) {
      if (infoClientService.player.stand[i].letter.value == '') {
        continue;
      }
      idxChosenLetterStand = i;
      break;
    }
    return TextButton(
      onPressed: () => showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          backgroundColor: Theme.of(context).colorScheme.secondary,
          actions: <Widget>[
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (!infoClientService.powerUsedForTurn &&
                    infoClientService.isTurnOurs) ...[
                  if (infoClientService.player.powerCards.isNotEmpty) ...[
                    Text(
                      "GAME_PAGE.CARDS_AVAILABLE".tr(),
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 17,
                          decoration: TextDecoration.none),
                    ),
                  ],
                  if (infoClientService.player.powerCards.isEmpty) ...[
                    Text(
                        "${"GAME_PAGE.NO_POWERS".tr()}${3 - infoClientService.player.nbValidWordPlaced}${"GAME_PAGE.VALID_WORDS".tr()}",
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontSize: 15,
                            decoration: TextDecoration.none)),
                  ],
                  Container(
                    margin: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                    height: 350,
                    width: 300,
                    child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: infoClientService.player.powerCards.length,
                        itemBuilder: (BuildContext context, int index) {
                          return Container(
                            // height: 100,
                            margin: const EdgeInsets.fromLTRB(0, 0, 0, 10),
                            child: Row(
                              children: <Widget>[
                                FlipCard(
                                  direction: FlipDirection.HORIZONTAL,
                                  front: Container(
                                    width: 100,
                                    height: 100,
                                    // color: Colors.red,
                                    child: const Image(
                                        image: AssetImage("assets/card.png")),
                                  ),
                                  back: Container(
                                    decoration: BoxDecoration(
                                      color:
                                          Theme.of(context).colorScheme.primary,
                                      borderRadius: const BorderRadius.all(
                                          Radius.circular(5)),
                                    ),
                                    width: 150,
                                    height: 100,
                                    margin:
                                        const EdgeInsets.fromLTRB(0, 0, 40, 10),
                                    // color: Theme.of(context).colorScheme.primary,
                                    child: Padding(
                                      padding: const EdgeInsets.fromLTRB(
                                          10, 10, 10, 10),
                                      child: Text(
                                        infoClientService
                                            .player.powerCards[index].name
                                            .tr(),
                                        style: TextStyle(
                                          fontSize: 12.0,
                                          color: Theme.of(context)
                                              .colorScheme
                                              .secondary,
                                        ),
                                        textAlign: TextAlign.justify,
                                      ),
                                    ),
                                  ),
                                ),
                                TextButton(
                                  style: ButtonStyle(
                                    backgroundColor: MaterialStatePropertyAll<
                                            Color>(
                                        Theme.of(context).colorScheme.primary),
                                  ),
                                  onPressed: () => {
                                    _onPowerCardClick(infoClientService
                                        .player.powerCards[index].name)
                                  },
                                  child: Text(
                                    "GAME_PAGE.USE".tr(),
                                    style: TextStyle(
                                      color: Theme.of(context)
                                          .colorScheme
                                          .secondary,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context, 'Annuler'),
                    child: Text("GAME_PAGE.CANCEL".tr()),
                  ),
                ],
                if (infoClientService.powerUsedForTurn) ...[
                  Container(
                    margin: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                    child: Text(
                      "GAME_PAGE.ALREADY_USED_POWER".tr(),
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                          fontSize: 13,
                          decoration: TextDecoration.none),
                    ),
                  ),
                ],
                if (!infoClientService.isTurnOurs) ...[
                  Container(
                    width: 210,
                    margin: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                    child: Text(
                      "GAME_PAGE.NOT_YOUR_TURN".tr(),
                      textAlign: TextAlign.left,
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                          fontSize: 13,
                          decoration: TextDecoration.none),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
      style: ButtonStyle(
        backgroundColor: infoClientService.isTurnOurs && infoClientService.game.gameStarted ? MaterialStatePropertyAll<Color>(Theme.of(context).colorScheme.secondary) : const MaterialStatePropertyAll<Color>(Colors.grey),
        padding: MaterialStateProperty.all(
          const EdgeInsets.symmetric(vertical: 6.0, horizontal: 6.0),
        ),
        shape: MaterialStateProperty.all<RoundedRectangleBorder>(
          RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(5.0),
          ),
        ),
      ),
      child: Text(
        "GAME_PAGE.POWER_LIST".tr(),
        style: TextStyle(
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
    );
  }

  void _onPowerCardClick(String powerCardName) {
    socketService.socket.emit('requestLetterReserve');
    switch (powerCardName) {
      case TRANFORM_EMPTY_TILE:
        {
          showDialog(
            context: context,
            builder: (_) => AlertDialog(
              content: Text(
                "GAME_PAGE.ENTER_POSITION_OF_TILE".tr(),
                style: TextStyle(
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              backgroundColor: Theme.of(context).colorScheme.secondary,
              actions: <Widget>[
                Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      TextFormField(
                        onSaved: (String? value) {
                          coords = value;
                        },
                        validator: _coordsValidator,
                        decoration: InputDecoration(
                          border: const OutlineInputBorder(),
                          labelText: "GAME_PAGE.POSITION".tr(),
                          labelStyle: TextStyle(
                              color: Theme.of(context).colorScheme.primary),
                        ),
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary),
                      ),
                      TextButton(
                        onPressed: _sendCoords,
                        child: Text("GAME_PAGE.SUBMIT".tr()),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, 'Annuler'),
                        child: Text("GAME_PAGE.CANCEL".tr()),
                      ),
                    ],
                  ),
                )
              ],
            ),
          );
          break;
        }
      case EXCHANGE_LETTER_JOKER:
        {
          List<List<Color>> standColors = initStandColors();
          List<List<Color>> reserveColors = initReserveColors();
          showDialog(
            context: context,
            builder: (_) => AlertDialog(
              backgroundColor: Theme.of(context).colorScheme.secondary,
              actions: <Widget>[
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                      child: Column(
                        children: [
                          Text(
                            "GAME_PAGE.CLICK_ON_TILE_EXCHANGE".tr(),
                            style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.bold,
                                fontSize: 17,
                                decoration: TextDecoration.none),
                          ),
                          StatefulBuilder(builder:
                              (BuildContext context, StateSetter setState) {
                            return Container(
                              margin: const EdgeInsets.fromLTRB(0, 20, 0, 0),
                              height: 70,
                              width: 300,
                              child: GridView.count(
                                crossAxisCount: 7,
                                shrinkWrap: true,
                                children: List.generate(
                                    infoClientService.player.stand.length,
                                    (index) {
                                  return Container(
                                    margin:
                                        const EdgeInsets.fromLTRB(0, 0, 10, 0),
                                    child: TextButton(
                                      style: ButtonStyle(
                                        backgroundColor:
                                            MaterialStatePropertyAll<Color>(
                                                standColors[index][0]),
                                      ),
                                      onPressed: () => {
                                        setState(() => {
                                              standColors = _colorChangeStand(
                                                  standColors, index)
                                            }),
                                      },
                                      child: Text(
                                        infoClientService
                                            .player.stand[index].letter.value,
                                        style: TextStyle(
                                          fontSize: 17,
                                          color: standColors[index][1],
                                        ),
                                      ),
                                    ),
                                  );
                                }),
                              ),
                            );
                          }),
                          if (chosenLetterReserve != '') ...[
                            Text(
                              "GAME_PAGE.CLICK_ON_TILE_RESERVE".tr(),
                              style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 17,
                                  decoration: TextDecoration.none),
                            ),
                            StatefulBuilder(
                              builder:
                                  (BuildContext context, StateSetter setState) {
                                return Container(
                                  margin:
                                      const EdgeInsets.fromLTRB(0, 20, 0, 0),
                                  height: 150,
                                  width: 450,
                                  child: GridView.count(
                                    crossAxisCount: 10,
                                    shrinkWrap: true,
                                    children: List.generate(
                                        infoClientService.letterReserve.length,
                                        (index) {
                                      return Container(
                                        margin: const EdgeInsets.fromLTRB(
                                            0, 0, 10, 10),
                                        child: TextButton(
                                          style: ButtonStyle(
                                            backgroundColor:
                                                MaterialStatePropertyAll<Color>(
                                                    reserveColors[index][0]),
                                          ),
                                          onPressed: () => {
                                            setState(() => {
                                                  reserveColors =
                                                      _colorChangeReserve(
                                                          reserveColors, index)
                                                }),
                                          },
                                          child: Text(
                                            infoClientService
                                                .letterReserve[index]
                                                .toLowerCase(),
                                            style: TextStyle(
                                              fontSize: 17,
                                              color: reserveColors[index][1],
                                            ),
                                          ),
                                        ),
                                      );
                                    }),
                                  ),
                                );
                              },
                            ),
                            TextButton(
                              onPressed: () => {_makeLetterExchange()},
                              child: Text("GAME_PAGE.CONFIRM".tr(), style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,)),
                            ),
                          ],
                          if (chosenLetterReserve == '') ...[
                            Text(
                              "GAME_PAGE.NO_LETTER_AVAILABLE".tr(),
                              style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 17,
                                  decoration: TextDecoration.none),
                            ),
                          ],
                          TextButton(
                            onPressed: () => Navigator.pop(context, 'Annuler'),
                            child: Text("GAME_PAGE.CANCEL".tr(),style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
          break;
        }
      case EXCHANGE_STAND:
        {
          List<Player> playersExcludingThisClient = [];
          playersExcludingThisClient.addAll(infoClientService.actualRoom.players
              .where((player) => player.name != infoClientService.playerName));
          showDialog(
            context: context,
            builder: (_) => AlertDialog(
              backgroundColor: Theme.of(context).colorScheme.secondary,
              actions: <Widget>[
                Container(
                  margin: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                  height: 350,
                  width: 250,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        "GAME_PAGE.CLICK_AVATAR".tr(),
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 17,
                            decoration: TextDecoration.none),
                      ),
                      Container(
                        child: ListView.builder(
                            shrinkWrap: true,
                            itemCount: playersExcludingThisClient.length,
                            itemBuilder: (BuildContext context, int index) {
                              return Container(
                                margin: const EdgeInsets.fromLTRB(0, 0, 0, 10),
                                child: Row(
                                  children: <Widget>[
                                    IconButton(
                                      iconSize: 50,
                                      icon: CircleAvatar(
                                        radius: 50,
                                        backgroundImage: MemoryImage(
                                          getAvatarFromPlayerUri(
                                              playersExcludingThisClient[index]
                                                  .avatarUri),
                                        ),
                                      ),
                                      onPressed: () {
                                        _onAvatarPressed(
                                            playersExcludingThisClient[index]
                                                .name);
                                      },
                                    ),
                                    TextButton(
                                      onPressed: () {
                                        _onAvatarPressed(
                                            playersExcludingThisClient[index]
                                                .name);
                                      },
                                      child: Text(
                                        playersExcludingThisClient[index].name,
                                        style: TextStyle(
                                          color: Theme.of(context)
                                              .colorScheme
                                              .primary,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, 'Annuler'),
                        child: Text("GAME_PAGE.CANCEL".tr()),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
          break;
        }
      default:
        {
          if (!infoClientService.isTurnOurs) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text("GAME_PAGE.NOT_YOUR_TURN".tr()),
              backgroundColor: Colors.red.shade300,
            ));
          } else {
            socketService.socket.emit('powerCardClick', [powerCardName, '']);
            infoClientService.powerUsedForTurn = true;
          }
          Navigator.pop(context);
          break;
        }
    }
  }

  String? _coordsValidator(String? value) {
    if (value == null || value.isEmpty) {
      return "GAME_PAGE.ENTER_POSITION".tr();
    } else if (!RegExp(r'^[a-zA-Z0-9]+$').hasMatch(value)) {
      return "GAME_PAGE.FORM_MUST_BE".tr();
    } else {
      int idxLine = value
              .substring(0, END_POSITION_INDEX_LINE)
              .toLowerCase()
              .codeUnitAt(0) -
          ASCII_CODE_SHIFT;
      int idxColumn =
          int.parse(value.substring(END_POSITION_INDEX_LINE, value.length));
      if (idxLine <= 0 ||
          idxColumn <= 0 ||
          idxLine > NUMBER_SQUARE_H_AND_W ||
          idxColumn > NUMBER_SQUARE_H_AND_W) {
        return "GAME_PAGE.POSITION_INVALID".tr();
      }
      if (infoClientService.game.board[idxLine][idxColumn].letter.value != '') {
        return "GAME_PAGE.NOT_EMPTY_POSITION".tr();
      }
      if (infoClientService.game.board[idxLine][idxColumn].bonus != 'xx') {
        return "GAME_PAGE.ALREADY_BONUS_POSITION".tr();
      }
      coords = value;
      return null;
    }
  }

  void _sendCoords() {
    if (!infoClientService.isTurnOurs) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text("GAME_PAGE.NOT_YOUR_TURN".tr()),
        backgroundColor: Colors.red.shade300,
      ));
    } else if (_formKey.currentState!.validate()) {
      _formKey.currentState?.save();
      if (coords == '') {
        return;
      }
      int idxLine = coords!
              .substring(0, END_POSITION_INDEX_LINE)
              .toLowerCase()
              .codeUnitAt(0) -
          ASCII_CODE_SHIFT;
      int idxColumn =
          int.parse(coords!.substring(END_POSITION_INDEX_LINE, coords!.length));
      socketService.socket
          .emit('powerCardClick', [TRANFORM_EMPTY_TILE, '$idxLine-$idxColumn']);
      infoClientService.powerUsedForTurn = true;
    } else {
      return;
    }
    Navigator.pop(context);
    Navigator.pop(context);
  }

  void _makeLetterExchange() {
    if (!infoClientService.isTurnOurs) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text("GAME_PAGE.NOT_YOUR_TURN".tr()),
        backgroundColor: Colors.red.shade300,
      ));
    } else {
      String additionalParams =
          chosenLetterReserve + idxChosenLetterStand.toString();
      socketService.socket
          .emit('powerCardClick', [EXCHANGE_LETTER_JOKER, additionalParams]);
      infoClientService.powerUsedForTurn = true;
    }
    Navigator.pop(context);
    Navigator.pop(context);
  }

  void _onAvatarPressed(String playerName) {
    if (!infoClientService.isTurnOurs) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text("GAME_PAGE.NOT_YOUR_TURN".tr()),
        backgroundColor: Colors.red.shade300,
      ));
    } else {
      infoClientService.powerUsedForTurn = true;
      socketService.socket.emit('powerCardClick', [EXCHANGE_STAND, playerName]);
    }
    Navigator.pop(context);
    Navigator.pop(context);
  }

  Uint8List getAvatarFromPlayerUri(String avatarUri) {
    return base64Decode(avatarUri.substring(22));
  }

  List<List<Color>> _colorChangeStand(List<List<Color>> colorStand, int index) {
    List<List<Color>> newColorStand = initStandColors();
    Color backGroundColorSave = colorStand[index][0];
    newColorStand[index][0] = colorStand[index][1];
    newColorStand[index][1] = backGroundColorSave;
    idxChosenLetterStand = index;
    return newColorStand.toList();
  }

  List<List<Color>> _colorChangeReserve(
      List<List<Color>> colorReserve, int index) {
    List<List<Color>> newColorReserve = initReserveColors();
    Color backGroundColorSave = colorReserve[index][0];
    newColorReserve[index][0] = colorReserve[index][1];
    newColorReserve[index][1] = backGroundColorSave;
    chosenLetterReserve = infoClientService.letterReserve[index].toLowerCase();
    return newColorReserve.toList();
  }

  List<List<Color>> initStandColors() {
    return [
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
    ].toList();
  }

  List<List<Color>> initReserveColors() {
    return [
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
    ].toList();
  }
}

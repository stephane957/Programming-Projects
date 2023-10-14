import 'dart:ui';

import 'package:client_leger/models/room-data.dart';
import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;

import '../services/chat-service.dart';
import '../widget/chat_panel.dart';

class GameListPage extends StatefulWidget {
  const GameListPage({Key? key}) : super(key: key);

  @override
  State<GameListPage> createState() => _GameListPageState();
}

class _GameListPageState extends State<GameListPage> {
  // late List<Room> rooms = [];
  final SocketService socketService = SocketService();
  final InfoClientService infoClientService = InfoClientService();
  ChatService chatService = ChatService();

  @override
  void initState() {
    initSockets();
    super.initState();
    infoClientService.addListener(refresh);
  }

  void refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  void initSockets() {
    socketService.socket.on("roomChangeAccepted", (data) {
      if (mounted) {
        Navigator.pushNamed(context, "/game");
      }
    });
    infoClientService.clearRooms();
    socketService.socket.emit("listRoom");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      endDrawer: Drawer(
          width: 600,
          child: ChatPanel(
            isInGame: false,
          )),
      onEndDrawerChanged: (isOpen) {
        chatService.isDrawerOpen = isOpen;
        chatService.notifyListeners();
      },
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage("assets/background.jpg"),
                fit: BoxFit.cover,
              ),
            ),
            padding:
                const EdgeInsets.symmetric(vertical: 100.0, horizontal: 100.0),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.rectangle,
                  color: Theme.of(context).colorScheme.secondary,
                  borderRadius: const BorderRadius.all(
                    Radius.circular(20.0),
                  ),
                  border: Border.all(
                      color: Theme.of(context).colorScheme.primary, width: 3),
                ),
                padding: const EdgeInsets.symmetric(
                    vertical: 25.0, horizontal: 25.0),
                child: Stack(
                  children: [
                    Center(
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              IconButton(
                                onPressed: _goBackHomePage,
                                icon: Icon(
                                  Icons.arrow_back,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                              ),
                              const SizedBox(
                                width: 200.0,
                              ),
                              Column(
                                children: [
                                  Icon(
                                    Icons.person,
                                    color: Theme.of(context).colorScheme.primary,
                                  ),
                                  Text(
                                    "${globals.userLoggedIn.username} (${"GAME_LIST_PAGE.YOU".tr()})",
                                    style: TextStyle(
                                        color:
                                        Theme.of(context).colorScheme.primary),
                                  ),
                                ],
                              ),
                              const SizedBox(width: 240),
                              ElevatedButton(
                                onPressed: _createGame,
                                child: Text(
                                  "GAME_LIST_PAGE.CREATE_GAME".tr(),
                                  style: TextStyle(
                                      color:
                                      Theme.of(context).colorScheme.secondary),
                                ),
                              ),
                              Container(
                                  margin: const EdgeInsets.all(5),
                                  child: const ChatPanelOpenButton()
                              ),
                            ],
                          ),
                          const SizedBox(
                            height: 30.0,
                          ),
                          Text(
                            "GAME_LIST_PAGE.LIST_ROOM_GAMES".tr(),
                            style: TextStyle(
                                fontSize: 25,
                                color: Theme.of(context).colorScheme.primary),
                          ),
                          const SizedBox(
                            height: 25.0,
                          ),
                          Expanded(
                            child: Container(
                              child: gameList(
                                rooms: infoClientService.rooms
                                    .where((room) =>
                                room.gameMode == infoClientService.gameMode)
                                    .toList(),
                              ),
                            ),
                          )
                        ],
                      ),
                    ),
                    StatefulBuilder(
                        builder: (BuildContext context, StateSetter setState) {
                          return Positioned(
                            top: 4,
                            right: 210,
                            child: Container(
                              height: 63,
                              width: 63,
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.secondary,
                                borderRadius: const BorderRadius.all(Radius.circular(35.0)),
                              ),
                              child: IconButton(
                                iconSize: 35,
                                icon: infoClientService.soundDisabled ? Icon(Icons.volume_off_sharp, color: Theme.of(context).colorScheme.primary) : Icon(Icons.volume_up_outlined, color: Theme.of(context).colorScheme.primary),
                                color: Theme.of(context).colorScheme.secondary,
                                onPressed: () {
                                  setState(() =>{infoClientService.soundDisabled = !infoClientService.soundDisabled});
                                  infoClientService.notifyListeners();
                                  socketService.notifyListeners();
                                },
                              ),
                            ),
                          );
                        }
                    ),
                  ],
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  void _createGame() {
    Navigator.pushNamed(context, "/create-game");
  }

  void _goBackHomePage() {
    Navigator.pop(context);
  }
}

class gameList extends StatefulWidget {
  gameList({Key? key, required this.rooms}) : super(key: key);

  late List<RoomData> rooms;

  @override
  State<gameList> createState() => _gameListState();
}

class _gameListState extends State<gameList> {
  SocketService socketService = SocketService();
  String password = "";

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: DataTable(
        headingRowColor: MaterialStateColor.resolveWith(
            (states) => Theme.of(context).colorScheme.primary),
        border: TableBorder(
          horizontalInside: BorderSide(
              color: Theme.of(context).colorScheme.primary, width: 2.0),
          bottom: BorderSide(
              color: Theme.of(context).colorScheme.primary, width: 2.0),
          top: BorderSide(
              color: Theme.of(context).colorScheme.primary, width: 2.0),
          left: BorderSide(
              color: Theme.of(context).colorScheme.primary, width: 2.0),
          right: BorderSide(
              color: Theme.of(context).colorScheme.primary, width: 2.0),
          borderRadius: BorderRadius.circular(40),
        ),
        showCheckboxColumn: false,
        columns: [
          DataColumn(
            label: Expanded(
              child: Container(
                padding: EdgeInsets.zero,
                child: Text(
                  "GAME_LIST_PAGE.ROOM_NAME".tr(),
                  overflow: TextOverflow.visible,
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.secondary),
                  // textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
          DataColumn(
            label: Expanded(
              child: Container(
                child: Text(
                  "GAME_LIST_PAGE.CREATOR_NAME".tr(),
                  overflow: TextOverflow.visible,
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.secondary),
                ),
              ),
            ),
          ),
          DataColumn(
            label: Expanded(
              child: Container(
                child: Text(
                  "GAME_LIST_PAGE.NUMBER_REAL_PLAYERS".tr(),
                  overflow: TextOverflow.visible,
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.secondary),
                ),
              ),
            ),
          ),
          DataColumn(
            label: Expanded(
              child: Container(
                child: Text(
                  "GAME_LIST_PAGE.NUMBER_VIRTUAL_PLAYERS".tr(),
                  overflow: TextOverflow.visible,
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.secondary),
                ),
              ),
            ),
          ),
          DataColumn(
            label: Expanded(
              child: Container(
                child: Text(
                  "GAME_LIST_PAGE.NUMBER_SPECTATORS".tr(),
                  overflow: TextOverflow.visible,
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.secondary),
                ),
              ),
            ),
          ),
        ],
        rows: List<DataRow>.generate(
            widget.rooms.length,
            (int index) => DataRow(
                    onSelectChanged: (bool? selected) {
                      if (selected!) {
                        joinGame(widget.rooms[index]);
                      }
                    },
                    cells: [
                      DataCell(Text(
                        widget.rooms[index].name,
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary),
                      )),
                      DataCell(Text(
                        widget.rooms[index].roomCreator,
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary),
                      )),
                      DataCell(Text(
                        widget.rooms[index].numberRealPlayer.toString(),
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary),
                      )),
                      DataCell(Text(
                        widget.rooms[index].numberVirtualPlayer.toString(),
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary),
                      )),
                      DataCell(Text(
                        widget.rooms[index].numberSpectators.toString(),
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary),
                      )),
                    ])),
      ),
    );
  }

  void joinGame(room) {
    if (room.passwd != '') {
      askForPassword(context, room);
    }
    else{
      socketService.socket.emit("joinRoom",
          [room.name, socketService.socket.id]
      );
    }
  }

  Future<void> askForPassword(BuildContext context, RoomData room) async {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
            backgroundColor: Theme.of(context).colorScheme.secondary,
            title: Text(
              "GAME_LIST_PAGE.PASSWORD".tr(),
              style: TextStyle(color: Theme.of(context).colorScheme.primary),
            ),
            content: TextField(
              style: TextStyle(color: Theme.of(context).colorScheme.primary),
              onChanged: (value) {
                setState(() {
                  password = value;
                });
              },
              decoration: InputDecoration(
                  hintText: "GAME_LIST_PAGE.PASSWORD".tr(),
                  hintStyle: TextStyle(color: Theme.of(context).colorScheme.primary)),
            ),
            actions: <Widget>[
              ElevatedButton(
                child: Text("GAME_LIST_PAGE.CANCEL".tr(), style: TextStyle(color: Theme.of(context).colorScheme.secondary),
                ),
                onPressed: () {
                  setState(() {
                    Navigator.pop(context);
                  });
                },
              ),
              ElevatedButton(
                child: Text("GAME_LIST_PAGE.OK".tr(), style: TextStyle(color: Theme.of(context).colorScheme.secondary),),
                onPressed: () {
                  setState(() {
                    if (password == room.passwd) {
                      socketService.socket.emit("joinRoom",
                          [room.name, socketService.socket.id]
                      );
                    }
                    else{
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                        content: Text("GAME_LIST_PAGE.WRONG_PASSWORD".tr()),
                        backgroundColor: Colors.red.shade300,
                      ));
                    }
                    Navigator.pop(context);
                  });
                },
              ),
            ],
          );
        });
  }
}

import 'dart:ui';

import 'package:client_leger/services/users_controller.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/chat-service.dart';
import '../services/socket_service.dart';
import '../widget/chat_panel.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({Key? key}) : super(key: key);

  @override
  State<SearchPage> createState() => _SearchPage();
}

class _SearchPage extends State<SearchPage> {
  final Controller controller = Controller();
  SocketService socketService = SocketService();
  ChatService chatService = ChatService();
  late List<dynamic> usersFound = [];
  User? user;

  refresh() {
    if (!mounted) {
      return;
    }
    setState(() {});
  }

  _SearchPage() {
    socketService.socket.on("getPlayerNames", (data) {
      usersFound = data;
      refresh();
    });
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
      body: Container(
          decoration: const BoxDecoration(
            image: DecorationImage(
              image: AssetImage("assets/background.jpg"),
              fit: BoxFit.cover,
            ),
          ),
          padding:
              const EdgeInsets.symmetric(vertical: 50.0, horizontal: 100.0),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                      vertical: 50.0, horizontal: 50.0),
                  child: SizedBox(
                    width: 300,
                    child: Container(
                      decoration: BoxDecoration(
                          shape: BoxShape.rectangle,
                          color: Theme.of(context).colorScheme.secondary,
                          borderRadius:
                              const BorderRadius.all(Radius.circular(20.0)),
                          border: Border.all(
                              color: Theme.of(context).colorScheme.primary,
                              width: 3)),
                      padding: const EdgeInsets.symmetric(
                          vertical: 25.0, horizontal: 5.0),
                      child: Center(
                        child: Column(
                          children: [
                            TextFormField(
                              onChanged: (String? value) {
                                socketService.socket
                                    .emit("getPlayerNames", (value));
                              },
                              decoration: InputDecoration(
                                border: const OutlineInputBorder(),
                                labelText: "SEARCH_PAGE.SEARCH_PLAYERS".tr(),
                                labelStyle: TextStyle(
                                    color:
                                        Theme.of(context).colorScheme.primary),
                              ),
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.primary
                              ),
                            ),
                            Expanded(
                              child: ListView.builder(
                                  shrinkWrap: true,
                                  itemCount: usersFound.length,
                                  itemBuilder:
                                      (BuildContext context, int index) {
                                    return GestureDetector(
                                        onTap: () async {
                                          var userWanted =
                                              await controller.getUserById(
                                                  usersFound[index]['_id']);
                                          FocusScope.of(context).unfocus();
                                          user = userWanted;
                                          refresh();
                                        },
                                        child: Center(
                                            child: Text(
                                                '${usersFound[index]["name"]}',
                                                style: TextStyle(
                                                    color: Theme.of(context).colorScheme.primary,
                                                    fontSize: 25,
                                                    decoration:
                                                        TextDecoration.none))));
                                  }),
                            )
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                      shape: BoxShape.rectangle,
                      color: Theme.of(context).colorScheme.secondary,
                      borderRadius:
                          const BorderRadius.all(Radius.circular(20.0)),
                      border: Border.all(
                          color: Theme.of(context).colorScheme.primary,
                          width: 3)),
                  padding: const EdgeInsets.symmetric(
                      vertical: 25.0, horizontal: 25.0),
                  width: 600,
                  child: user == null
                      ? const SizedBox(
                          width: 200,
                          height: 600,
                        )
                      : SizedBox(
                          width: 200,
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
                                    width: 175.0,
                                  ),
                                  CircleAvatar(
                                    radius: 48,
                                    backgroundImage:
                                        MemoryImage(user!.getUriFromAvatar()),
                                  ),
                                  const SizedBox(
                                    width: 100.0,
                                  ),
                                ],
                              ),
                              Text(user!.username,
                                  style: TextStyle(
                                      color: Theme.of(context).colorScheme.primary,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 17,
                                      decoration: TextDecoration.none)),
                              Container(
                                padding:
                                    const EdgeInsets.only(top: 50, bottom: 50),
                                child: Table(
                                  children: [
                                    TableRow(
                                      children: [
                                        returnRowTextElement("PROFILE_PAGE.GAMES_PLAYED".tr()),
                                        returnRowTextElement("PROFILE_PAGE.GAMES_WON".tr()),
                                        returnRowTextElement(
                                            "PROFILE_PAGE.AVERAGE_SCORE".tr()),
                                        returnRowTextElement(
                                            "PROFILE_PAGE.AVERAGE_TIME".tr()),
                                      ],
                                    ),
                                    TableRow(
                                      children: [
                                        returnRowTextElement(
                                            user!.gamesPlayed.toString()),
                                        returnRowTextElement(
                                            user!.gamesWon.toString()),
                                        returnRowTextElement(user!
                                                .averagePointsPerGame!
                                                .toStringAsFixed(2)),
                                        returnRowTextElement(Duration(
                                                milliseconds: user!
                                                    .averageTimePerGame!
                                                    .round())
                                            .toString()),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  returnHistoryScrollView(
                                      "PROFILE_PAGE.GAME_HISTORY".tr(),
                                      user!.gameHistory!),
                                ],
                              )
                            ],
                          ),
                        ),
                ), Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.fromLTRB(10, 3, 0, 3),
                      child: const ChatPanelOpenButton())
                  ],
                ),
              ],
            ),
          )),
    );
  }

  void _goBackHomePage() {
    Navigator.pop(context);
  }

  Text returnRowTextElement(String textData) {
    return Text((textData),
        style: TextStyle(
            color: Theme.of(context).colorScheme.primary,
            fontSize: 11,
            decoration: TextDecoration.none));
  }

  Column returnHistoryScrollView(String title, List<dynamic> history) {
    return Column(
      children: [
        SingleChildScrollView(
          child: Column(
            children: [
              Text(title,
                  style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontSize: 11,
                      decoration: TextDecoration.none)),
              Container(
                decoration: BoxDecoration(border: Border.all()),
                height: 300,
                width: 400,
                child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: history.length,
                    itemBuilder: (BuildContext context, int index) {
                      return Text('\u2022 ${translateConnection(history[index])}',
                          style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                              fontSize: 11,
                              decoration: TextDecoration.none));
                    }),
              )
            ],
          ),
        ),
      ],
    );
  }

  String translateConnection(String text){
    String newText = text;
    if (context.locale.languageCode == "fr"){
      newText = newText.replaceAll("Login:", "Connexion:");
      newText = newText.replaceAll("Logout:", "Déconnexion");
      newText = newText.replaceAll("Creation de compte:", "Création de compte:");
      newText = newText.replaceAll("Partie Gagne", "Partie Gagné");
    }
    else {
      newText = newText.replaceAll("Creation de compte:", "Account creation:");
      newText = newText.replaceAll("Partie Gagne le", "Game won the");
      newText = newText.replaceAll("Partie Perdu le ", "Game lost the ");
      newText = newText.replaceAll("à", "at");
    }
    return newText;
  }
}

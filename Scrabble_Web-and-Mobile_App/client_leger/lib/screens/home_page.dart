import 'package:client_leger/screens/profile-page.dart';
import 'package:client_leger/screens/search_page.dart';
import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/tapService.dart';
import 'package:client_leger/services/users_controller.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:easy_localization/easy_localization.dart';
import 'package:flip_card/flip_card.dart';
import 'package:flutter/material.dart';

import '../constants/constants.dart';
import '../env/environment.dart';
import '../services/chat-service.dart';
import '../widget/chat_panel.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key}) : super(key: key);

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  final Controller controller = Controller();
  final InfoClientService infoClientService = InfoClientService();
  final SocketService socketService = SocketService();
  final TapService tapService = TapService();
  final String? serverAddress = Environment().config?.serverURL;
  ChatService chatService = ChatService();

  @override
  void initState() {
    super.initState();
    controller.getFavouriteGames();
  }

  refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    socketService.socket.emit('getAllChatRooms');
    return WillPopScope(
        onWillPop: () async {
      _logout();
      return false;
    },
    child: Scaffold(
      endDrawer: Drawer(
          width: 600,
          child: ChatPanel(
            isInGame: false,
          )),
      onEndDrawerChanged: (isOpen) {
        chatService.isDrawerOpen = isOpen;
        chatService.notifyListeners();
      },
      body: Stack(
        children: <Widget>[
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage("assets/background.jpg"),
                fit: BoxFit.cover,
              ),
            ),
          ),
          const Positioned(
              top: 10.0, right: 30.0, child: ChatPanelOpenButton()),
          Positioned(
              top: 100.0,
              right: 30.0,
              child: ElevatedButton(
                  style: ButtonStyle(
                      backgroundColor: MaterialStateColor.resolveWith(
                              (states) => Theme.of(context).colorScheme.secondary),
                      padding: MaterialStateProperty.all(
                        const EdgeInsets.symmetric(
                            vertical: 18.0, horizontal: 0.0),
                      ),
                      shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                          RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(100.0)))),
                  onPressed: _toSearchPage,
                  child: Icon(
                    Icons.search,
                    color: Theme.of(context).colorScheme.primary,
                  ))),
          Positioned(
            top: 10.0,
            left: 30.0,
            child: ElevatedButton(
              style: ButtonStyle(
                backgroundColor: MaterialStateColor.resolveWith(
                        (states) => Theme.of(context).colorScheme.secondary),
                padding: MaterialStateProperty.all(
                  const EdgeInsets.symmetric(vertical: 6.0, horizontal: 0.0),
                ),
                shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                  RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                ),
              ),
              onPressed: _logout,
              child: Icon(
                Icons.logout,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ),
          Center(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                GestureDetector(
                  onTap: _toProfilePage,
                  child: CircleAvatar(
                    radius: 48,
                    backgroundImage:
                        MemoryImage(globals.userLoggedIn.getUriFromAvatar()),
                  ),
                ),
                Text(globals.userLoggedIn.username,
                    style: const TextStyle(
                        color: Colors.black,
                        fontWeight: FontWeight.bold,
                        fontSize: 17,
                        decoration: TextDecoration.none))
              ],
            ),
          ),
          Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    FlipCard(
                      direction: FlipDirection.HORIZONTAL,
                      front: Container(
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.secondary,
                          borderRadius: const BorderRadius.all(Radius.circular(5)),
                        ),
                        width: 200,
                        height: 300,
                        child: Stack(
                          children: [
                            Center(
                              child: Text(
                                "HOME_SCREEN.CLASSIC_MODE".tr(),
                                style: TextStyle(
                                  color:
                                  Theme.of(context).colorScheme.primary,
                                  fontSize: 20,
                                ),
                              ),
                            ),
                            Positioned(
                              left: 10,
                              top: 10,
                              child: Icon(
                                Icons.sentiment_satisfied,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                            Positioned(
                              right: 10,
                              top: 10,
                              child: Icon(
                                Icons.sentiment_satisfied,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                            Positioned(
                              left: 10,
                              bottom: 10,
                              child: Icon(
                                Icons.sentiment_satisfied,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                            Positioned(
                              right: 10,
                              bottom: 10,
                              child: Icon(
                                Icons.sentiment_satisfied,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                          ],
                        ),
                      ),
                      back: Container(
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.secondary,
                          borderRadius: const BorderRadius.all(Radius.circular(5)),
                        ),
                        width: 200,
                        height: 300,
                        margin: const EdgeInsets.fromLTRB(0, 0, 40, 5),
                        // color: Theme.of(context).colorScheme.primary,
                        child: Stack(
                          children: [
                            Padding(
                              padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                              child: Center(
                                child: Text(
                                  "HOME_SCREEN.CLASSIC_MODE_DESCRIPTION".tr(),
                                  style: TextStyle(
                                    fontSize: 12.0,
                                    color: Theme.of(context).colorScheme.primary,
                                  ),
                                  textAlign: TextAlign.justify,
                                ),
                              ),
                            ),
                            Positioned(
                              left: 10,
                              top: 10,
                              child: Icon(
                                Icons.sentiment_satisfied,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                            Positioned(
                              right: 10,
                              top: 10,
                              child: Icon(
                                Icons.sentiment_satisfied,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                            Positioned(
                              left: 10,
                              bottom: 10,
                              child: Icon(
                                Icons.sentiment_satisfied,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                            Positioned(
                              right: 10,
                              bottom: 10,
                              child: Icon(
                                Icons.sentiment_satisfied,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    ElevatedButton(
                      style: ButtonStyle(
                        backgroundColor: MaterialStateColor.resolveWith(
                                (states) => Theme.of(context).colorScheme.secondary),
                        padding: MaterialStateProperty.all(
                          const EdgeInsets.symmetric(
                              vertical: 10.0, horizontal: 10.0),
                        ),
                        shape: MaterialStateProperty.all<
                            RoundedRectangleBorder>(
                          RoundedRectangleBorder(
                            borderRadius:
                            BorderRadius.circular(10.0),
                          ),
                        ),
                      ),
                      onPressed: (){
                        infoClientService.gameMode = CLASSIC_MODE;
                        _toGameListPage();
                      },
                      child: Text(
                        "HOME_SCREEN.GO_IN_BTN".tr(),
                        style: TextStyle(
                            fontSize: 20,
                            color: Theme.of(context).colorScheme.primary
                        ),
                      ),
                    ),
                  ],
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    FlipCard(
                      direction: FlipDirection.HORIZONTAL,
                      front: Container(
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.secondary,
                              borderRadius: const BorderRadius.all(Radius.circular(5)),
                            ),
                            width: 200,
                            height: 300,
                            child: Stack(
                              children: [
                                Center(
                                  child: Text(
                                    "HOME_SCREEN.RANKED_MODE".tr(),
                                    style: TextStyle(
                                      color:
                                      Theme.of(context).colorScheme.primary,
                                      fontSize: 20,
                                    ),
                                  ),
                                ),
                                Positioned(
                                  left: 10,
                                  top: 10,
                                  child: Icon(
                                    Icons.gavel,
                                    color: Theme.of(context).colorScheme.primary,
                                    size: 35,
                                  ),
                                ),
                                Positioned(
                                  right: 10,
                                  top: 10,
                                  child: Icon(
                                    Icons.gavel,
                                    color: Theme.of(context).colorScheme.primary,
                                    size: 35,
                                  ),
                                ),
                                Positioned(
                                  left: 10,
                                  bottom: 10,
                                  child: Icon(
                                    Icons.gavel,
                                    color: Theme.of(context).colorScheme.primary,
                                    size: 35,
                                  ),
                                ),
                                Positioned(
                                  right: 10,
                                  bottom: 10,
                                  child: Icon(
                                    Icons.gavel,
                                    color: Theme.of(context).colorScheme.primary,
                                    size: 35,
                                  ),
                                ),
                              ],
                          ),
                        ),
                      back: Container(
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.secondary,
                          borderRadius: const BorderRadius.all(Radius.circular(5)),
                        ),
                        width: 200,
                        height: 300,
                        margin: const EdgeInsets.fromLTRB(0, 0, 40, 5),
                        // color: Theme.of(context).colorScheme.primary,
                        child: Stack(
                          children: [
                            Padding(
                              padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                              child: Center(
                                child: Text(
                                    "HOME_SCREEN.RANKED_MODE_DESCRIPTION".tr(),
                                  style: TextStyle(
                                    fontSize: 12.0,
                                    color: Theme.of(context).colorScheme.primary,
                                  ),
                                  textAlign: TextAlign.justify,
                                ),
                              ),
                            ),
                            Positioned(
                              left: 10,
                              top: 10,
                              child: Icon(
                                Icons.gavel,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                            Positioned(
                              right: 10,
                              top: 10,
                              child: Icon(
                                Icons.gavel,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                            Positioned(
                              left: 10,
                              bottom: 10,
                              child: Icon(
                                Icons.gavel,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                            Positioned(
                              right: 10,
                              bottom: 10,
                              child: Icon(
                                Icons.gavel,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    ElevatedButton(
                      style: ButtonStyle(
                        backgroundColor: MaterialStateColor.resolveWith(
                                (states) => Theme.of(context).colorScheme.secondary),
                        padding: MaterialStateProperty.all(
                          const EdgeInsets.symmetric(
                              vertical: 10.0, horizontal: 10.0),
                        ),
                        shape: MaterialStateProperty.all<
                            RoundedRectangleBorder>(
                          RoundedRectangleBorder(
                            borderRadius:
                            BorderRadius.circular(10.0),
                          ),
                        ),
                      ),
                      onPressed: (){
                        infoClientService.gameMode = MODE_RANKED;
                        _toRankedInitPage();
                      },
                      child: Text(
                        "HOME_SCREEN.GO_IN_BTN".tr(),
                        style: TextStyle(
                            fontSize: 20,
                            color: Theme.of(context).colorScheme.primary
                        ),
                      ),
                    ),
                  ],
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    FlipCard(
                      direction: FlipDirection.HORIZONTAL,
                      front: Container(
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.secondary,
                          borderRadius: const BorderRadius.all(Radius.circular(5)),
                        ),
                        width: 200,
                        height: 300,
                        child: Stack(
                          children: [
                            Center(
                              child: Text(
                                "HOME_SCREEN.POWER_CARDS_MODE".tr(),
                                style: TextStyle(
                                  color:
                                  Theme.of(context).colorScheme.primary,
                                  fontSize: 20,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                            Positioned(
                              left: 10,
                              top: 10,
                              child: Icon(
                                Icons.auto_fix_normal,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),

                            Positioned(
                              right: 10,
                              top: 10,
                              child: Icon(
                                Icons.auto_fix_normal,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                            Positioned(
                              left: 10,
                              bottom: 10,
                              child: Icon(
                                Icons.auto_fix_normal,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                            Positioned(
                              right: 10,
                              bottom: 10,
                              child: Icon(
                                Icons.auto_fix_normal,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                          ],
                        ),
                      ),
                      back: Container(
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.secondary,
                          borderRadius: const BorderRadius.all(Radius.circular(5)),
                        ),
                        width: 200,
                        height: 300,
                        margin: const EdgeInsets.fromLTRB(0, 0, 40, 5),
                        // color: Theme.of(context).colorScheme.primary,
                        child: Stack(
                          children: [
                            Padding(
                              padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                              child: Center(
                                child: Text(
                                  "HOME_SCREEN.POWER_CARD_MODE_DESCRIPTION".tr(),
                                  style: TextStyle(
                                    fontSize: 12.0,
                                    color: Theme.of(context).colorScheme.primary,
                                  ),
                                  textAlign: TextAlign.justify,
                                ),
                              ),
                            ),
                            Positioned(
                              left: 10,
                              top: 10,
                              child: Icon(
                                Icons.auto_fix_normal,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),

                            Positioned(
                              right: 10,
                              top: 10,
                              child: Icon(
                                Icons.auto_fix_normal,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                            Positioned(
                              left: 10,
                              bottom: 10,
                              child: Icon(
                                Icons.auto_fix_normal,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                            Positioned(
                              right: 10,
                              bottom: 10,
                              child: Icon(
                                Icons.auto_fix_normal,
                                color: Theme.of(context).colorScheme.primary,
                                size: 35,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    ElevatedButton(
                      style: ButtonStyle(
                        backgroundColor: MaterialStateColor.resolveWith(
                                (states) => Theme.of(context).colorScheme.secondary),
                        padding: MaterialStateProperty.all(
                          const EdgeInsets.symmetric(
                              vertical: 10.0, horizontal: 10.0),
                        ),
                        shape: MaterialStateProperty.all<
                            RoundedRectangleBorder>(
                          RoundedRectangleBorder(
                            borderRadius:
                            BorderRadius.circular(10.0),
                          ),
                        ),
                      ),
                      onPressed: (){
                        infoClientService.gameMode = POWER_CARDS_MODE;
                        _toGameListPage();
                      },
                      child: Text(
                        "HOME_SCREEN.GO_IN_BTN".tr(),
                        style: TextStyle(
                            fontSize: 20,
                            color: Theme.of(context).colorScheme.primary
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) {
              return Positioned(
                top: 190,
                right: 30,
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
    ),);
  }


  void _toSearchPage() {
    Navigator.push(context,
            MaterialPageRoute(builder: (context) => const SearchPage()))
        .then((value) {
      setState(() {});
    });
  }

  void _toProfilePage() {
    Navigator.push(context,
            MaterialPageRoute(builder: (context) => ProfilePage()))
        .then((value) {
      setState(() {});
    });
  }

  void _toGameListPage() {
    tapService.initDefaultVariables();
    print("GameModeIs: " + infoClientService.gameMode);
    Navigator.pushNamed(context, "/game-list"); // best way to change page
  } // context is the information of the widget

  void _toRankedInitPage() {
    print("GameModeIs: " + infoClientService.gameMode);
    Navigator.pushNamed(context, "/ranked-init"); // best way to change page
  } // context is the information of the widget

  void _logout() {
    controller.logout(globals.userLoggedIn);
    Navigator.of(context).pop();
  }
}

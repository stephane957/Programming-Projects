import 'dart:developer';
import 'dart:ui';

import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/ranked.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

import '../services/timer.dart';

class RankedMatchmakingPage extends StatefulWidget {
  const RankedMatchmakingPage({Key? key}) : super(key: key);

  @override
  State<RankedMatchmakingPage> createState() => _RankedMatchmakingPageState();
}

class _RankedMatchmakingPageState extends State<RankedMatchmakingPage> {
  final TimerService timerService = TimerService();
  final SocketService socketService = SocketService();
  final RankedService rankedService = RankedService();
  final InfoClientService infoClientService = InfoClientService();
  bool isShowModal = false;


  @override
  void initState() {
    timerService.clearTimer();
    timerService.clearMatchmakingTimer();
    timerService.startMatchmakingTimer();
    rankedService.addListener(refresh);
    timerService.addListener(refresh);
    initSockets();
    super.initState();
  }

  void refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  void change() {
    if (mounted) {
      this.isShowModal = !this.isShowModal;
    }
  }

  void initSockets() {
    socketService.socket.on("roomChangeAccepted", (data) {
      if (mounted) {
        Navigator.pushNamed(context, "/game");
      }
    });
    socketService.socket.on("closeModalOnRefuse", (data) {
      if (mounted) {
        log('what');
        timerService.clearTimer();
        rankedService.closeModal();
        Navigator.pushNamed(context, "/ranked-init");
      }
    });
  }

  Widget build(BuildContext context) {
    return WillPopScope(
        onWillPop: () async {
          _goBackToRankedInitPage();
          return false;
        },
    child: Scaffold(
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
                const EdgeInsets.symmetric(vertical: 100.0, horizontal: 200.0),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
              child: Container(
                decoration: BoxDecoration(
                    shape: BoxShape.rectangle,
                    color: Theme.of(context).colorScheme.secondary,
                    borderRadius: const BorderRadius.all(Radius.circular(20.0)),
                    border: Border.all(
                        color: Theme.of(context).colorScheme.primary,
                        width: 3)),
                padding: const EdgeInsets.symmetric(
                    vertical: 25.0, horizontal: 250.0),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [

                      Text (
                        "CREATE_GAME_PAGE.MATCHMAKING_IN_PROGRESS".tr(),
                        style: TextStyle(
                            fontSize: 35,
                            color: Theme.of(context).colorScheme.primary),
                      ),
                      Text(
                        translateTimer(timerService.matchmakingDisplayTimer),
                        style: TextStyle(
                            fontSize: 35,
                            color: Theme.of(context).colorScheme.primary),
                      ),
                      CircularProgressIndicator(
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          rankedService.isShowModal == true?
          AlertDialog(
          backgroundColor: Theme.of(context).colorScheme.secondary,
              title:
              Center(child: Text('CREATE_GAME_PAGE.MATCH_FOUND'.tr(), style: TextStyle(color: Theme.of(context).colorScheme.primary), )),
              actions: [
                Center(child:Text(
                  timerService.displayTimer,
                  style: TextStyle(
                      fontSize: 35,
                      color: Theme
                          .of(context)
                          .colorScheme
                          .primary),
                )),
                Center(
                  child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        ElevatedButton(
                          style: ButtonStyle(
                            backgroundColor: MaterialStateColor.resolveWith(
                                    (states) => Theme.of(context).colorScheme.secondary),
                            padding: MaterialStateProperty.all(
                              const EdgeInsets.symmetric(
                                  vertical: 13.0, horizontal: 30.0),
                            ),
                            shape: MaterialStateProperty.all<
                                RoundedRectangleBorder>(
                              RoundedRectangleBorder(
                                borderRadius:
                                BorderRadius.circular(10.0),
                              ),
                            ),
                          ),
                          onPressed: () => acceptMatch(),
                          child: Text(
                            "GAME_PAGE.ACCEPT".tr(),
                            style: TextStyle(
                                fontSize: 20,
                                color: Theme.of(context).colorScheme.primary
                            ),
                          ),
                        ),
                        ElevatedButton(
                          style: ButtonStyle(
                            backgroundColor: MaterialStateColor.resolveWith(
                                    (states) => Theme.of(context).colorScheme.secondary),
                            padding: MaterialStateProperty.all(
                              const EdgeInsets.symmetric(
                                  vertical: 13.0, horizontal: 30.0),
                            ),
                            shape: MaterialStateProperty.all<
                                RoundedRectangleBorder>(
                              RoundedRectangleBorder(
                                borderRadius:
                                BorderRadius.circular(10.0),
                              ),
                            ),
                          ),
                          onPressed: () => refuseMatch(),
                          child: Text(
                            "GAME_PAGE.REFUSE".tr(),
                            style: TextStyle(
                                fontSize: 20,
                                color: Theme.of(context).colorScheme.primary
                            ),
                          ),
                        ),
                      ]
                  ),
                ),
              ]
          )
              :Container(),
          IconButton(
            onPressed: _goBackToRankedInitPage,
            icon: Icon(
              Icons.arrow_back,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ],
      ),

    )
    );
  }

  void _goBackToRankedInitPage() {
    socketService.socket.emit('removePlayerFromGame', infoClientService.playerName);
    Future.delayed(Duration.zero, () {
      Navigator.pop(context);
    });
  }


  acceptMatch() {
    rankedService.matchAccepted = true;
    socketService.socket.emit("acceptMatch",globals.userLoggedIn);
  }
  refuseMatch() {
    timerService.clearTimer();
    timerService.clearMatchmakingTimer();
    socketService.socket.emit("refuseMatch",globals.userLoggedIn);
    Navigator.pushNamed(
        context, "/ranked-init");
  }

  String translateTimer(String matchmakingDisplayTimer) {
    if (context.locale.languageCode == "en") {
      matchmakingDisplayTimer =
          matchmakingDisplayTimer.replaceAll("Temps écoulé", "Time elapsed");
    }
    return matchmakingDisplayTimer;
  }
}

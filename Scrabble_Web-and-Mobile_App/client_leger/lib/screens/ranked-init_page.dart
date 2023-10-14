import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:easy_localization/easy_localization.dart';
import 'dart:developer';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;

class RankedInitPage extends StatefulWidget {
  const RankedInitPage({Key? key}) : super(key: key);

  @override
  State<RankedInitPage> createState() => _RankedInitPageState();
}

class _RankedInitPageState extends State<RankedInitPage> {
  final InfoClientService infoClientService = InfoClientService();
  final SocketService socketService = SocketService();
  double eloDisparity = 60;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        "CREATE_GAME_PAGE.MAX_ELO_DIFF".tr(),
                        style: TextStyle(
                            fontSize: 25,
                            color: Theme.of(context).colorScheme.primary),
                      ),
                      Text(
                        eloDisparity.toString(),
                        style: TextStyle(
                            fontSize: 25,
                            color: Theme.of(context).colorScheme.primary),
                      ),
                      Slider(
                        value: eloDisparity,
                        onChanged: (newEloDisparity) {
                          setState(() => eloDisparity = newEloDisparity);
                        },
                        min: 20.0,
                        max: 100.0,
                        divisions: 16,
                        label: "$eloDisparity",
                      ),
                      ElevatedButton(
                        onPressed: () {
                          onConfirm();
                        },
                        child: Text("CREATE_GAME_PAGE.CONFIRM".tr(), style: TextStyle(
                            fontSize: 25,
                            color: Theme.of(context).colorScheme.secondary),),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void onConfirm() {
    infoClientService.eloDisparity = eloDisparity;
    socketService.socket.emit("startMatchmaking",[eloDisparity, (globals.userLoggedIn).toJson()]);
    _toRankedMatchmakingPage();
  }

  void _toRankedMatchmakingPage() {
    Navigator.pushNamed(
        context, "/ranked-matchmaking"); // best way to change page
  } // context is the information of the widget

}

import 'dart:ui';

import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:client_leger/constants/constants.dart';
import 'package:flip_card/flip_card.dart';

List<bool> activatedPowerCards = [
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
];

class CreateGamePage extends StatefulWidget {
  const CreateGamePage({Key? key}) : super(key: key);

  @override
  State<CreateGamePage> createState() => _CreateGamePageState();
}

class _CreateGamePageState extends State<CreateGamePage> {
  late String? roomName = "";
  late double? turnTime = 1;
  late int dictionaryIndex = 0;
  late bool? _isGamePrivate = false;
  late String? password = "";
  late bool? isPasswordOn = false;
  final _formKey = GlobalKey<FormState>();
  final SocketService socketService = SocketService();
  final InfoClientService infoClientService = InfoClientService();

  @override
  void initState() {
    socketService.socket.on("roomChangeAccepted", (data) {
      if (mounted) {
        FocusScope.of(context).unfocus();
        Navigator.pushNamed(context, "/game");
      }
    });
    socketService.socket.on('messageServer', (message) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(message),
        backgroundColor: Colors.red.shade300,
      ));
    });
    socketService.socket.emit('ReSendDictionariesToClient');
    super.initState();
  }

  void refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) { // html-css of the widget
    return Scaffold( //scaffold is needed
      resizeToAvoidBottomInset: false,
      body: Stack( // permet de mettre plein de children
        children: [
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage("assets/background.jpg"),
                fit: BoxFit.cover,
              ),
            ),
            padding:
                const EdgeInsets.symmetric(vertical: 40.0, horizontal: 200.0),
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
                child: Center(
                  child: Column( // posiiton in the page
                    children: [
                      Row( // position in the page
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          IconButton(
                            onPressed: _goBackGameListPage,
                            icon: Icon(
                              Icons.arrow_back,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                          const SizedBox(
                            width: 315,
                          ),
                          Column(
                            children: [
                              Icon(
                                Icons.person,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                              Text(
                                "${globals.userLoggedIn.username} (${"CREATE_GAME_PAGE.YOU".tr()})",
                                style: TextStyle(
                                    color:
                                        Theme.of(context).colorScheme.primary),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(
                        height: 10.0,
                      ),
                      Expanded(
                        child: SingleChildScrollView(
                          child: Container(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 150),
                            child: Form(
                              key: _formKey,
                              child: Column(
                                children: [
                                  TextFormField(
                                    onSaved: (String? value) {
                                      roomName = value;
                                    },
                                    validator: _roomNameValidator,
                                    decoration: InputDecoration(
                                      border: const OutlineInputBorder(),
                                      labelText:
                                          "CREATE_GAME_PAGE.ROOM_NAME".tr(),
                                      labelStyle: TextStyle(
                                          color: Theme.of(context)
                                              .colorScheme
                                              .primary),
                                    ),
                                    style: TextStyle(
                                        color: Theme.of(context)
                                            .colorScheme
                                            .primary),
                                  ),
                                  const SizedBox(
                                    height: 5,
                                  ),
                                  Row(
                                    children: [
                                      Text(
                                          "CREATE_GAME_PAGE.GAME_MODE".tr(),
                                          style: TextStyle(color: Theme.of(context).colorScheme.primary)
                                      ),
                                      Expanded(
                                        child: ListTile(
                                          title: Text(
                                              "CREATE_GAME_PAGE.PUBLIC".tr(),
                                              style: TextStyle(color: Theme.of(context).colorScheme.primary)
                                          ),
                                          leading: Radio(
                                            value: false,
                                            groupValue: _isGamePrivate,
                                            onChanged: (bool? value) {
                                              setState(() {
                                                _isGamePrivate = value;
                                              });
                                            },
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        child: ListTile(
                                          title: Text(
                                              "CREATE_GAME_PAGE.PRIVATE".tr(),
                                              style: TextStyle(color: Theme.of(context).colorScheme.primary)
                                          ),
                                          leading: Radio(
                                            value: true,
                                            groupValue: _isGamePrivate,
                                            onChanged: (bool? value) {
                                              setState(() {
                                                _isGamePrivate = value;
                                              });
                                            },
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(
                                    height: 5,
                                  ),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Checkbox(
                                          value: isPasswordOn,
                                          activeColor: Theme.of(context).primaryColor,
                                          onChanged: (bool? value) {
                                            setState(() {
                                              isPasswordOn = value;
                                            });
                                          }),
                                      Text(
                                          "CREATE_GAME_PAGE.PASSWORD".tr(),
                                          style: TextStyle(color: Theme.of(context).colorScheme.primary)
                                      ),
                                      const SizedBox(width: 10,),
                                      if (isPasswordOn!)
                                        Expanded(
                                            child: TextFormField(
                                          onSaved: (String? value) {
                                            password = value;
                                          },
                                          validator: _roomNameValidator,
                                          decoration: InputDecoration(
                                            border: const OutlineInputBorder(),
                                            labelText:
                                                "CREATE_GAME_PAGE.PASSWORD"
                                                    .tr(),
                                            labelStyle: TextStyle(
                                                color: Theme.of(context)
                                                    .colorScheme
                                                    .primary),
                                          ),
                                          style: TextStyle(
                                              color: Theme.of(context)
                                                  .colorScheme
                                                  .primary),
                                        ))
                                      else
                                        Container(),
                                    ],
                                  ),
                                  const SizedBox(
                                    height: 10,
                                  ),
                                  DropdownButtonFormField<double>(
                                    value: turnTime,
                                    dropdownColor: Theme.of(context).colorScheme.secondary,
                                    items: [
                                      returnDropMenuItem(0.5, "30sec"),
                                      returnDropMenuItem(1, "1min"),
                                      returnDropMenuItem(1.5, "1min 30sec"),
                                      returnDropMenuItem(2, "2min"),
                                      returnDropMenuItem(2.5, "2min 30sec"),
                                      returnDropMenuItem(3, "3min"),
                                      returnDropMenuItem(3.5, "3min 30sec"),
                                      returnDropMenuItem(4, "4min"),
                                      returnDropMenuItem(4.5, "4min 30sec"),
                                      returnDropMenuItem(5, "5min"),
                                    ],
                                    onChanged: (double? value) {
                                      turnTime = value;
                                    },
                                  ),
                                  const SizedBox(
                                    height: 25,
                                  ),
                                  DropdownButtonFormField<int>(
                                    value: dictionaryIndex,
                                    dropdownColor: Theme.of(context).colorScheme.secondary,
                                    items: List<DropdownMenuItem<int>>.generate(
                                        infoClientService.dictionaries.length,
                                        (int index) => DropdownMenuItem(
                                              value: index,
                                              child: Text(
                                                  infoClientService.dictionaries[index].title,
                                                style: TextStyle(
                                                    color:
                                                    Theme.of(context).colorScheme.primary),)
                                          ,
                                            )),
                                    onChanged: (int? value) {
                                      dictionaryIndex = value!;
                                    },
                                  ),
                                  const SizedBox(
                                    height: 25,
                                  ),
                                  if (infoClientService.dictionaries[dictionaryIndex] != null)
                                    Text(infoClientService.dictionaries[dictionaryIndex].description,
                                        style: TextStyle(
                                            color: Theme.of(context)
                                                .colorScheme
                                                .primary))
                                  else
                                    Container(),
                                  const SizedBox(
                                    height: 25,
                                  ),
                                  if (infoClientService.gameMode ==
                                      POWER_CARDS_MODE) ...[
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text(
                                            "${"CREATE_GAME_PAGE.ACTIVATE".tr()} :",
                                            style: TextStyle(
                                                color: Theme.of(context)
                                                    .colorScheme
                                                    .primary)
                                        ),
                                        PowerListDialog(
                                          notifyParent: refresh,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(
                                      height: 25,
                                    ),
                                  ],
                                  ElevatedButton(
                                    style: ButtonStyle(
                                      padding: MaterialStateProperty.all(
                                        const EdgeInsets.symmetric(
                                            vertical: 18.0, horizontal: 40.0),
                                      ),
                                      shape: MaterialStateProperty.all<
                                          RoundedRectangleBorder>(
                                        RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(10.0),
                                        ),
                                      ),
                                    ),
                                    onPressed: _start,
                                    child: Text(
                                      "CREATE_GAME_PAGE.START".tr(),
                                      style: TextStyle(
                                          fontSize: 20,
                                          color: Theme.of(context)
                                              .colorScheme
                                              .secondary),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  DropdownMenuItem<double> returnDropMenuItem(double value, String text) {
    return DropdownMenuItem<double>(
      value: value,
      child: Text(
          text,
        style: TextStyle(
            color:
            Theme.of(context).colorScheme.primary),
      ),
    );
  }

  String? _roomNameValidator(String? value) {
    final validCharacters = RegExp(r'^[a-zA-Z0-9]+$');
    if (value == null || value.isEmpty) {
      return "CREATE_GAME_PAGE.ENTER_ROOM_NAME".tr();
    } else if (value.length < 4 ||
        value.length > 19 ||
        !validCharacters.hasMatch(value)) {
      return "CREATE_GAME_PAGE.ROOM_NAME_NOT_VALID".tr();
    } else {
      return null;
    }
  }

  void _goBackGameListPage() {
    Navigator.pop(context);
  }

  void _start() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState?.save();
      infoClientService.isGamePrivate = _isGamePrivate;
      socketService.socket.emit(
          "createRoomAndGame",
          CreateGameModel(
              roomName!,
              globals.userLoggedIn.username,
              turnTime!,
              infoClientService.gameMode,
              _isGamePrivate!,
              password!,
              activatedPowerCards));
      socketService.socket.emit("dictionarySelected", infoClientService.dictionaries[dictionaryIndex]);
    }
  }
}

class CreateGameModel {
  late String roomName;
  late String playerName;
  late double timeTurn;
  late String gameMode;
  late List<bool> activatedPowers;
  late bool isGamePrivate = false;
  late String passwd = "";

  Map<String, dynamic> toJson() {
    return {
      'roomName': roomName,
      'playerName': playerName,
      'timeTurn': timeTurn,
      'gameMode': gameMode,
      'isGamePrivate': isGamePrivate,
      'passwd': passwd,
      'activatedPowers': activatedPowers,
    };
  }

  CreateGameModel(this.roomName, this.playerName, this.timeTurn, this.gameMode,
      this.isGamePrivate, this.passwd, this.activatedPowers);
}

class PowerListDialog extends StatefulWidget {
  final Function() notifyParent;

  const PowerListDialog({super.key, required this.notifyParent});

  @override
  State<PowerListDialog> createState() => _PowerListDialog();
}

class _PowerListDialog extends State<PowerListDialog> {
  InfoClientService infoClientService = InfoClientService();
  SocketService socketService = SocketService();

  @override
  Widget build(BuildContext context) {
    infoClientService.game.initPowerCards();
    return TextButton(
      onPressed: () =>
          showDialog<String>(
            context: context,
            builder: (BuildContext context) =>
                AlertDialog(
                  backgroundColor: Theme.of(context).colorScheme.secondary,
                  actions: <Widget>[
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text("CREATE_GAME_PAGE.AVAILABLE_CARD".tr(),
                          style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 17,
                              decoration: TextDecoration.none
                          ),
                        ),
                        Container(
                          margin: const EdgeInsets.fromLTRB(10, 10, 10, 0),
                          height: 450,
                          width: 300,
                          child: ListView.builder(
                            shrinkWrap: true,
                            itemCount: infoClientService.game.powerCards.length,
                            itemBuilder: (BuildContext context, int index) {
                              return Container(
                                child: Row(
                                  children: <Widget>[
                                    FlipCard(
                                      direction: FlipDirection.HORIZONTAL,
                                      front: const SizedBox(
                                        width: 50,
                                        height: 50,
                                        // color: Colors.red,
                                        child: Image(image: AssetImage("assets/card.png")),
                                      ),
                                      back: Container(
                                        decoration: BoxDecoration(
                                          color: Theme.of(context).colorScheme.primary,
                                          borderRadius: const BorderRadius.all(Radius.circular(5)),
                                        ),
                                        width: 200,
                                        height: 50,
                                        margin: const EdgeInsets.fromLTRB(0, 0, 40, 5),
                                        // color: Theme.of(context).colorScheme.primary,
                                        child: Padding(
                                          padding: const EdgeInsets.fromLTRB(5, 5, 5, 5),
                                          child: Text(
                                            infoClientService.game.powerCards[index].name.tr(),
                                            style: TextStyle(
                                              fontSize: 10.0,
                                              color: Theme.of(context).colorScheme.secondary,
                                            ),
                                            textAlign: TextAlign.justify,
                                          ),
                                        ),
                                      ),
                                    ),
                                    StatefulBuilder(
                                      builder: (BuildContext context, StateSetter setState) {
                                        return Checkbox(
                                          value: activatedPowerCards[index],
                                          onChanged: (bool? value) {
                                            setState(() {
                                              activatedPowerCards[index] =
                                              !activatedPowerCards[index];
                                            });
                                          },
                                        );
                                      },
                                    ),
                                  ],
                                ),
                              );
                            }
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10.0),
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          child: TextButton(
                            onPressed: () => Navigator.pop(context, 'Confirmer'),
                            child: Text(
                              "CREATE_GAME_PAGE.CONFIRM".tr(),
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.secondary,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
          ),
      style: ButtonStyle(
        backgroundColor: MaterialStatePropertyAll<Color>(
            Theme.of(context).colorScheme.primary),
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
        "CREATE_GAME_PAGE.POWER_LIST".tr(),
        style: TextStyle(
          color: Theme.of(context).colorScheme.secondary,
        ),
      ),
    );
  }
}

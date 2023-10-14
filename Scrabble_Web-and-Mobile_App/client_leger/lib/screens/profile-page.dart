import 'dart:convert';
import 'dart:io';
import 'dart:ui';

import 'package:client_leger/models/game-saved.dart';
import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/users_controller.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:image_picker/image_picker.dart';
import 'package:client_leger/utils/utils.dart';
import '../main.dart';
import '../services/chat-service.dart';
import '../widget/chat_panel.dart';

import '../env/environment.dart';

class ProfilePage extends StatefulWidget {

  const ProfilePage({
      Key? key,
      }) : super(key: key);

  @override
  State<ProfilePage> createState() => _ProfileStatePage();
}

class _ProfileStatePage extends State<ProfilePage> {
  final Controller controller = Controller();
  final String? serverAddress = Environment().config?.serverURL;
  ChatService chatService = ChatService();
  SocketService socketService = SocketService();
  Controller userController = Controller();
  InfoClientService infoClientService = InfoClientService();

  refresh() async {
    setState(() {});
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
      body: Stack(
      children: <Widget>[
        Container(
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
              child: Container(
                decoration: BoxDecoration(
                    shape: BoxShape.rectangle,
                    color: Theme.of(context).colorScheme.secondary,
                    borderRadius: const BorderRadius.all(Radius.circular(20.0)),
                    border: Border.all(
                        color: Theme.of(context).colorScheme.primary,
                        width: 3)),
                padding: const EdgeInsets.symmetric(
                    vertical: 20.0, horizontal: 30.0),
                child: Center(
                  child: Column(
                    children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            IconButton(
                              onPressed: _goBackHomePage,
                              icon: Icon(
                                Icons.arrow_back,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                            ),
                            CircleAvatar(
                              radius: 48,
                              backgroundImage: MemoryImage(
                                  globals.userLoggedIn.getUriFromAvatar()),
                            ),
                            const ChatPanelOpenButton(),
                          ],
                        ),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                            UsernameChangeDialog(
                                notifyParent: refresh,
                            ),
                            Text(globals.userLoggedIn.username,
                                style: TextStyle(
                                color: Theme.of(context).primaryColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 17,
                                decoration: TextDecoration.none)),
                            AvatarChangeDialog(
                                notifyParent: refresh,
                            ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.only(top: 15, bottom: 30),
                        child: Table(
                          children: [
                            TableRow(
                              children: [
                                returnRowTextElement('PROFILE_PAGE.GAMES_PLAYED'.tr()),
                                returnRowTextElement('PROFILE_PAGE.GAMES_WON'.tr()),
                                returnRowTextElement('PROFILE_PAGE.AVERAGE_SCORE'.tr()),
                                returnRowTextElement('PROFILE_PAGE.AVERAGE_TIME'.tr()),
                              ],
                            ),
                            TableRow(
                              children: [
                                returnRowTextElement(globals
                                    .userLoggedIn.gamesPlayed
                                    .toString()),
                                returnRowTextElement(
                                    globals.userLoggedIn.gamesWon.toString()),
                                returnRowTextElement(globals
                                    .userLoggedIn.averagePointsPerGame!
                                    .toStringAsFixed(2)),
                                returnRowTextElement(Duration(
                                        milliseconds: globals
                                            .userLoggedIn.averageTimePerGame!
                                            .round())
                                    .toString()),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                            returnHistoryScrollView('PROFILE_PAGE.CONNECTION_HISTORY'.tr(),
                                    globals.userLoggedIn.actionHistory!.reversed.toList()),
                            returnHistoryScrollView('PROFILE_PAGE.GAME_HISTORY'.tr(),
                                    globals.userLoggedIn.gameHistory!.reversed.toList()),
                            returnFavouriteGamesScrollView('PROFILE_PAGE.GAME_FAVORITE'.tr()),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          DropdownButton(
                              value: context.locale.languageCode,
                              items: const [
                                DropdownMenuItem(
                                  value: 'fr',
                                    child: Text("Français"),
                                ),
                                DropdownMenuItem(
                                  value: 'en',
                                  child: Text("English"),
                                ),
                              ],
                              dropdownColor: Theme.of(context).colorScheme.secondary,
                              style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary
                              ),
                              onChanged: (String? value){
                                userController.updateLanguage(value!);
                                context.setLocale(Locale(value));
                                socketService.socket.emit("changeLanguage", {globals.userLoggedIn.username, value});
                              },),
                          DropdownButton(
                            value:  globals.userLoggedIn.theme,
                            items: [
                              DropdownMenuItem(
                                value: 'light',
                                child: Text('PROFILE_PAGE.LIGHT'.tr()),
                              ),
                              DropdownMenuItem(
                                value: 'dark',
                                child: Text('PROFILE_PAGE.DARK'.tr()),
                              ),
                            ],
                            dropdownColor: Theme.of(context).colorScheme.secondary,
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.primary
                            ),
                            onChanged: (String? value) async {
                              MyApp.of(context)!.changeTheme(value!);
                              globals.userLoggedIn = await userController.updateTheme(value);
                            },),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            )),
         ],
    ),
    );
  }

  void _goBackHomePage() {
    Navigator.pop(context);
  }

  Text returnRowTextElement(String textData) {
    return Text((textData),
        style: TextStyle(
            color: Theme.of(context).colorScheme.primary,
            fontSize: 13,
            decoration: TextDecoration.none,
            fontWeight: FontWeight.bold));
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
                      fontSize: 13,
                      decoration: TextDecoration.none,
                      fontWeight: FontWeight.bold)),
              Container(
                decoration: BoxDecoration(border: Border.all()),
                height: 320,
                width: 320,
                padding: const EdgeInsets.only(left: 15.0, right: 10.0),
                child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: history.length,
                    itemBuilder: (BuildContext context, int index) {
                      return Text('\u2022 ${translateConnection(history[index])}',
                          style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                              fontSize: 16,
                              decoration: TextDecoration.none,
                              fontWeight: FontWeight.bold));
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

  Column returnFavouriteGamesScrollView(String title) {
    return Column(
        children: [
            SingleChildScrollView(
                child: Column(
                    children: [
                        Text(title,
                            style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontSize: 13,
                            decoration: TextDecoration.none,
                            fontWeight: FontWeight.bold)),
                        Container(
                            decoration: BoxDecoration(border: Border.all()),
                          padding: const EdgeInsets.only(left: 10.0, right: 10.0),
                            height: 320,
                            width: 360,
                            child: ListView.builder(
                                reverse: false,
                                itemCount: infoClientService.favouriteGames.length,
                                itemBuilder: (BuildContext context, int index) {
                                    int itemCount = infoClientService.favouriteGames.length ?? 0;
                                    return Column(
                                        children: [
                                          Text('${'PROFILE_PAGE.ROOM'.tr()}${infoClientService.favouriteGames[itemCount - 1 - index].roomName}',
                                              style: TextStyle (
                                                  color: Theme.of(context).colorScheme.primary,
                                              fontSize: 16,
                                              decoration: TextDecoration.none,
                                              fontWeight: FontWeight.bold)
                                           ),
                                           _isThereSpectators(index),
                                            Column(
                                                children: List.generate(infoClientService.favouriteGames[index].players.length, (idx) {
                                                    return Row(
                                                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                                        children: [
                                                    Text("${'PROFILE_PAGE.PLAYER'.tr()}${infoClientService.favouriteGames[itemCount - 1 - index].players[idx]}",
                                                        style: TextStyle (
                                                        color: Theme.of(context).colorScheme.primary,
                                                        fontSize: 16,
                                                        decoration: TextDecoration.none,
                                                        fontWeight: FontWeight.bold),
                                                        textAlign: TextAlign.center,
                                                    ),
                                                    Text("${'PROFILE_PAGE.SCORE'.tr()}${infoClientService.favouriteGames[itemCount - 1 - index].scores[idx]}",
                                                        style: TextStyle (
                                                        color: Theme.of(context).colorScheme.primary,
                                                        fontSize: 16,
                                                        decoration: TextDecoration.none,
                                                        fontWeight: FontWeight.bold),
                                                        textAlign: TextAlign.center,
                                                    ),
                                                        ],
                                                    );
                                                })
                                            ),
                                          Text('${'PROFILE_PAGE.WINNERS'.tr()}${infoClientService.favouriteGames[itemCount - 1 - index].winners[0]}',
                                              style: TextStyle (
                                                  color: Theme.of(context).colorScheme.primary,
                                                  fontSize: 16,
                                                  decoration: TextDecoration.none,
                                                  fontWeight: FontWeight.bold)
                                          ),
                                          Text('${'PROFILE_PAGE.TILE_LEFT'.tr()}${infoClientService.favouriteGames[itemCount - 1 - index].nbLetterReserve}',
                                              style: TextStyle (
                                                  color: Theme.of(context).colorScheme.primary,
                                                  fontSize: 16,
                                                  decoration: TextDecoration.none,
                                                  fontWeight: FontWeight.bold)
                                          ),
                                          Text('${'PROFILE_PAGE.TURN_PLAYED'.tr()}${infoClientService.favouriteGames[itemCount - 1 - index].numberOfTurns}',
                                              style: TextStyle (
                                                  color: Theme.of(context).colorScheme.primary,
                                                  fontSize: 16,
                                                  decoration: TextDecoration.none,
                                                  fontWeight: FontWeight.bold)
                                          ),
                                          Text('${'PROFILE_PAGE.GAME_TIME'.tr()}${infoClientService.favouriteGames[itemCount - 1 - index].playingTime}',
                                              style: TextStyle (
                                                  color: Theme.of(context).colorScheme.primary,
                                                  fontSize: 16,
                                                  decoration: TextDecoration.none,
                                                  fontWeight: FontWeight.bold)
                                          ),
                                          Text('${'PROFILE_PAGE.GAME_CREATION_DATE'.tr()}${infoClientService.favouriteGames[itemCount - 1 - index].gameStartDate}',
                                              style: TextStyle (
                                                  color: Theme.of(context).colorScheme.primary,
                                                  fontSize: 16,
                                                  decoration: TextDecoration.none,
                                                  fontWeight: FontWeight.bold),
                                              textAlign: TextAlign.center
                                          ),
                                          Text('-------------------------------------------',
                                              style: TextStyle (
                                                  color: Theme.of(context).colorScheme.primary,
                                                  fontSize: 16,
                                                  decoration: TextDecoration.none,
                                                  fontWeight: FontWeight.bold)
                                          ),

                                        ],
                                    );
                                }),
                        ),
                    ],
                ),
            )
        ],
    );
  }
    Column _isThereSpectators(int index) {
        if (infoClientService.favouriteGames[index].spectators.isNotEmpty) {
            return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: List.generate(infoClientService.favouriteGames[index].spectators.length, (idx) {
                            return Column(
                                children: [
                                            Text('PROFILE_PAGE.SPECTATORS'.tr(),
                                              style: TextStyle (
                                              color: Theme.of(context).colorScheme.primary,
                                              fontSize: 16,
                                              decoration: TextDecoration.none,
                                              fontWeight: FontWeight.bold)
                                           ),
                                    Text("${'PROFILE_PAGE.NAME'.tr()}${infoClientService.favouriteGames[index].spectators[idx]}",
                                style: TextStyle (
                                    color: Theme.of(context).colorScheme.primary,
                                    fontSize: 16,
                                    decoration: TextDecoration.none,
                                    fontWeight: FontWeight.bold),
                                    ),
                                ],
                            );
                }),
            );
        }
        return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [ Text('PROFILE_PAGE.NO_SPECTATORS'.tr(), style: TextStyle (color: Theme.of(context).primaryColor, fontSize: 16, decoration: TextDecoration.none, fontWeight: FontWeight.bold))],
        );
    }

}

class UsernameChangeDialog extends StatefulWidget {
  final Function() notifyParent;

  const UsernameChangeDialog({super.key, required this.notifyParent});

  @override
  State<UsernameChangeDialog> createState() => _UsernameChangeDialog();
}

class _UsernameChangeDialog extends State<UsernameChangeDialog> {
  final _formKey = GlobalKey<FormState>();
  late String? newName = "";
  Controller controller = Controller();

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () => showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          title: Text(
            'PROFILE_PAGE.MODIFY_NAME'.tr(),
            style: TextStyle(color: Theme.of(context).colorScheme.primary),),
          content: Text(
              'PROFILE_PAGE.ENTER_NAME'.tr(),
              style: TextStyle(color: Theme.of(context).colorScheme.primary)
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
                      newName = value;
                    },
                    validator: _usernameValidator,
                    decoration: InputDecoration(
                      border: const OutlineInputBorder(),
                      labelText: 'PROFILE_PAGE.NEW_USERNAME'.tr(),
                      labelStyle: TextStyle(
                          color: Theme.of(context).colorScheme.primary),
                    ),
                    style:
                        TextStyle(color: Theme.of(context).colorScheme.primary),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context, 'Cancel'),
                    child: Text('CANCEL'.tr()),
                  ),
                  TextButton(
                    onPressed: _changeName,
                    child: Text('PROFILE_PAGE.SUBMIT'.tr()),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10.0),
          color: Theme.of(context).colorScheme.primary,
        ),
        child: Text('PROFILE_PAGE.MODIFY_NAME'.tr(),
          style: TextStyle(
            color: Theme.of(context).colorScheme.secondary,
          ),
        ),
      ),
    );
  }

  String? _usernameValidator(String? value) {
    if (value == null || value.isEmpty) {
      return 'PROFILE_PAGE.ENTER_USERNAME'.tr();
    } else if (!RegExp(r'^[a-zA-Z0-9]+$').hasMatch(value)) {
      return 'PROFILE_PAGE.ENTER_VALID_USERNAME'.tr();
    } else {
      return null;
    }
  }

  Future<void> _changeName() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState?.save();
      try {
        final oldCookie = globals.userLoggedIn.cookie;
        globals.userLoggedIn = await controller.updateName(newName!);
        globals.userLoggedIn.cookie = oldCookie;
        widget.notifyParent();
        if (!mounted) return;
        Navigator.pop(context, 'Submit');
      } on Exception {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('PROFILE_PAGE.ERROR'.tr()),
          backgroundColor: Colors.red.shade300,
        ));
      }
    }
  }
}

class AvatarChangeDialog extends StatefulWidget {
  final Function() notifyParent;

  const AvatarChangeDialog({super.key, required this.notifyParent});

  @override
  State<AvatarChangeDialog> createState() => _AvatarChangeDialog();
}

class _AvatarChangeDialog extends State<AvatarChangeDialog> {
  late String? newName = "";
  Controller controller = Controller();
  SocketService socketService = SocketService();
  final String? serverAddress = Environment().config?.serverURL;
  late List<dynamic> avatars;

  @override
  initState() {
    super.initState();
    http
        .get(
          Uri.parse("$serverAddress/avatar"),
        )
        .then((res) => parseAvatars(res));
  }

  parseAvatars(http.Response res) {
    var parsed = jsonDecode(res.body);
    avatars = parsed["data"] ?? "Failed";
  }

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () => showDialog<String>(
          context: context,
          builder: (BuildContext context) {
            File? cameraImageFile;
            return StatefulBuilder(builder: (context, setState) {
              return AlertDialog(
                title: Text(
                  'PROFILE_PAGE.MODIFY_AVATAR'.tr(),
                    style: TextStyle(color: Theme.of(context).colorScheme.primary)
                ),
                content:
                    Text(
                        'PROFILE_PAGE.SELECT_AVATAR'.tr(),
                        style: TextStyle(color: Theme.of(context).colorScheme.primary)
                    ),
                backgroundColor: Theme.of(context).colorScheme.secondary,
                actions: <Widget>[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      Container(
                        decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(100),
                            border: Border.all(width: 2, color: Colors.white)),
                        child: IconButton(
                            onPressed: () async {
                              PickedFile? pickedFile =
                                  await ImagePicker().getImage(
                                source: ImageSource.camera,
                                maxWidth: 1800,
                                maxHeight: 1800,
                              );
                              if (pickedFile != null) {
                                setState(() =>
                                    {cameraImageFile = File(pickedFile.path)});
                              }
                            },
                            icon: const Icon(Icons.camera_alt_rounded)),
                      )
                    ],
                  ),
                  Container(
                      child: cameraImageFile == null
                          ? Column(
                              children: [
                                Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      avatarPicker(0),
                                      avatarPicker(2),
                                      avatarPicker(4),
                                      avatarPicker(6),
                                    ]),
                                Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      avatarPicker(1),
                                      avatarPicker(3),
                                      avatarPicker(5),
                                      avatarPicker(7),
                                    ]),
                              ],
                            )
                          : Column(
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(10.0),
                                      child: CircleAvatar(
                                        radius: 100,
                                        backgroundImage:
                                            FileImage(cameraImageFile as File),
                                      ),
                                    )
                                  ],
                                ),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    TextButton(
                                      onPressed: (() => setState(
                                          () => cameraImageFile = null)),
                                      child: Text('CANCEL'.tr()),
                                    ),
                                  ],
                                ),
                                TextButton(
                                  onPressed: (() => _changeAvatarFromCamera(
                                      cameraImageFile as File)),
                                  child: Text('PROFILE_PAGE.SUBMIT'.tr()),
                                ),
                              ],
                            )),
                ],
              );
            });
          }),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10.0),
          color: Theme.of(context).colorScheme.primary,
        ),
        child: Text('PROFILE_PAGE.MODIFY_AVATAR'.tr(),
          style: TextStyle(
            color: Theme.of(context).colorScheme.secondary,
          ),
        ),
      ),
    );
  }

  GestureDetector avatarPicker(int index) {
    return (GestureDetector(
        onTap: () {
          changeAvatar(index + 1);
        },
        child: getAvatarFromString(48, avatars[index]['uri'])));
  }

  Future<void> _changeAvatarFromCamera(File image) async {
    try {
      final oldCookie = globals.userLoggedIn.cookie;
      globals.userLoggedIn = await controller.updateAvatarFromCamera(image, socketService.socket);
      globals.userLoggedIn.cookie = oldCookie;
      widget.notifyParent();
      if (!mounted) return;
      Navigator.pop(context, 'Submit');
    } on Exception {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('PROFILE_PAGE.ERROR'.tr()),
        backgroundColor: Colors.red.shade300,
      ));
    }
  }

  Future<void> changeAvatar(int index) async {
    try {
      final oldCookie = globals.userLoggedIn.cookie;
      globals.userLoggedIn =
          await controller.updateAvatar('avatar${index.toString()}', socketService.socket);
      globals.userLoggedIn.cookie = oldCookie;
      widget.notifyParent();
      if (!mounted) return;
      Navigator.pop(context, 'Submit');
    } on Exception {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('PROFILE_PAGE.ERROR'.tr()),
        backgroundColor: Colors.red.shade300,
      ));
    }
  }
}

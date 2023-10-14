import 'dart:async';

import 'package:client_leger/constants/constants.dart' as constants;
import 'package:client_leger/models/chat.dart';
import 'package:client_leger/models/chatroom.dart';
import 'package:client_leger/models/spectator.dart';
import 'package:client_leger/services/chat-service.dart';
import 'package:client_leger/services/tapService.dart';
import 'package:client_leger/services/timer.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:collection/collection.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/cupertino.dart';
import 'package:just_audio/just_audio.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socket_io_client/socket_io_client.dart';

import '../constants/constants.dart';
import '../env/environment.dart';
import '../models/game-server.dart';
import '../models/game.dart';
import '../models/mock_dict.dart';
import '../models/player.dart';
import '../models/room-data.dart';
import '../models/tile.dart';
import '../models/vec2.dart';
import 'info_client_service.dart';
import 'ranked.dart';
import 'users_controller.dart';

class SocketService with ChangeNotifier {
  static final SocketService _socketService = SocketService._internal();

  RankedService rankedService = RankedService();
  InfoClientService infoClientService = InfoClientService();
  TimerService timerService = TimerService();
  TapService tapService = TapService();
  Controller controller = Controller();
  ChatService chatService = ChatService();
  late String gameId = '';
  int count = 1;

  late IO.Socket socket;

  factory SocketService() {
    return _socketService;
  }

  SocketService._internal() {
    socket = IO.io(
        Environment().config?.serverURL,
        OptionBuilder().setTransports(['websocket']) // for Flutter or Dart VM
            .setExtraHeaders({'foo': 'bar'}) // optional
            .build());
    OptionBuilder().setTransports(['websocket']);

    socketListen();
  }

  socketListen() {
    roomManipulationHandler();
    otherSocketOn();
    gameUpdateHandler();
    timerHandler();
    canvasActionsHandler();
    chatRoomHandler();
  }

  roomManipulationHandler() {
    socket.on('addElementListRoom', (data) {
      RoomData room = RoomData.fromJson(data);
      var exist =
          infoClientService.rooms.where((element) => element.name == room.name);
      if (exist.isEmpty) {
        infoClientService.addRoom(room);
      }
    });

    socket.on('removeElementListRoom', (roomNameToDelete) {
      infoClientService.removeRoom(roomNameToDelete);
    });
  }

  otherSocketOn() {

    socket.on('matchFound', (_) {
      rankedService.matchHasBeenFound();
    });

    socket.on('startGame', (roomName) {
      socket.emit('startGame', roomName);
    });

    socket.on("createRankedGame", (data) async {
      String gameName = data[0];
      String playerName = data[1];
      MockDict mockDict = MockDict("Dictionnaire français par défaut","Ce dictionnaire contient environ trente mille mots français");
      socket.emit("dictionarySelected", mockDict);
      socket.emit("createRoomAndGame", CreateGameModel(
                gameName,
                playerName,
                1,
                constants.MODE_RANKED,
                false,
                '',
      ));
      rankedService.closeModal();
    });

    socket.on("joinRankedRoom", (data){
      String socketId = data[1];
      String gameName = data[0];
      socket.emit("joinRoom",[gameName, socketId]);
      socket.emit("spectWantsToBePlayer",[gameName, socketId]);
    });

    socket.on("closeModalOnRefuse", (_) {
      rankedService.closeModal();
    });

    socket.on("closeModal", (_) {
       rankedService.closeModal();
    });

    socket.on('messageServer', (message) {
      print(message);
    });

    socket.on('SendDictionariesToClient', (dictionaries) {
      infoClientService.updateDictionaries(dictionaries);
    });

    socket.on('ReSendDictionariesToClient', (dictionaries) {
      infoClientService.updateDictionaries(dictionaries);
    });

    socket.on('DictionaryDeletedMessage', (message) {});

    socket.on('SendBeginnerVPNamesToClient', (namesVP) {});

    socket.on('SendExpertVPNamesToClient', (namesVP) {});

    socket.on('isSpectator', (isSpectator) {
      infoClientService.isSpectator = isSpectator;
      infoClientService.notifyListeners();
    });

    socket.on('askForEntrance', (data) {
      infoClientService.askForEntrance(data);
    });

    socket.on('gameOver', (data) {
      infoClientService.game.gameFinished = true;
    });

    socket.on("sendLetterReserve", (letterReserveArr) {
      infoClientService.letterReserve =
          letterReserveArr.map<String>((e) => e.toString()).toList();
    });

    socket.on('soundPlay', (soundName) async {
      if (!infoClientService.soundDisabled) {
        final player = AudioPlayer(); // Create a player
        await player.setUrl(
            "asset:assets/audios/$soundName"); // Schemes: (https: | file: | asset: )
        await player.play();
        await player.stop();
      }
    });
  }

  gameUpdateHandler() {
    socket.on('playerAndStandUpdate', (player) async {
      Function deepEq = const DeepCollectionEquality().equals;
      infoClientService.updatePlayer(player);
      if(!deepEq(infoClientService.player.chatHistory, infoClientService.player.oldChatHistory) && infoClientService.player.chatHistory.last.senderName != infoClientService.player.name) {
        if(chatService.rooms[0].name == 'game') {
          chatService.rooms[0].isUnread = true;
          if(!infoClientService.soundDisabled){
            final player = AudioPlayer(); // Create a player
            await player.setUrl(
                "asset:assets/audios/notification-small.mp3"); // Schemes: (https: | file: | asset: )
            await player.play();
            await player.stop();
          }
        }
      }
      infoClientService.player.oldChatHistory = infoClientService.player.chatHistory;
      infoClientService.notifyListeners();
      chatService.notifyListeners();
    });

    socket.on('gameBoardUpdate', (game) {
      infoClientService.updateGame(game);
      tapService.draggedTile = null;
      tapService.notifyListeners();
      infoClientService.notifyListeners();
      chatService.notifyListeners();
      if (GameServer.fromJson(game).gameFinished && count == 1) {
        infoClientService.notifyListeners();
        count++;
      }
    });

    socket.on('playersSpectatorsUpdate', (data) {
      int idxExistingRoom = infoClientService.rooms
          .indexWhere((element) => element.name == data['roomName']);
      if (idxExistingRoom == -1) {
        return;
      }
      infoClientService.actualRoom = infoClientService.rooms[idxExistingRoom];
      List<Player> updatedPlayers = Player.createPLayersFromArray(data);
      infoClientService.rooms[idxExistingRoom].players = updatedPlayers;
      List<Spectator> updatedSpecs = Spectator.createSpectatorsFromArray(data);
      infoClientService.rooms[idxExistingRoom].spectators = updatedSpecs;

      Player? tmpPlayer = infoClientService.actualRoom.players.firstWhereOrNull(
          (player) => player.name == infoClientService.playerName);
      if (tmpPlayer != null) {
        infoClientService.player = tmpPlayer;
      }

      // TODO
      // do we need this?
      // this.updateUiForSpectator(this.infoClientService.game);
      // // update display turn to show that we are waiting for creator or other players
      if (!infoClientService.game.gameStarted) {
        updateUiBeforeStartGame(updatedPlayers);
      }

      infoClientService.notifyListeners();
      chatService.notifyListeners();
    });

    socket.on('creatorShouldBeAbleToStartGame', (creatorCanStart) {
      infoClientService.creatorShouldBeAbleToStartGame = creatorCanStart;
    });

    socket.on('changeIsTurnOursStatus', (isTurnOurs) {
      infoClientService.isTurnOurs = isTurnOurs;
    });
    socket.on('savedGameId', (id) {
      gameId = id;
    });
  }

  timerHandler() {
    socket.on('displayChangeEndGame', (displayChange) {
      displayChangeEndGameCallBack(displayChange);
    });

    socket.on('startClearTimer', (data) {
      // this.drawingBoardService.lettersDrawn = '';
      num minutesByTurn = data["minutesByTurn"];
      String currentNamePlayerPlaying = data["currentNamePlayerPlaying"];
      infoClientService.powerUsedForTurn = false;
      tapService.resetVariablePlacement();
      if (currentNamePlayerPlaying == infoClientService.playerName) {
        infoClientService.displayTurn = "SOCKET_SERVICE.ITS_YOUR_TURN".tr();
        infoClientService.isTurnOurs = true;
        infoClientService.notifyListeners();
      } else {
        Player playerPlaying = infoClientService.actualRoom.players
            .singleWhere((player) => player.name == currentNamePlayerPlaying);
        infoClientService.displayTurn =
            "${"SOCKET_SERVICE.ITS_THE_TURN".tr()} ${playerPlaying.name} ${"SOCKET_SERVICE.TO_PLAY".tr()}";
        infoClientService.isTurnOurs = false;
      }

      timerService.clearTimer();
      timerService.startTimer(minutesByTurn);
      infoClientService.notifyListeners();
    });

    socket.on('setTimeoutTimerStart', (_) {
      tapService.lettersDrawn = '';
      setTimeoutForTimer();
    });

    socket.on('stopTimer', (_) {
      tapService.lettersDrawn = '';
      timerService.clearTimer();
    });

    socket.on('askTimerStatus', (_) {
      socket.emit('timerStatus', timerService.secondsValue);
    });

    socket.on('addSecsToTimer', (timeToAdd){
      timerService.secondsValue += timeToAdd;
    });
  }

  canvasActionsHandler() {
    socket.on('drawBorderTileForTmpHover', (boardIndexs) {});

    socket.on('tileDraggedOnCanvas', (data) {
      Tile clickedTile = Tile.fromJson(data[0]);
      Vec2 mouseCoords = Vec2.fromJson(data[1]);
      mouseCoords.x = crossProductGlobal(mouseCoords.x.toDouble());
      mouseCoords.y = crossProductGlobal(mouseCoords.y.toDouble());
      tapService.drawTileDraggedOnCanvas(clickedTile, mouseCoords);
    });
  }

  chatRoomHandler() {
    socket.on('setChatRoom', (data) {
      var chatRoom = ChatRoom.fromJson(data);

      //if the room is already present we delete it to set the newer one
      //it should never happened though
      var idxChatRoom = chatService.rooms.indexWhere((element) => element.name == chatRoom.name);
      var refreshRoom = false;
      if(idxChatRoom != DEFAULT_VALUE_NUMBER){
        chatService.rooms.removeWhere((element) => element.name == chatRoom.name);
        refreshRoom = true;
      }

      //if the room received is general it means we are getting all the room
      //and this is the start of the app
      if (chatRoom.name == "general") {
        chatService.rooms.clear();
      }
      chatService.rooms.add(chatRoom);
      if (chatRoom.name == "general") {
        chatService.currentChatRoom = chatService.rooms[0];
      }
      if(refreshRoom){
        chatService.currentChatRoom = chatService.rooms[chatService.rooms.length - 1];
      }
      chatService.chatRoomWanted = null;
      chatService.notifyListeners();
    });
    socket.on('addMsgToChatRoom', (data) async {
      var chatRoomName = data[0];
      var newMsg = data[1];
      var roomElement = chatService.rooms
          .firstWhere((element) => element.name == chatRoomName);
      int indexRoom = chatService.rooms.indexOf(roomElement);
      if (indexRoom != -1) {
        chatService.rooms[indexRoom].chatHistory
            .add(ChatMessage.fromJson(newMsg));
        if (chatService.currentChatRoom.name !=
                chatService.rooms[indexRoom].name ||
            !chatService.isDrawerOpen) {
          chatService.rooms[indexRoom].isUnread = true;
        }
      } else {
        print("error in SocketService:addMsgToChatRoom");
      }
      chatService.notifyListeners();
      if(!infoClientService.soundDisabled){
        final player = AudioPlayer(); // Create a player
        await player.setUrl(
            "asset:assets/audios/notification-small.mp3"); // Schemes: (https: | file: | asset: )
        await player.play();
        await player.stop();
      }
    });

  socket.on('rmChatRoom', (chatRoomName) {
    chatService.rooms.removeWhere((element) => element.name == chatRoomName);
    chatService.currentChatRoom = chatService.rooms[0];
    chatService.notifyListeners();
  });

    socket.on('sendAvatars', (nameAndAvatar) {
      String name = nameAndAvatar[0];
      String avatar = nameAndAvatar[1];
      infoClientService.userAvatars[name] = avatar;
      infoClientService.notifyListeners();
  });
  }

  updateUiBeforeStartGame(List<Player> players) {
    if (infoClientService.actualRoom.numberRealPlayer >= MIN_PERSON_PLAYING) {
      infoClientService.displayTurn = "WAITING_FOR_CREATOR".tr();
    } else {
      infoClientService.displayTurn = "WAITING_OTHER_PLAYER".tr();
    }
  }

  displayChangeEndGameCallBack(String displayChange) {
    infoClientService.displayTurn = "END_GAME".tr();
    infoClientService.notifyListeners();
  }

  setTimeoutForTimer() {
    int oneSecond = 1000;
    Timer.periodic(Duration(milliseconds: oneSecond), (timer) {
      if (timerService.secondsValue <= 0 &&
          infoClientService.game.masterTimer == socket.id) {
        socket.emit('turnFinished');
      }
      if (infoClientService.game.gameFinished) {
        tapService.lettersDrawn = '';
        timer.cancel();
      }
    });
  }
}


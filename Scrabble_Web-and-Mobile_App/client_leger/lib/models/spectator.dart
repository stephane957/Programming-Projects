import 'package:client_leger/models/chat.dart';
import 'package:flutter/cupertino.dart';

class Spectator with ChangeNotifier{
  String socketId = '';
  late String name;
  List<ChatMessage> chatHistory = [];

  Spectator({required this.name});

  Spectator.fromJson(Map parsed) {
    name = parsed["name"];
    socketId = parsed["socketId"];
    var chatH = parsed["chatHistory"];
    for(var chatMsg in chatH){
      chatHistory.add(ChatMessage.fromJson(chatMsg));
    }
    notifyListeners();
  }

  static List<Spectator> createSpectatorsFromArray(Map parsed){
    var mapSpecs = parsed["spectators"];
    List<Spectator> newSpecs = [];
    for(var specElement in mapSpecs){
      Spectator spec = Spectator.fromJson(specElement);
      newSpecs.add(spec);
    }
    return newSpecs;
  }
}

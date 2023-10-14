import 'package:flutter/cupertino.dart';

import 'chat.dart';

class ChatRoom{
  late String name;
  late List<String> participants;
  List<ChatMessage> chatHistory = [];
  late String creator;
  late bool isUnread = false;

  ChatRoom({required this.name, required this.participants, required this.creator});

  ChatRoom.fromJson(Map json){
    name = json['name'];
    participants = json['participants'].map<String>((e)=>e.toString()).toList();
    chatHistory = [];
    //with the general chat the answer could be null
    if(json['creator'] != null){
      creator = json['creator'];
    }else{
      creator = '';
    }
    for(var message in json['chatHistory']){
      chatHistory.add(ChatMessage.fromJson(message));
    }
  }
}

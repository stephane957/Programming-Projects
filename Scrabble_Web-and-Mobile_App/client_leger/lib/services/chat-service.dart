import 'package:flutter/material.dart';

import '../models/chatroom.dart';

class ChatService with ChangeNotifier{
  static final ChatService _chatService = ChatService._internal();

  List<ChatRoom> rooms = [];
  ChatRoom currentChatRoom = ChatRoom(name: "bugIfHere", participants: [], creator:"sys");
  //chatRoom tmp for the search of rooms
  ChatRoom? chatRoomWanted;
  late bool isDrawerOpen = false;


  factory ChatService(){
    return _chatService;
  }

  ChatService._internal() {}

  bool isThereAChatUnread() {
    for(ChatRoom chatRoom in rooms) {
      if(chatRoom.isUnread == true) {
        return true;
      }
    }
    return false;
  }
}

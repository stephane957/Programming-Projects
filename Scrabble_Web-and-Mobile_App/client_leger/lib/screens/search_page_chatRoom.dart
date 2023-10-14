import 'dart:ui';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import '../services/chat-service.dart';
import '../services/socket_service.dart';
import '../models/chatroom.dart';


class SearchPageChatRoom extends StatefulWidget {
  const SearchPageChatRoom({Key? key}) : super(key: key);

  @override
  State<SearchPageChatRoom> createState() => _SearchPageChatRoom();
}

class _SearchPageChatRoom extends State<SearchPageChatRoom> {
  SocketService socketService = SocketService();
  ChatService chatService = ChatService();
  late List<dynamic> roomsFound = [];

  refresh() {
    if (!mounted) {
      return;
    }
    setState(() {});
  }

  _SearchPageChatRoom() {
    socketService.socket.on("getChatRoomsNames", (data) {
      roomsFound = data;
      //removing the rooms where the client is already in them
      for(var room in chatService.rooms){
        roomsFound.removeWhere((element) => element['name'] == room.name);
      }
      chatService.chatRoomWanted = null;
      refresh();
    });

    socketService.socket.on("setTmpChatRoom", (data) {
      print("setTmpChatRoom");
      chatService.chatRoomWanted = ChatRoom.fromJson(data);
      refresh();
    });

    chatService.addListener(refresh);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                                socketService.socket.emit("getChatRoomsNames", (value));
                              },
                              decoration: InputDecoration(
                                border: const OutlineInputBorder(),
                                labelText: "SEARCH_PAGE_CHAT.SEARCH_CHAT".tr(),
                                labelStyle: TextStyle(
                                color:Theme.of(context).colorScheme.primary),
                              ),
                            style: TextStyle(
                                color: Theme.of(context).colorScheme.primary),
                            ),
                            Expanded(
                              child: ListView.builder(
                                shrinkWrap: true,
                                itemCount: roomsFound.length,
                                itemBuilder: (BuildContext context, int index) {
                                  return GestureDetector(
                                    onTap: () async {
                                      socketService.socket.emit("getTmpChatRoom", roomsFound[index]['name']);
                                      FocusScope.of(context).unfocus();
                                      refresh();
                                    },
                                    child: Center(
                                      child: Text(
                                        '${roomsFound[index]['name']}',
                                        style: TextStyle(
                                          color: Theme.of(context).colorScheme.primary,
                                          fontSize: 25,
                                          decoration:TextDecoration.none,
                                        ),
                                      ),
                                    ),
                                  );
                                }
                              ),
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
                        width: 3,
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(
                      vertical: 25.0, horizontal: 25.0),
                  width: 600,
                  child: chatService.chatRoomWanted == null
                    ? const SizedBox(
                        width: 200,
                        height: 600,
                      )
                    : SizedBox(
                      width: 200,
                      height: 100,
                      child: Column(
                        children: [
                          Text(
                            '${"SEARCH_PAGE_CHAT.ROOM_NAME".tr()}${chatService.chatRoomWanted?.name}',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                              fontSize: 25,
                              decoration:TextDecoration.none,
                            ),
                          ),
                          //TODO Add more info ?
                          //like the number of player in the room
                          //who is the creator
                          //who are the participants
                          TextButton(
                            style: TextButton.styleFrom(
                              side: BorderSide(width: 2.0, color: Theme.of(context).colorScheme.primary),
                            ),
                            onPressed: (){
                              roomsFound.removeWhere((element) => element['name'] == chatService.chatRoomWanted?.name);
                              socketService.socket.emit("joinChatRoom", chatService.chatRoomWanted?.name);
                              showDialog(
                                context: context,
                                builder: (_) => AlertDialog(
                                  backgroundColor: Theme.of(context).colorScheme.secondary,
                                  content: Text(
                                    "SEARCH_PAGE_CHAT.YOU_HAVE_JOINED".tr(),
                                      style: TextStyle(
                                        color: Theme.of(context).colorScheme.primary,
                                        fontSize: 20,
                                        decoration:TextDecoration.none,
                                      ),
                                  ),
                                ),
                              );
                            },
                            child: Text("SEARCH_PAGE_CHAT.JOIN_ROOM".tr()),
                          ),
                        ],
                      ),
                    ),
                ),
              ],
            ),
          )),
    );
  }
}

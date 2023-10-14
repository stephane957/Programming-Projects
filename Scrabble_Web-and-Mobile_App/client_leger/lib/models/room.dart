class Room {
  late String roomName;
  late String roomCreator = "";
  int numberRealPlayer = 0;
  int numberVirtualPlayer = 0;
  late int numberSpectators;

  Room(this.roomName);

  Room.fromJson(Map parsed){
    roomName = parsed["roomName"];
    var players = parsed["players"];
    for(var player in players){
      if(player["isCreatorOfGame"]){
        roomCreator = player["name"];
      }
      if(player["id"] == "virtualPlayer"){
        numberVirtualPlayer++;
      }
      else{
        numberRealPlayer++;
      }
    }
    numberSpectators = parsed["spectators"].length;
  }
}

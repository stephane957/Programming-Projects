class ChatMessage{
  late String msg;
  late String senderName;
  late int timestamp;

  ChatMessage({required this.msg, required this.senderName, required this.timestamp});

  Map<String, dynamic> toJson(){
    return {
      'senderName': senderName,
      'msg': msg,
      'timestamp': timestamp,
    };
  }

  ChatMessage.fromJson(Map json){
    senderName = json['senderName'];
    msg = json['msg'];
    timestamp = json['timestamp'];
  }
}

import 'package:client_leger/models/letter.dart';
import 'package:client_leger/models/vec4.dart';

class Tile {
  late Vec4 position;
  late Letter letter;
  late String? bonus;
  late bool old;
  late String backgroundColor;
  late String borderColor;
  late bool isOnBoard;

  Tile() {
    position = Vec4();
    letter = Letter();
    bonus = '';
    old = false;
    backgroundColor = '#F7F7E3';
    borderColor = '#212121';
    isOnBoard = false;
  }

  Tile.fromJson(tile){
    position = Vec4();
    position.x1 = tile["position"]["x1"];
    position.y1 = tile["position"]["y1"];
    position.width = tile["position"]["width"];
    position.height = tile["position"]["height"];
    letter = Letter();
    letter.value = tile["letter"]["value"];
    letter.weight = tile["letter"]["weight"];
    bonus = tile["bonus"];
    old = tile["old"];
    backgroundColor = tile["backgroundColor"];
    borderColor = tile["borderColor"];
    isOnBoard = tile["isOnBoard"];
  }

  Map<String, dynamic> toJson() => {
    'position': position.toJson(),
    'letter': letter.toJson(),
    'bonus': bonus,
    'backgroundColor': backgroundColor,
    'borderColor': borderColor,
    'isOnBoard': isOnBoard,
    'old': old,
  };

}

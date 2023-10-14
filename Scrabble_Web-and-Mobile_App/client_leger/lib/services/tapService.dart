import 'package:flutter/cupertino.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

import '../constants/constants.dart';
import '../models/tile.dart';
import '../models/vec2.dart';
import 'info_client_service.dart';

class TapService with ChangeNotifier{
  static final TapService _clickService = TapService._internal();
  InfoClientService infoClientService = InfoClientService();

  bool isDragging = false;
  late double xPos;
  late double yPos;
  late Tile? draggedTile;
  late String lettersDrawn = '';
  List<Vec2> coordsLettersDrawn = [];
  late num startLettersPlacedPosX;
  late num startLettersPlacedPosY;

  bool tileClickedFromStand = false;

  factory TapService() {
    return _clickService;
  }

  TapService._internal();

  void initDefaultVariables(){
    isDragging = false;
    lettersDrawn = '';
    coordsLettersDrawn = [];
  }

  Tile onTapDownGetStandTile(double posX) {
    tileClickedFromStand = true;
    int finalIndex = getIndexOnStandLogicFromClick(posX);
    return infoClientService.player.stand[finalIndex];
  }

  Tile? onTapDownGetBoardTile(Vec2 vec) {
    tileClickedFromStand = false;
    return getClickedBoardTile(vec);
  }

  int getIndexOnStandLogicFromClick(double posX) {
    double constPosXYForStands =
        PADDING_BET_BOARD_AND_STAND_CORRECTED +
            WIDTH_HEIGHT_BOARD_CORRECTED / 2 -
            WIDTH_STAND_CORRECTED / 2 +
            SIZE_OUTER_BORDER_STAND;
    double posXCleaned = posX - constPosXYForStands;
    return (NUMBER_SLOT_STAND / (WIDTH_STAND_CORRECTED / posXCleaned)).floor() -1;
  }

  Tile? getClickedBoardTile(Vec2 vec ) {
    Vec2 idxCoords = getIndexOnBoardLogicFromClick(vec);
    if (idxCoords.x == DEFAULT_VALUE_NUMBER || idxCoords.y == DEFAULT_VALUE_NUMBER) {
      return null;
    }
    Tile clickedTile = infoClientService.game.board[idxCoords.y as int][idxCoords.x as int];
    // if the tile is old it means that this is not a temporary tile and
    // we don't want to be able to touch it
    if (clickedTile.old) {
      return null;
    } else {
      return clickedTile;
    }
  }

  Vec2 getIndexOnBoardLogicFromClick(Vec2 vec) {
    // we get rid of the border and the padding for the stands
    Vec2 coordsCleaned = Vec2();
    coordsCleaned.x = vec.x - PADDING_BOARD_FOR_STANDS_CORRECTED - PADDING_BET_BOARD_AND_STAND_CORRECTED;
    coordsCleaned.y = vec.y - PADDING_BOARD_FOR_STANDS_CORRECTED - PADDING_BET_BOARD_AND_STAND_CORRECTED;

    // veryfiying that we are on the board not elsewhere
    if (coordsCleaned.x < 0 || coordsCleaned.y < 0) {
      return Vec2.withParams(DEFAULT_VALUE_NUMBER, DEFAULT_VALUE_NUMBER);
    }

    Vec2 coordsIndexOnBoard = Vec2();
    coordsIndexOnBoard.x = (((1 / (WIDTH_BOARD_NOBORDER_CORRECTED / coordsCleaned.x)) * NUMBER_SQUARE_H_AND_W)).floor();
    coordsIndexOnBoard.y = (((1 / (WIDTH_BOARD_NOBORDER_CORRECTED / coordsCleaned.y)) * NUMBER_SQUARE_H_AND_W)).floor();

    if (
        coordsIndexOnBoard.x > NUMBER_SQUARE_H_AND_W ||
            coordsIndexOnBoard.y > NUMBER_SQUARE_H_AND_W ||
            coordsIndexOnBoard.x <= 0 ||
            coordsIndexOnBoard.y <= 0
    ) {
      return Vec2.withParams(DEFAULT_VALUE_NUMBER, DEFAULT_VALUE_NUMBER);
    }
    return coordsIndexOnBoard;
  }

  void drawTileDraggedOnCanvas(Tile clickedTile, Vec2 mouseCoords) {
    isDragging = true;
    draggedTile = clickedTile;
    xPos = (mouseCoords.x - WIDTH_EACH_SQUARE_CORRECTED/2);
    yPos = (mouseCoords.y - WIDTH_EACH_SQUARE_CORRECTED /2);
    notifyListeners();
  }

  void onStandToBoardDrop(Vec2 coordsTapped, Tile tileDropped, IO.Socket socket, String letterChoice) {
    Vec2 posDropBoardIdxs = getIndexOnBoardLogicFromClick(coordsTapped);

    if (infoClientService.game.board[posDropBoardIdxs.y as int][posDropBoardIdxs.x as int].letter.value != '') {
      return;
    }

    if (lettersDrawn == '') {
      startLettersPlacedPosX = posDropBoardIdxs.x;
      startLettersPlacedPosY = posDropBoardIdxs.y;
    }


    // remove the tile from the stand logically and visually
    socket.emit('rmTileFromStand', tileDropped);

    if(letterChoice != '') {
      lettersDrawn += letterChoice.toLowerCase();
      socket.emit('addTempLetterBoard', [letterChoice.toLowerCase(), posDropBoardIdxs.x, posDropBoardIdxs.y]);
    } else {
      lettersDrawn += tileDropped.letter.value;
      socket.emit('addTempLetterBoard', [tileDropped.letter.value, posDropBoardIdxs.x, posDropBoardIdxs.y]);
    }
    coordsLettersDrawn.add(posDropBoardIdxs);

    // ask for update board logic for a temporary tile
    socket.emit('clearTmpTileCanvas');

  }

  void onBoardToBoardDrop(Vec2 coordsTapped, Tile tileDropped, Vec2 initialTap, IO.Socket socket) {
    // indexs of the tile where the "tileDropped" has been dropped
    Vec2 posDropBoardIdxs = getIndexOnBoardLogicFromClick(coordsTapped);
    // if the tile on which we drop the new one is an old one (from a precedent turn)
    // we do nothing
    if (infoClientService.game.board[posDropBoardIdxs.y as int][posDropBoardIdxs.x as int].letter.value != '') {
      return;
    }

    // indexs of the "tileDropped" variable on the board
    Vec2 posClickedTileIdxs = getIndexOnBoardLogicFromClick(initialTap);

    // changes the coords in the drawingBoardService.coordsLettersDrawn array to set the new position
    changeCoordsLettersDrawn(posClickedTileIdxs, posDropBoardIdxs);

    // if there is only one letter on the board we want to reassign the start position
    if (lettersDrawn.length == 1) {
      startLettersPlacedPosX = posDropBoardIdxs.x;
      startLettersPlacedPosY = posDropBoardIdxs.y;
    }

    // if the tile on which we drop the new one is the same tile we do nothing
    if (posClickedTileIdxs.x == posDropBoardIdxs.x && posClickedTileIdxs.y == posDropBoardIdxs.y) {
      return;
    }

    // ask for update board logic for a move of temporary tile
    socket.emit('onBoardToBoardDrop', [posClickedTileIdxs.toJson(), posDropBoardIdxs.toJson()]);
    socket.emit('clearTmpTileCanvas');
  }

  // function that changes the coords drawingBoardService.coordsLettersDrawn array to set the new position
  void changeCoordsLettersDrawn(Vec2 oldPosIdxs, Vec2 newPosIdx) {
    for (var coord in coordsLettersDrawn) {
      if (coord.x == oldPosIdxs.x && coord.y == oldPosIdxs.y) {
        coord.x = newPosIdx.x;
        coord.y = newPosIdx.y;
        return;
      }
    }
  }

  void onBoardToStandDrop(Vec2 coordsTapped, Tile tileDropped, Vec2 originalClickTileIndexs, IO.Socket socket) {
    // if the letter taken from the board isn't one taken from the stand
    // we do nothing
    if (!lettersDrawn.contains(tileDropped.letter.value)) {
      return;
    }

    // gets the index of the letterDrawn array to remove
    num idxToRm = checkIdxToRm(originalClickTileIndexs);
    // remove the letter from the lettersDrawn array
    if(lettersDrawn.length > 1) {
      lettersDrawn = lettersDrawn.substring(0, idxToRm as int) + lettersDrawn.substring(idxToRm + 1, lettersDrawn.length);
    } else {
      lettersDrawn = '';
    }
    coordsLettersDrawn.removeRange(idxToRm.toInt(), idxToRm.toInt() + 1);
    int standIdx = getIndexOnStandLogicFromClick(coordsTapped.x as double);
    socket.emit('clearTmpTileCanvas');
    socket.emit('onBoardToStandDrop', [originalClickTileIndexs, tileDropped.letter.value, standIdx]);
  }

  void onTapStand(Vec2 coordsTapped, IO.Socket socket) {
    if (!infoClientService.game.gameStarted) {
      return;
    }
    num coordinateXClick = coordsTapped.x;
    if (lettersDrawn != '') {
    return;
    }
    socket.emit('rightClickExchange', coordinateXClick);
  }

  int checkIdxToRm(Vec2 originalClickTileIndexs) {
    num xDiff = originalClickTileIndexs.x - startLettersPlacedPosX;
    num yDiff = originalClickTileIndexs.y - startLettersPlacedPosY;
    return xDiff > yDiff ? xDiff.toInt() : yDiff.toInt();
  }

  void play(IO.Socket socket) {
    if (lettersDrawn == '') {
      return;
    }

    placeDrawnLettersInGoodOrder();
    // reconstruct the word if it is using a letter
    // already on the board
    lettersDrawn = constructWord();
    String placeMsg = createPlaceMessage();

    // eslint-disable-next-line no-console
    print('FinalWord: $placeMsg');
    // clear the tmporary canvas to get rid of all unecessary drawings
    // for example the arrow
    socket.emit('clearTmpTileCanvas');
    socket.emit('newMessageClient', placeMsg);
    resetVariablePlacement();
    return;
  }

  void placeDrawnLettersInGoodOrder() {
    // deep copies
    String lettersDrawnCpy = lettersDrawn;
    List<Vec2> coordsLettersDrawnCpy = coordsLettersDrawn;

    lettersDrawn = '';
    coordsLettersDrawn = [];

    if (isWordVertical(coordsLettersDrawnCpy)) {
      for (int i = 0; i < lettersDrawnCpy.length; i++) {
        int minIndex = 0;
        for (int j = 0; j < lettersDrawnCpy.length; j++) {
          if (coordsLettersDrawnCpy[j].y < coordsLettersDrawnCpy[minIndex].y) {
            minIndex = j;
          }
        }
        lettersDrawn += lettersDrawnCpy[minIndex];
        coordsLettersDrawn.add(coordsLettersDrawnCpy[minIndex]);

        coordsLettersDrawnCpy.removeRange(minIndex, minIndex+1);
        lettersDrawnCpy = lettersDrawnCpy.substring(0, minIndex) + lettersDrawnCpy.substring(minIndex + 1, lettersDrawnCpy.length);
        i--;
      }
    } else {
      for (int i = 0; i < lettersDrawnCpy.length; i++) {
        int minIndex = 0;
        for (int j = 0; j < lettersDrawnCpy.length; j++) {
          if (coordsLettersDrawnCpy[j].x < coordsLettersDrawnCpy[minIndex].x) {
            minIndex = j;
          }
        }
        lettersDrawn += lettersDrawnCpy[minIndex];
        coordsLettersDrawn.add(coordsLettersDrawnCpy[minIndex]);

        coordsLettersDrawnCpy.removeRange(minIndex, minIndex+1);
        lettersDrawnCpy = lettersDrawnCpy.substring(0, minIndex) + lettersDrawnCpy.substring(minIndex + 1, lettersDrawnCpy.length);
        i--;
      }
    }
    startLettersPlacedPosX = coordsLettersDrawn[0].x;
    startLettersPlacedPosY = coordsLettersDrawn[0].y;
  }

  String constructWord() {
    String finalWord = lettersDrawn[0];
    num lastXPos = coordsLettersDrawn[0].x;
    num lastYPos = coordsLettersDrawn[0].y;

    for (int i = 1; i < coordsLettersDrawn.length; i++) {
      if (isWordVertical(coordsLettersDrawn)) {
        if (coordsLettersDrawn[i].y == lastYPos + 1) {
          finalWord += lettersDrawn[i];
          lastYPos = coordsLettersDrawn[i].y;
        } else {
          // in some cases the word is not continuous on the board so we check for index and leave
          // if the index is superior to the length of the board
          if (lastYPos + 1 > NUMBER_SQUARE_H_AND_W) {
            return finalWord;
          }

          // had some problem where the tile would be undefined. Didn't find why since it never happend again in a lot of game
          // but putting this check as a precaution
          if (infoClientService.game.board[(lastYPos as int) + 1][coordsLettersDrawn[i].x as int] != null) {
            finalWord += infoClientService.game.board[lastYPos + 1][coordsLettersDrawn[i].x as int].letter.value;
          }
          lastYPos = lastYPos + 1;
          // we want to check the same index as the one we tried since it was a tile from the board
          i--;
        }
      } else {
        if (coordsLettersDrawn[i].x == lastXPos + 1) {
          finalWord += lettersDrawn[i];
          lastXPos = coordsLettersDrawn[i].x;
        } else {
          // in some cases the word is not continuous on the board so we check for index and leave
          // if the index is superior to the length of the board
          if (lastXPos + 1 > NUMBER_SQUARE_H_AND_W) {
            return finalWord;
          }

          // had some problem where the tile would be undefined. Didn't find why since it never happend again in a lot of game
          // but putting this check as a precaution
          if (infoClientService.game.board[coordsLettersDrawn[i].y as int][(lastXPos as int) + 1] != null) {
            finalWord += infoClientService.game.board[coordsLettersDrawn[i].y as int][lastXPos + 1].letter.value;
          }
          lastXPos = lastXPos + 1;
          // we want to check the same index as the one we tried since it was a tile from the board
          i--;
        }
      }
    }

    return finalWord;
  }

  String createPlaceMessage() {
    num posStartWordX = startLettersPlacedPosX;
    num posStartWordY  = startLettersPlacedPosY;
    posStartWordY += ASCII_CODE_SHIFT;
    String placerCmd = '!placer ${String.fromCharCode(posStartWordY.toInt())}$posStartWordX';

    if (isWordVertical(coordsLettersDrawn)) {
      placerCmd += 'v $lettersDrawn';
    } else {
      placerCmd += 'h $lettersDrawn';
    }

    return placerCmd;
  }

  void resetVariablePlacement() {
    lettersDrawn = '';
    coordsLettersDrawn = [];
  }

  bool isWordVertical(List<Vec2> letterCoords) {
    if (letterCoords.length == 1) {
      if (
      infoClientService.game.board[letterCoords[0].y as int][letterCoords[0].x - 1 as int].letter.value != '' ||
      infoClientService.game.board[letterCoords[0].y as int][letterCoords[0].x + 1 as int].letter.value != ''
      ) {
        return false;
      } else if (
      infoClientService.game.board[letterCoords[0].y - 1 as int][letterCoords[0].x as int].letter.value != '' ||
      infoClientService.game.board[letterCoords[0].y + 1 as int][letterCoords[0].x as int].letter.value != ''
      ) {
        return true;
      } else {
        // eslint-disable-next-line no-console
        print('Error1 in PlaceGraphic::isWordVertical');
      }
    } else if (letterCoords.length > 1) {
      if (letterCoords[0].x == letterCoords[1].x) {
        return true;
      } else {
        return false;
      }
    } else {
      // eslint-disable-next-line no-console
      print('Error2 in PlaceGraphic::isWordVertical');
    }
    return false;
  }




}

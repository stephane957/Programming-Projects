import 'dart:core';
import 'dart:math';

import 'package:client_leger/services/tapService.dart';
import 'package:client_leger/utils/utils.dart';
import 'package:flutter/material.dart';

import '../constants/constants.dart';
import '../models/tile.dart';
import 'info_client_service.dart';

class BoardPainter extends CustomPainter {
  InfoClientService infoClientService = InfoClientService();
  TapService tapService = TapService();
  List<List<Tile>> board = [[]];
  List<List<Tile>> standsSpec = [];
  List<Tile> standPlayer = [];
  double tilePadding = 2;
  late double tileSize;
  final int textTileColor = 0xFF104D45;
  final int textSideColor = 0xFF54534A;
  final int borderColor = 0xFFAAA38E;
  final int tileBorderColor = 0xFF157DEC;

  BoardPainter(){
    board = infoClientService.game.board;
    standsSpec = infoClientService.actualRoom.players.map((player) => player.stand).toList();
    standPlayer = infoClientService.player.stand;
  }


  @override
  void paint(Canvas canvas, Size size) {
    board = infoClientService.game.board;
    standsSpec = infoClientService.actualRoom.players.map((player) => player.stand).toList();
    standPlayer = infoClientService.player.stand;
    tileSize = crossProduct(WIDTH_EACH_SQUARE, size.height);
    tilePadding = crossProduct(WIDTH_LINE_BLOCKS, size.height);
    drawStands(canvas, size);
    drawBoard(canvas, size);
    if(tapService.draggedTile != null) {
      drawTile(tapService.xPos, tapService.yPos, tapService.draggedTile!, canvas, size);
    }
  }

  //draw the board (border/text/tiles)
  void drawBoard(Canvas canvas, Size canvasSize){
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = createMaterialColor(Color(borderColor));
    canvas.drawRect(
      Rect.fromLTWH(
          crossProduct(PADDING_BOARD_FOR_STANDS, canvasSize.height),
          crossProduct(PADDING_BOARD_FOR_STANDS, canvasSize.height),
          crossProduct(WIDTH_HEIGHT_BOARD, canvasSize.height), crossProduct(WIDTH_HEIGHT_BOARD, canvasSize.height)),
      paint,
    );
    drawBoardTiles(canvas, canvasSize);
    drawBoardBorderLetters(canvas, canvasSize);
  }

  //draws the tiles on the board
  void drawBoardTiles(Canvas canvas, Size canvasSize) {
    final paint = Paint()
      ..style = PaintingStyle.fill;
    double startXY =
      crossProduct(PADDING_BOARD_FOR_STANDS, canvasSize.height)
      - (tileSize + tilePadding) //gets rid of the start at index 1 instead of putting (i-1) everywhere in the code
      + crossProduct(SIZE_OUTER_BORDER_BOARD, canvasSize.height); //adds border
    for(var i = 1; i < board.length - 1; i++){
      for(var j = 1; j < board.length - 1; j++){
        if(board[i][j].letter.value != ''){
          drawTile(
              startXY + j * (tileSize + tilePadding),
              startXY + i * (tileSize + tilePadding),
              board[i][j], canvas, canvasSize);
        }else{
          if(i == 8 && j == 8){
            paint.color = createMaterialColor(Color(colorTilesMap["wordx2"]!));
            canvas.drawRect(
              Rect.fromLTWH(
                startXY + j * (tileSize + tilePadding),
                startXY + i * (tileSize + tilePadding),
                tileSize,
                tileSize,
            ),
            paint,
          );
          drawStar(canvas, Offset(startXY + j * (tileSize + tilePadding), startXY + i * (tileSize+ tilePadding)));
        } else {
          paint.color = createMaterialColor(Color(colorTilesMap[infoClientService.game.bonusBoard[i][j]]!));
          canvas.drawRect(
            Rect.fromLTWH(
                startXY + j * (tileSize + tilePadding),
                startXY + i * (tileSize + tilePadding),
                tileSize,
                tileSize,
              ),
              paint,
            );
            drawBonusText(
                canvas,
                translateBonus(board[i][j].bonus!),
                Offset(startXY + j * (tileSize + tilePadding), startXY + i * (tileSize + tilePadding)));
          }
        }
      }
    }
  }

  void drawBoardBorderLetters(Canvas canvas, Size canvasSize){
    double startXY =
      crossProduct(PADDING_BOARD_FOR_STANDS, canvasSize.height);
    const magicToCenterLetter = 4;
    for(var i = 1; i < board.length - 1; i++) {
      drawSideText(
        canvas, i.toString(),
        Offset(
            startXY + i * (tileSize + tilePadding) - magicToCenterLetter,
            startXY,
        ),
      );
      drawSideText(
        canvas, indexToLetter[i]!,
        Offset(
          startXY,
          startXY + i * (tileSize + tilePadding) - magicToCenterLetter,
        ),
      );
    }
  }

  void drawTileText(Canvas canvas, Tile tileToDraw, Offset tilePos){
    final letterValueStyle = TextStyle(
      color: createMaterialColor(colorConvert(tileToDraw.borderColor)),
      fontSize: 13,
      fontWeight: FontWeight.bold,
    );
    final letterWeightStyle = TextStyle(
      color: createMaterialColor(colorConvert(tileToDraw.borderColor)),
      fontSize: 7,
      fontWeight: FontWeight.normal,
    );
    final letterValueSpan = TextSpan(
      text: tileToDraw.letter.value.toUpperCase(),
      style: letterValueStyle,
    );
    final letterWeightSpan = TextSpan(
      text: tileToDraw.letter.weight.toString(),
      style: letterWeightStyle,
    );
    final valuePainter = TextPainter(
      textAlign: TextAlign.center,
      text: letterValueSpan,
      textDirection: TextDirection.ltr,
    );
    final weightPainter = TextPainter(
      textAlign: TextAlign.center,
      text: letterWeightSpan,
      textDirection: TextDirection.ltr,
    );
    valuePainter.layout(
      minWidth: 0,
      maxWidth: tileSize - tilePadding * 2,
    );
    weightPainter.layout(
      minWidth: 0,
      maxWidth: tileSize - tilePadding * 2,
    );
    valuePainter.paint(canvas, Offset(tilePos.dx + ((tileSize - valuePainter.width) * 0.43),
        tilePos.dy + (((tileSize+tilePadding) - valuePainter.height) * 0.45)));
    weightPainter.paint(canvas, Offset(tilePos.dx + ((tileSize - valuePainter.width) * 0.9),
        tilePos.dy + (((tileSize+tilePadding) - valuePainter.height) * 0.9)));
  }

  void drawBonusText(Canvas canvas, String tileType, Offset tilePos){
    final textStyle = TextStyle(
      color: createMaterialColor(Color(textTileColor)),
      fontSize: 7,
      fontWeight: FontWeight.bold,
    );
    final textSpan = TextSpan(
      text: tileType,
      style: textStyle,
    );
    final textPainter = TextPainter(
      textAlign: TextAlign.center,
      text: textSpan,
      textDirection: TextDirection.ltr,
    );
    textPainter.layout(
      minWidth: 0,
      maxWidth: tileSize - tilePadding * 2,
    );
    textPainter.paint(canvas, Offset(tilePos.dx + ((tileSize - textPainter.width) * 0.5),
        tilePos.dy + (((tileSize+tilePadding) - textPainter.height) * 0.5)));
  }

  void drawSideText(Canvas canvas, String text, Offset tilePos){
    final textStyle = TextStyle(
      color: createMaterialColor(Color(textSideColor)),
      fontSize: 20,
      fontWeight: FontWeight.bold,
    );
    final textSpan = TextSpan(
      text: text,
      style: textStyle,
    );
    final textPainter = TextPainter(
      textAlign: TextAlign.center,
      text: textSpan,
      textDirection: TextDirection.ltr,
    );
    textPainter.layout(
      minWidth: 0,
      maxWidth: tileSize - tilePadding * 2,
    );
    textPainter.paint(canvas, Offset(tilePos.dx + ((tileSize - textPainter.width - 4) * 0.5),
        tilePos.dy + ((tileSize - textPainter.height) * 0.5)));
  }

  void drawStands(Canvas canvas, Size canvasSize){
    double constPosXYForStands =
        crossProduct(PADDING_BOARD_FOR_STANDS, canvasSize.height)
        + crossProduct(WIDTH_HEIGHT_BOARD, canvasSize.height) / 2
        - crossProduct(WIDTH_STAND, canvasSize.height) / 2;
    double paddingForRightAndBottomStands =
        crossProduct(PADDING_BOARD_FOR_STANDS, canvasSize.height)
        + crossProduct(WIDTH_HEIGHT_BOARD, canvasSize.height)
        + crossProduct(PADDING_BET_BOARD_AND_STAND, canvasSize.height);

    if(infoClientService.isSpectator) {
      num idxPlayerPlaying = infoClientService.game.idxPlayerPlaying;
      //when game is not started idxPlayerPlaying is -1
      if(idxPlayerPlaying < 0){
        idxPlayerPlaying = 0;
      }
      //bottom Stand
      drawHorizStand(
          constPosXYForStands, paddingForRightAndBottomStands,
          canvas, canvasSize, standsSpec[idxPlayerPlaying.toInt()]);
      // we go to the next player
      idxPlayerPlaying = (idxPlayerPlaying + 1) % standsSpec.length;

      //left stand
      drawVertiStand(0, constPosXYForStands, canvas, canvasSize, standsSpec[idxPlayerPlaying.toInt()]);
      // we go to the next player
      idxPlayerPlaying = (idxPlayerPlaying + 1) % standsSpec.length;

      //top stand
      drawHorizStand(constPosXYForStands, 0, canvas, canvasSize, standsSpec[idxPlayerPlaying.toInt()]);
      // we go to the next player
      idxPlayerPlaying = (idxPlayerPlaying + 1) % standsSpec.length;

      //right stand
      drawVertiStand(
          paddingForRightAndBottomStands, constPosXYForStands,
          canvas, canvasSize, standsSpec[idxPlayerPlaying.toInt()]);
    }else{//means it's the player playing not the spectator
      //bottom Stand
      drawHorizStand(
          constPosXYForStands, paddingForRightAndBottomStands,
          canvas, canvasSize, standPlayer);
    }
  }

  void drawTile(double xPos, double yPos, Tile tileToDraw, Canvas canvas, Size canvasSize){
    final paint = Paint()
      ..style = PaintingStyle.fill;

    // Fill the rectangle with an initial color
    paint.color = colorConvert(tileToDraw.backgroundColor);
    canvas.drawRect(
      Rect.fromLTWH(
        xPos, yPos,
        tileSize,
        tileSize,
      ),
      paint,
    );
    drawTileText(canvas, tileToDraw, Offset(xPos, yPos));
    roundRect(xPos, yPos, tileSize, tileSize, tileToDraw.borderColor, canvas);
  }

  Color colorConvert(String color) {
    color = color.replaceAll("#", "");
    if (color.length == 6) {
      return Color(int.parse("0xFF" + color));
    } else if (color.length == 8) {
      return Color(int.parse("0x" + color));
    }
    return const Color(0x00000000);
  }

  void drawHorizStand(double startX, double startY, Canvas canvas, Size canvasSize, List<Tile> stand){
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = Color(borderColor);

    canvas.drawRect(
      Rect.fromLTWH(
        startX, startY,
        crossProduct(WIDTH_STAND, canvasSize.height),
        crossProduct(HEIGHT_STAND, canvasSize.height),
      ),
      paint,
    );
    for(int i = 0; i < stand.length; i++){
      paint.color = createMaterialColor(Color(colorTilesMap["xx"]!));
      double xPos = startX + i * (tileSize + tilePadding) + crossProduct(SIZE_OUTER_BORDER_STAND, canvasSize.height);
      double yPos = startY + crossProduct(SIZE_OUTER_BORDER_STAND, canvasSize.height);
      if(stand[i].letter.value == ''){
        canvas.drawRect(
          Rect.fromLTWH(xPos, xPos, tileSize, tileSize),
          paint,
        );
      }else{
        drawTile(xPos, yPos, stand[i], canvas, canvasSize);
      }
    }
  }

  void drawVertiStand(double startX, double startY, Canvas canvas, Size canvasSize, List<Tile> stand){
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = Color(borderColor);

    canvas.drawRect(
      Rect.fromLTWH(
        startX, startY,
        crossProduct(HEIGHT_STAND, canvasSize.height),
        crossProduct(WIDTH_STAND, canvasSize.height),
      ),
      paint,
    );

    for(int i = 0; i < stand.length; i++){
      paint.color = createMaterialColor(Color(colorTilesMap["xx"]!));
      double xPos = startX + crossProduct(SIZE_OUTER_BORDER_STAND, canvasSize.height);
      double yPos = startY + i * (tileSize + tilePadding) + crossProduct(SIZE_OUTER_BORDER_STAND, canvasSize.height);
      if(stand[i].letter.value == '') {
        canvas.drawRect(
          Rect.fromLTWH(xPos, yPos, tileSize, tileSize),
          paint,
        );
      }else{
        drawTile(xPos, yPos, stand[i], canvas, canvasSize);
      }
    }
  }

  double crossProduct(double valueToConvert, double canvasSize){
    const originalSizeCanvas = WIDTH_HEIGHT_BOARD + 2 * PADDING_BOARD_FOR_STANDS;
    return (valueToConvert * canvasSize)/originalSizeCanvas;
  }

  void roundRect(double x1, double y1, double width, double height, String borderColor,Canvas canvas) {
    final paint = Paint()
      ..color = colorConvert(borderColor)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(x1, y1, width, height), const Radius.circular(7.0)), paint);
  }

  void drawStar(Canvas canvas, Offset tilePos){
    final double longDistance = (tileSize / 2) - 1;
    final double smallDistance = longDistance / 2;
    const int numberOfPeak = 6;
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = createMaterialColor(const Color(0xFFAAA38E));
    final center = Offset(tilePos.dx + tileSize/2, tilePos.dy + tileSize/2);
    final Path star = Path();
    double angle = (2 * pi)/(numberOfPeak*2);
    star.moveTo(center.dx + longDistance, center.dy);
    for(int i = 1; i < (numberOfPeak * 2); i++){
      double distance = smallDistance;
      if(i % 2 == 0) {
        distance = longDistance;
      }
      star.lineTo(cos(angle*i) * distance + center.dx, sin(angle*i) * distance + center.dy);
    }
    star.close();
    canvas.drawPath(star, paint);
  }

  @override
  bool shouldRepaint(BoardPainter oldDelegate) => true;
}

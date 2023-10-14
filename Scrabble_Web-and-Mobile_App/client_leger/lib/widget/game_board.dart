import 'package:client_leger/models/vec2.dart';
import 'package:client_leger/services/tapService.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

import '../constants/constants.dart';
import '../models/tile.dart';
import '../services/board_painter.dart';
import '../services/info_client_service.dart';
import '../services/socket_service.dart';

class GameBoard extends StatefulWidget {
  const GameBoard({Key? key}) : super(key: key);

  @override
  State<GameBoard> createState() => _GameBoardState();
}

class _GameBoardState extends State<GameBoard> {
  InfoClientService infoClientService = InfoClientService();
  TapService tapService = TapService();
  BoardPainter boardPainter = BoardPainter();
  final SocketService socketService = SocketService();

  bool touching = false;
  late Tile? clickedTile = Tile();
  late Vec2 clickedTileIndex;
  late Tile? draggedTile;
  late Vec2 lastPosition = Vec2();
  late Vec2 coordsClick = Vec2();
  String letterChoice = '';

  @override
  void initState() {
    super.initState();

    infoClientService.addListener(refresh);
    infoClientService.player.addListener(refresh);
    tapService.addListener(refresh);
  }

  void refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        LayoutBuilder(
          builder: (_, constraints) => Container(
              width: constraints.maxWidth < constraints.maxHeight
                  ? constraints.maxWidth
                  : constraints.maxHeight,
              height: constraints.maxWidth < constraints.maxHeight
                  ? constraints.maxWidth
                  : constraints.maxHeight,
              child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: GestureDetector(
                    onTapUp: (details) {
                      if (!infoClientService.isTurnOurs) {
                        return;
                      }
                      if (!infoClientService.game.gameStarted) {
                        return;
                      }
                      if (tapService.lettersDrawn != '') {
                        return;
                      }
                      socketService.socket.emit(
                          'rightClickExchange',
                          crossProductGlobalToLargeCanvas(
                              details.localPosition.dx));
                    },
                    onPanStart: (details) {
                      if (!infoClientService.isTurnOurs) {
                        return;
                      }
                      touching = true;
                      coordsClick = Vec2.withParams(
                          details.localPosition.dx, details.localPosition.dy);
                      if (areCoordsOnStand(coordsClick)) {
                        clickedTile = tapService
                            .onTapDownGetStandTile(details.localPosition.dx);
                      } else if (areCoordsOnBoard(coordsClick)) {
                        clickedTile = tapService.onTapDownGetBoardTile(
                            Vec2.withParams(details.localPosition.dx,
                                details.localPosition.dy));
                        clickedTileIndex = tapService
                            .getIndexOnBoardLogicFromClick(coordsClick);
                      }
                    },
                    onPanUpdate: (details) {
                      if (!touching ||
                          (clickedTile == null) ||
                          clickedTile?.letter.value == '' ||
                          !infoClientService.isTurnOurs) {
                        return;
                      }
                      Vec2 coords = Vec2.withParams(
                          crossProductGlobalToLargeCanvas(
                              details.localPosition.dx),
                          crossProductGlobalToLargeCanvas(
                              details.localPosition.dy));
                      lastPosition = Vec2.withParams(
                          details.localPosition.dx, details.localPosition.dy);
                      socketService.socket.emit('tileDraggedOnCanvas',
                          [clickedTile!.toJson(), coords.toJson()]);
                    },
                    onPanEnd: (details) {
                      touching = false;
                      Vec2 coordsTapped = lastPosition;

                      if (areCoordsOnBoard(coordsTapped) &&
                          infoClientService.isTurnOurs) {
                        if (clickedTile != null &&
                            clickedTile?.letter.value != '') {
                          if (tapService.tileClickedFromStand) {
                            if (clickedTile?.letter.value == '*') {
                              starChoiceDialog(context, coordsTapped);
                              return;
                            }
                            tapService.onStandToBoardDrop(coordsTapped,
                                clickedTile!, socketService.socket, letterChoice);
                          } else {
                            tapService.onBoardToBoardDrop(
                                coordsTapped,
                                clickedTile!,
                                coordsClick,
                                socketService.socket);
                          }
                        }
                      } else if (areCoordsOnStand(coordsTapped)) {
                        if (clickedTile != null &&
                            clickedTile?.letter.value != '' &&
                            !tapService.tileClickedFromStand &&
                            infoClientService.isTurnOurs) {
                          tapService.onBoardToStandDrop(
                              coordsTapped,
                              clickedTile!,
                              clickedTileIndex,
                              socketService.socket);
                        } else {
                          tapService.onTapStand(
                              coordsTapped, socketService.socket);
                        }
                      }
                      clickedTile = null;
                      clickedTileIndex = Vec2();
                    },
                    child: CustomPaint(
                      painter: boardPainter,
                    ),
                  ))),
        ),
        /*ElevatedButton(
          style: ButtonStyle(
            padding: MaterialStateProperty.all(
              const EdgeInsets.symmetric(vertical: 18.0, horizontal: 40.0),
            ),
            shape: MaterialStateProperty.all<RoundedRectangleBorder>(
              RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10.0),
              ),
            ),
          ),
          onPressed: _changeBoard,
          child: Text(
            "Change",
            style: TextStyle(
                fontSize: 20, color: Theme.of(context).colorScheme.primary),
          ),
        ),*/
      ],
    );
  }

  bool areCoordsOnStand(Vec2 coords) {
    num paddingForStands =
        HEIGHT_STAND_CORRECTED + PADDING_BET_BOARD_AND_STAND_CORRECTED;
    num posXForStands = paddingForStands +
        SIZE_OUTER_BORDER_STAND_CORECTED +
        WIDTH_HEIGHT_BOARD_CORRECTED / 2 -
        WIDTH_STAND_CORRECTED / 2;
    num posYForStands = WIDTH_HEIGHT_BOARD_CORRECTED +
        paddingForStands +
        SIZE_OUTER_BORDER_STAND_CORECTED +
        PADDING_BET_BOARD_AND_STAND_CORRECTED;
    if (coords.x > posXForStands &&
        coords.x <
            posXForStands +
                WIDTH_STAND_CORRECTED -
                SIZE_OUTER_BORDER_STAND_CORECTED * 2 &&
        coords.y > posYForStands &&
        coords.y <
            posYForStands +
                HEIGHT_STAND_CORRECTED -
                SIZE_OUTER_BORDER_STAND_CORECTED * 2) {
      return true;
    } else {
      return false;
    }
  }

  bool areCoordsOnBoard(Vec2 coords) {
    num posXYStartForBoard =
        PADDING_BOARD_FOR_STANDS_CORRECTED + SIZE_OUTER_BORDER_BOARD_CORRECTED;
    num posXYEndForBoard = posXYStartForBoard +
        WIDTH_HEIGHT_BOARD_CORRECTED -
        2 * SIZE_OUTER_BORDER_BOARD_CORRECTED;
    if (coords.x > posXYStartForBoard &&
        coords.x < posXYEndForBoard &&
        coords.y > posXYStartForBoard &&
        coords.y < posXYEndForBoard) {
      return true;
    } else {
      return false;
    }
  }

  Future<void> starChoiceDialog(BuildContext context, Vec2 coordsTapped) {
    return showDialog<void>(
      barrierDismissible: false,
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Theme.of(context).colorScheme.secondary,
          actions: <Widget>[
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                    child: Column(children: [
                      Text(
                        "CLICK_ON_LETTER".tr(),
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 17,
                            decoration: TextDecoration.none),
                      ),
                      Container(
                          margin: const EdgeInsets.fromLTRB(0, 20, 0, 0),
                          height: 150,
                          width: 450,
                          child: GridView.count(
                            crossAxisCount: 10,
                            shrinkWrap: true,
                            children: List.generate(
                              26,
                              (index) {
                                String letter = String.fromCharCode(index + 65);
                                return Container(
                                  margin:
                                      const EdgeInsets.fromLTRB(0, 0, 10, 10),
                                  child: TextButton(
                                    onPressed: () {
                                      letterChoice = letter;
                                      tapService.onStandToBoardDrop(coordsTapped,
                                          clickedTile!, socketService.socket, letterChoice);
                                      letterChoice = '';
                                      Navigator.pop(context);
                                    },
                                    child: Text(
                                      letter,
                                      style: const TextStyle(
                                        fontSize: 17,
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ))
                    ]))
              ],
            )
          ],
        );
      },
    );
  }
}

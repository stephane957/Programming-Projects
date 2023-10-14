import 'package:client_leger/services/board_painter.dart';

const Map<String, int> colorTilesMap = {
  "xx": 0xFFBEB9a6,
  "wordx3": 0xFFF75D59,
  "wordx2": 0xFFFBBBB9,
  "letterx3": 0xFF157DEC,
  "letterx2": 0xFFA0CFEC,
};

const Map<String, String> textTilesMap = {
  "xx": "",
  "wordx3": "MOT\nx3",
  "wordx2": "MOT\nx2",
  "letterx3": "LETTRE\nx3",
  "letterx2": "LETTRE\nx2",
};

const Map<int, String> indexToLetter = {
  1 : "A",
  2 : "B",
  3 : "C",
  4 : "D",
  5 : "E",
  6 : "F",
  7 : "G",
  8 : "H",
  9 : "I",
  10 : "J",
  11 : "K",
  12 : "L",
  13 : "M",
  14 : "N",
  15 : "O",
};

const num DEFAULT_VALUE_NUMBER = -1;

const double WIDTH_HEIGHT_BOARD = 750;
const double WIDTH_PLAY_AREA = 900;
const double PADDING_BET_BOARD_AND_STAND = 5;
const double SIZE_OUTER_BORDER_BOARD = 40;
const double NB_SQUARE_H_AND_W = 15;
const double WIDTH_LINE_BLOCKS = 4;
const double WIDTH_BOARD_NOBORDER = WIDTH_HEIGHT_BOARD - SIZE_OUTER_BORDER_BOARD * 2;
const double WIDTH_EACH_SQUARE =
    (WIDTH_HEIGHT_BOARD - SIZE_OUTER_BORDER_BOARD * 2 - (NB_SQUARE_H_AND_W - 1) * WIDTH_LINE_BLOCKS) / NB_SQUARE_H_AND_W;

const double NUMBER_SLOT_STAND = 7;
const double SIZE_OUTER_BORDER_STAND = 6;
const double WIDTH_STAND = WIDTH_EACH_SQUARE * NUMBER_SLOT_STAND + WIDTH_LINE_BLOCKS * (NUMBER_SLOT_STAND - 1) + SIZE_OUTER_BORDER_STAND * 2;
const double HEIGHT_STAND = WIDTH_EACH_SQUARE + SIZE_OUTER_BORDER_STAND * 2;
const double PADDING_BOARD_FOR_STANDS = HEIGHT_STAND + PADDING_BET_BOARD_AND_STAND;

// CLIENT_LEGER_CONSTANTS
double CANVAS_SIZE = 692;
double WIDTH_HEIGHT_BOARD_CORRECTED = crossProductGlobal(WIDTH_HEIGHT_BOARD);
double WIDTH_PLAY_AREA_CORRECTED = crossProductGlobal(WIDTH_PLAY_AREA);
double PADDING_BET_BOARD_AND_STAND_CORRECTED = crossProductGlobal(PADDING_BET_BOARD_AND_STAND);
double SIZE_OUTER_BORDER_BOARD_CORRECTED = crossProductGlobal(SIZE_OUTER_BORDER_BOARD);
double NB_SQUARE_H_AND_W_CORRECTED = crossProductGlobal(NB_SQUARE_H_AND_W);
double WIDTH_LINE_BLOCKS_CORRECTED = crossProductGlobal(WIDTH_LINE_BLOCKS);
double WIDTH_BOARD_NOBORDER_CORRECTED = crossProductGlobal(WIDTH_BOARD_NOBORDER);
double WIDTH_EACH_SQUARE_CORRECTED = crossProductGlobal(WIDTH_EACH_SQUARE);
double WIDTH_STAND_CORRECTED = crossProductGlobal(WIDTH_STAND);
double HEIGHT_STAND_CORRECTED = crossProductGlobal(HEIGHT_STAND);
double PADDING_BOARD_FOR_STANDS_CORRECTED = crossProductGlobal(PADDING_BOARD_FOR_STANDS);
double SIZE_OUTER_BORDER_STAND_CORECTED = crossProductGlobal(SIZE_OUTER_BORDER_STAND);


double crossProductGlobal(double valueToConvert){
  const originalSizeCanvas = WIDTH_HEIGHT_BOARD + 2 * PADDING_BOARD_FOR_STANDS;
  return (valueToConvert * CANVAS_SIZE)/originalSizeCanvas;
}

double crossProductGlobalToLargeCanvas(double valueToConvert){
  const originalSizeCanvas = WIDTH_HEIGHT_BOARD + 2 * PADDING_BOARD_FOR_STANDS;
  return (valueToConvert * originalSizeCanvas)/CANVAS_SIZE;
}

const num NUMBER_SQUARE_H_AND_W = 15;

const num MIN_PERSON_PLAYING = 2;
const String WAITING_FOR_CREATOR = 'En attente du créateur pour demarrer la partie...';
const String WAIT_FOR_OTHER_PLAYERS = "En attente d'autres joueurs...";

// POWER CARDS CONSTANTS
const JUMP_NEXT_ENNEMY_TURN = 'Cette carte permet de faire sauter le tour du prochain joueur.';
const TRANFORM_EMPTY_TILE = 'Cette carte permet de transformer une tuile vide en case bonus de couleur aléatoire.';
const REDUCE_ENNEMY_TIME = 'Cette carte permet de réduire de moitié le temps de réflexion des prochains joueurs pendant 1 tour.';
const EXCHANGE_LETTER_JOKER = "Cette carte permet d'échanger une lettre de votre chevalet contre une lettre de votre choix du sac de lettres.";
const EXCHANGE_STAND = "Cette carte permet d'échanger votre chevalet avec celui d'un de vos adversaires.";
const REMOVE_POINTS_FROM_MAX =
    "Cette carte permet de retirer des points à l'adversaire qui en a le plus et les redistribue à tous les autres joueurs.";
const ADD_1_MIN = "Cette carte permet d'ajouter 1 minute à votre temps de reglexion.";
const REMOVE_1_POWER_CARD_FOR_EVERYONE = 'Cette carte permet de retirer une carte pouvoir à tous les joueurs ennemis.';

// GAME MODE CONSTANTS
const POWER_CARDS_MODE = 'power-cards';
const CLASSIC_MODE = 'classic';
const MODE_RANKED = 'Ranked';

///////////////////////////////////////////////////////////////////////////
// CONSTANTS FOR ISOLATION OF POSITION
///////////////////////////////////////////////////////////////////////////
const ASCII_CODE_SHIFT = 96;
const POSITION_LAST_LETTER = -1;
const END_POSITION_INDEX_LINE = 1;

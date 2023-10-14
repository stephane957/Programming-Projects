/// ////////////////////////////////////////////////////////////////////////

// Changing the size of the board will automatically change the size of the chevalet
export const DEFAULT_WIDTH_BOARD = 750;
export const DEFAULT_HEIGHT_BOARD = 750;

export const DEFAULT_WIDTH_PLAY_AREA = 900;

export const PADDING_BET_BOARD_AND_STAND = 5;
export const SIZE_OUTER_BORDER_BOARD = 40;

export const NUMBER_SQUARE_H_AND_W = 15;
export const WIDTH_LINE_BLOCKS = 4;
export const WIDTH_BOARD_NOBORDER = DEFAULT_WIDTH_BOARD - SIZE_OUTER_BORDER_BOARD * 2;
export const WIDTH_EACH_SQUARE =
    (DEFAULT_HEIGHT_BOARD - SIZE_OUTER_BORDER_BOARD * 2 - (NUMBER_SQUARE_H_AND_W - 1) * WIDTH_LINE_BLOCKS) / NUMBER_SQUARE_H_AND_W;

export const NUMBER_SLOT_STAND = 7;
export const SIZE_OUTER_BORDER_STAND = 6;
export const DEFAULT_WIDTH_STAND = WIDTH_EACH_SQUARE * NUMBER_SLOT_STAND + WIDTH_LINE_BLOCKS * (NUMBER_SLOT_STAND - 1) + SIZE_OUTER_BORDER_STAND * 2;
export const DEFAULT_HEIGHT_STAND = WIDTH_EACH_SQUARE + SIZE_OUTER_BORDER_STAND * 2;

export const PADDING_BOARD_FOR_STANDS = DEFAULT_HEIGHT_STAND + PADDING_BET_BOARD_AND_STAND;
/// ////////////////////////////////////////////////////////////////////////
// CHAT VALIDATION CONSTANTS
/// ////////////////////////////////////////////////////////////////////////
export const INPUT_MAX_LENGTH = 512;

/// ////////////////////////////////////////////////////////////////////////
// SOCKET SERVICE CONSTANTS
/// ////////////////////////////////////////////////////////////////////////
// this constants is used because the client take some time to init the canvas
export const WAIT_FOR_CANVAS_INI = 10;

/// ////////////////////////////////////////////////////////////////////////
// VARIABLE ui
/// ////////////////////////////////////////////////////////////////////////
// TODO switch this to 4 when 4 game players will be enabled
export const MIN_PERSON_PLAYING = 2;
export const MAX_PERSON_PLAYING = 4;
export const WAITING_FOR_CREATOR = 'En attente du créateur pour démarrer la partie...';
export const WAIT_FOR_OTHER_PLAYERS = "En attente d'autres joueurs...";

/// ////////////////////////////////////////////////////////////////////////
// INFO PANNEL CONSTANTS
/// ////////////////////////////////////////////////////////////////////////
export const DEFAULT_NB_LETTER_STAND = 7;
export const DEFAULT_NB_LETTER_BANK = 88;

/// ////////////////////////////////////////////////////////////////////////
// CONSTANTS FOR ISOLATION OF POSITION
/// ////////////////////////////////////////////////////////////////////////
export const ASCII_CODE_SHIFT = 96;
export const POSITION_LAST_LETTER = -1;
export const END_POSITION_INDEX_LINE = 1;

/// ////////////////////////////////////////////////////////////////////////
// CONSTANTS FOR MOUSE EVENT SERVICE
/// ////////////////////////////////////////////////////////////////////////
export const DEFAULT_VALUE_NUMBER = -1;
export const TIME_PER_ROUND_DEFAULT = 1000;

export const LEFT_CLICK = 0;
export const RIGHT_CLICK = 2;

// GAME MODE CONSTANTS
export const MODE_RANKED = 'Ranked';
export const POWER_CARDS_MODE = 'power-cards';
export const CLASSIC_MODE = 'classic';

// POWER CARDS CONSTANTS
export const JUMP_NEXT_ENNEMY_TURN = 'Cette carte permet de faire sauter le tour du prochain joueur.';
export const TRANFORM_EMPTY_TILE = 'Cette carte permet de transformer une tuile vide en case bonus de couleur aléatoire.';
export const REDUCE_ENNEMY_TIME = 'Cette carte permet de réduire de moitié le temps de réflexion des prochains joueurs pendant 1 tour.';
export const EXCHANGE_LETTER_JOKER = "Cette carte permet d'échanger une lettre de votre chevalet contre une lettre de votre choix du sac de lettres.";
export const EXCHANGE_STAND = "Cette carte permet d'échanger votre chevalet avec celui d'un de vos adversaires.";
export const REMOVE_POINTS_FROM_MAX =
    "Cette carte permet de retirer des points à l'adversaire qui en a le plus et les redistribue à tous les autres joueurs.";
export const ADD_1_MIN = "Cette carte permet d'ajouter 1 minute à votre temps de reglexion.";
export const REMOVE_1_POWER_CARD_FOR_EVERYONE = 'Cette carte permet de retirer une carte pouvoir à tous les joueurs ennemis.';

export const SYSTEM_SENDER = 'SYSTEM';
// SOUND FILE CONSTANTS
export const LETTER_PLACED_SOUND = 'letter-placement-small.mp3';
export const LETTER_REMOVED_SOUND = 'letter-removal-small.mp3';
export const WORD_VALID_SOUND = 'word-valid-small.mp3';
export const WORD_INVALID_SOUND = 'word-invalid-small.mp3';
export const GAME_LOST_SOUND = 'game-lost-small.mp3';
export const GAME_WON_SOUND = 'game-won-small.mp3';

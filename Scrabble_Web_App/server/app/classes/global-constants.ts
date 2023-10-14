/// ////////////////////////////////////////////////////////////////////////
// BOARD AND STAND CONSTANTS
/// ////////////////////////////////////////////////////////////////////////

// Changing the size of the board will automatically change the size of the chevalet
export const DEFAULT_WIDTH_BOARD = 750;
export const DEFAULT_HEIGHT_BOARD = 750;
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

/// ////////////////////////////////////////////////////////////////////////
// CHAT VALIDATION CONSTANTS
/// ////////////////////////////////////////////////////////////////////////
export const INPUT_MAX_LENGTH = 512;

/// ////////////////////////////////////////////////////////////////////////
// INFO PANNEL CONSTANTS
/// ////////////////////////////////////////////////////////////////////////
export const DEFAULT_NB_LETTER_STAND = 7;
export const DEFAULT_NB_LETTER_BANK = 88;

/// ////////////////////////////////////////////////////////////////////////
// VARIABLE FOR ISOLATION OF POSITION
/// ////////////////////////////////////////////////////////////////////////
export const ASCII_CODE_SHIFT = 96;
export const POSITION_LAST_LETTER = -1;
export const END_POSITION_INDEX_LINE = 1;

/// ////////////////////////////////////////////////////////////////////////
// VARIABLE ALL SERVICES
/// ////////////////////////////////////////////////////////////////////////
export const DEFAULT_VALUE_NUMBER = -1;

/// ////////////////////////////////////////////////////////////////////////
// VARIABLE socketManager
/// ////////////////////////////////////////////////////////////////////////
export const MAX_PERSON_IN_ROOM = 2;

export const TIME_PER_ROUND_DEFAULT = 1000;

/// ////////////////////////////////////////////////////////////////////////
// chat service constante
/// ////////////////////////////////////////////////////////////////////////
export const CMD_HELP_TEXT = 'Liste des commandes disponible: !aide: affiche la liste des commandes';
export const CMD_HELP_TEXT_PASS = ' !passer: Vous permet de passer votre tour ';
export const CMD_HELP_TEXT_PLACE = '!placer: place une ou plusieurs lettres selon la syntaxe suivante:!placer <ligne><colonne>(h|v) <mot>';
export const CMD_HELP_TEXT_EXCHANGE = '!échanger: échange des lettres du chevalet selon la syntaxe suivant:!échanger <lettre>...';
export const CMD_HELP_TEXT_DEBUG = '!debug: affiche des options et informations de debugage';
export const CMD_HELP_TEXT_RESERVE = '!reserve: affiche toutes les lettres et leur quantite restante dans la reserve';
export const INVALID_SYNTAX = 'Erreur de syntaxe';
export const INVALID_ENTRY = 'Commande invalide';
export const RESERVE_CMD = 'Voici les lettres dans la reserve:';
export const PLACE_CMD = 'Vous avez placé vos lettres';
export const EXCHANGE_PLAYER_CMD = 'Vous avez échangé vos lettres';
export const EXCHANGE_OPPONENT_CMD = "L'adversaire a échangé ses lettres";
export const PASS_CMD = 'Vous avez passé votre tour';
export const DEBUG_CMD_ON = 'affichages de débogage activés';
export const DEBUG_CMD_OFF = 'affichages de débogage désactivés';
export const DEBUG_NOT_ACTIVATED = "Commande impossible. Debug n'est pas activé";
export const END_OF_GAME = 'Fin de partie - lettres restantes: ';
export const NOT_YOUR_TURN = "Ce n'est pas votre tour de jouer !";
export const NOT_ENOUGH_LETTERS = 'Il ne reste plus assez de lettres dans la réserve';
export const GAME_IS_OVER = 'La partie est terminée vous ne pouvez plus rentrer de commandes';
export const FINAL_SCORE_RP = 'Votre score final est: ';
export const FINAL_SCORE_VP = 'Le score final de votre adversaire est: ';
export const WINNER_MSG_PT1 = 'Bravo ';
export const WINNER_MSG_PT2 = ' a gagne la partie avec un score de: ';
export const GAME_WON = 'Vous avez gagné la partie !';
export const DRAW_MSG = 'La partie a fini a égalité, bravo !';
export const LETTER_LIST = ' - ListeDeLettres: ';
export const POINTS_DEDUCTED = ' point(s) qui ont été déduit de votre score: ';
export const INVALID_LENGTH = ' La taille maximale de 512 caractère a ete depassée';
export const UNABLE_TO_PROCESS_COMMAND = 'Commande impossible ';
export const NO_MOVE_FOUND = "Aucune solution n'a été trouvée pour la plage de points indiquée.";
export const WAIT_FOR_SECOND_PLAYER = "En attente d'un second joueur...";
export const WORD_DOESNT_EXIST = "Le mot n'existe pas.";
export const END_GAME_DISPLAY_MSG = 'La partie est terminée.';
export const INVALID_ARGUMENTS_PLACER = ": la commande !placer n'as pas d'arguments ou bien des arguments de position invalides";
export const INVALID_ARGUMENTS_EXCHANGE = " : La commande n'a pas d'arguments ou trop d'arguments!";
export const LETTER_NOT_IN_ALPHABET = " : la lettre a échanger n'est pas dans l'alphabet!";
export const LETTER_NOT_ON_STAND = " : la lettre a échanger n'est pas sur ton chevalet !";
export const INVALID_WORD = ' : caractères du mot incorrects!';
export const WORD_DONT_FIT_BOARD = ': le mot ne rentre pas dans le plateau!';
export const LETTERS_NOT_PRESENT = ': les lettres du mot doivent être présentes sur le board et/ou le chevalet!';
export const LETTERS_MUST_TOUCH_OTHERS = ' : les lettres que vous avez placées doivent toucher celles déjà sur le plateau!';
export const FIRST_LETTER_NOT_IN_H8 = ' : votre premier mot doit commencer dans la case h8!';
export const LETTERS_FROM_BOARD_WRONG = ' : lettres du plateau de jeu mal utilisées!';
export const REPLACEMENT_BY_BOT = 'Un bot a maintenant remplacé votre adversaire.';
export const NB_MIN_LETTER_BANK = 6;

/// ///////////////////////////////////////////////////////////////////////////
// /////////////// databaseService constants//////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////
export const DATABASE_URL = 'mongodb+srv://Stephane:HarryP0tter7@project-database.m7fal.mongodb.net/?retryWrites=true&w=majority';
export const DATABASE_NAME = 'Project-Database';
export const DATABASE_COLLECTION_DICTIONARIES = 'Dictionaries';
export const DATABASE_COLLECTION_BESTSCORECLASSIC = 'BestScoreClassic';
export const DATABASE_COLLECTION_BESTSCORELOG2990 = 'BestScoreLOG2990';
export const DATABASE_COLLECTION_BEGINNER_NAMESVP = 'BeginnerVPNames';
export const DATABASE_COLLECTION_EXPERT_NAMESVP = 'ExpertVPNames';
export const GAME_NOT_STARTED = "La partie n'a pas commencée !";

/// //OBJECTIVE CONSTANTS///////
export const FAILED_OBJECTIVE = 'failed';
export const COMPLETED_OBJECTIVE = 'completed';
export const UNCOMPLETED_OBJECTIVE = 'uncompleted';

/// //GAME MODE CONSTANTS
export const MODE_SOLO = 'Solo';
export const MODE_MULTI = 'Multi';

// END GAME SERVICE CONSTANTS
export const PLAYER_WIN = 'playerWin';
export const OPPONENT_WIN = 'opponentWin';
export const NOBODY_WIN = 'nobodyWin';

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

/// //OBJECTIVE CONSTANTS///////
export const FAILED_OBJECTIVE = 'failed';
export const COMPLETED_OBJECTIVE = 'completed';
export const UNCOMPLETED_OBJECTIVE = 'uncompleted';

/// //GAME MODE CONSTANTS
export const MODE_SOLO = 'Solo';
export const MODE_MULTI = 'Multi';

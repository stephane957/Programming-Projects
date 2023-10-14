/**
 * @method isEmpty
 * @param value
 * @returns true & false
 * @description this value is Empty Check
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isEmpty = (value: string | number | object): boolean => {
    if (value === null) {
        return true;
    } else if (typeof value !== 'number' && value === '') {
        return true;
    } else if (typeof value === 'undefined' || value === undefined) {
        return true;
    } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
        return true;
    } else {
        return false;
    }
};

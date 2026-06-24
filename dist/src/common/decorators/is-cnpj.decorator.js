"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsCNPJ = IsCNPJ;
const class_validator_1 = require("class-validator");
const CNPJ_PATTERN = /^([A-Z0-9]{12}\d{2}|[A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3}\/[A-Z0-9]{4}-\d{2})$/;
const FIRST_DIGIT_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const SECOND_DIGIT_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
function isCNPJ(value) {
    if (!CNPJ_PATTERN.test(value))
        return false;
    const charsCode = value
        .replace(/[.\-/]/g, '')
        .split('')
        .map((char) => char.charCodeAt(0) - 48);
    const hasAllCharsEqual = charsCode.every((d) => d === charsCode[0]);
    if (hasAllCharsEqual)
        return false;
    const firstDigitSum = FIRST_DIGIT_WEIGHTS.reduce((acc, m, i) => acc + charsCode[i] * m, 0);
    const firstDigit = firstDigitSum % 11 < 2 ? 0 : 11 - (firstDigitSum % 11);
    const secondDigitSum = SECOND_DIGIT_WEIGHTS.reduce((acc, m, i) => acc + charsCode[i] * m, 0);
    const secondDigit = secondDigitSum % 11 < 2 ? 0 : 11 - (secondDigitSum % 11);
    return charsCode[12] === firstDigit && charsCode[13] === secondDigit;
}
function IsCNPJ(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isCNPJ',
            target: object.constructor,
            propertyName,
            options: {
                message: '$property must be a valid CNPJ',
                ...validationOptions,
            },
            validator: {
                validate(value) {
                    return isCNPJ(String(value));
                },
            },
        });
    };
}
//# sourceMappingURL=is-cnpj.decorator.js.map
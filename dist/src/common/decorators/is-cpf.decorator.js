"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsCPF = IsCPF;
const class_validator_1 = require("class-validator");
const CPF_PATTERN = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;
const FIRST_DIGIT_WEIGHTS = [10, 9, 8, 7, 6, 5, 4, 3, 2];
const SECOND_DIGIT_WEIGHTS = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
function isCPF(value) {
    if (!CPF_PATTERN.test(value))
        return false;
    const digits = value.replace(/\D/g, '').split('').map(Number);
    const hasAllDigitsEqual = digits.every((d) => d === digits[0]);
    if (hasAllDigitsEqual)
        return false;
    const firstDigitSum = FIRST_DIGIT_WEIGHTS.reduce((acc, w, i) => acc + digits[i] * w, 0);
    const firstDigit = firstDigitSum % 11 < 2 ? 0 : 11 - (firstDigitSum % 11);
    const secondDigitSum = SECOND_DIGIT_WEIGHTS.reduce((acc, w, i) => acc + digits[i] * w, 0);
    const secondDigit = secondDigitSum % 11 < 2 ? 0 : 11 - (secondDigitSum % 11);
    return digits[9] === firstDigit && digits[10] === secondDigit;
}
function IsCPF(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isCPF',
            target: object.constructor,
            propertyName,
            options: {
                message: '$property must be a valid CPF',
                ...validationOptions,
            },
            validator: {
                validate(value) {
                    return isCPF(String(value));
                },
            },
        });
    };
}
//# sourceMappingURL=is-cpf.decorator.js.map
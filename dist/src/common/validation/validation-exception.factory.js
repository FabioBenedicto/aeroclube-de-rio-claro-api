"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationExceptionFactory = validationExceptionFactory;
const common_1 = require("@nestjs/common");
const PT_MESSAGES = {
    isNotEmpty: 'não pode ser vazio',
    isString: 'deve ser um texto',
    isNumber: 'deve ser um número',
    isInt: 'deve ser um número inteiro',
    isBoolean: 'deve ser verdadeiro ou falso',
    isDate: 'deve ser uma data válida',
    isDateString: 'deve ser uma data válida (ISO 8601)',
    isEmail: 'deve ser um e-mail válido',
    isEnum: 'valor inválido',
    isArray: 'deve ser uma lista',
    isUUID: 'deve ser um UUID válido',
    isUrl: 'deve ser uma URL válida',
    isIn: 'valor não permitido',
    isPositive: 'deve ser um número positivo',
    isNegative: 'deve ser um número negativo',
    min: 'valor abaixo do mínimo permitido',
    max: 'valor acima do máximo permitido',
    minLength: 'texto muito curto',
    maxLength: 'texto muito longo',
    minDate: 'data anterior ao mínimo permitido',
    maxDate: 'data posterior ao máximo permitido',
    isOptional: 'campo opcional',
    whitelistValidation: 'propriedade não permitida',
    isDefined: 'é obrigatório',
    isNotIn: 'valor não permitido',
    matches: 'formato inválido',
    isAlpha: 'deve conter apenas letras',
    isAlphanumeric: 'deve conter apenas letras e números',
    isNumberString: 'deve ser um número',
    isCreditCard: 'cartão de crédito inválido',
    isCurrency: 'valor monetário inválido',
    isDecimal: 'deve ser um número decimal',
    isObject: 'deve ser um objeto',
    isInstance: 'tipo inválido',
    validateNested: 'dados aninhados inválidos',
};
function flattenErrors(errors, parent = '') {
    const messages = [];
    for (const error of errors) {
        const field = parent ? `${parent}.${error.property}` : error.property;
        if (error.constraints) {
            for (const key of Object.keys(error.constraints)) {
                const msg = PT_MESSAGES[key] ?? error.constraints[key];
                messages.push(`${field}: ${msg}`);
            }
        }
        if (error.children?.length) {
            messages.push(...flattenErrors(error.children, field));
        }
    }
    return messages;
}
function validationExceptionFactory(errors) {
    return new common_1.BadRequestException(flattenErrors(errors));
}
//# sourceMappingURL=validation-exception.factory.js.map
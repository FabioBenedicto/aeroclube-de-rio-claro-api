"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numericPad = numericPad;
exports.alphaPad = alphaPad;
exports.formatDate = formatDate;
exports.formatTime = formatTime;
exports.formatValue = formatValue;
exports.formatCpf = formatCpf;
function numericPad(value, length) {
    const digits = String(value).replace(/\D/g, '');
    return digits.padStart(length, '0').slice(-length);
}
function alphaPad(value, length) {
    return (value ?? '').slice(0, length).padEnd(length, ' ');
}
function formatDate(date) {
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = String(date.getUTCFullYear());
    return `${dd}${mm}${yyyy}`;
}
function formatTime(date) {
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mi = String(date.getUTCMinutes()).padStart(2, '0');
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    return `${hh}${mi}${ss}`;
}
function formatValue(value, totalChars) {
    const num = parseFloat(String(value));
    const cents = Math.round(num * 100);
    return String(cents).padStart(totalChars, '0');
}
function formatCpf(cpf) {
    return cpf.replace(/\D/g, '').padStart(15, '0');
}
//# sourceMappingURL=cnab.utils.js.map
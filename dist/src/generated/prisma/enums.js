"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitleStakeholder = exports.TitleStatus = exports.BillStatus = exports.Role = void 0;
exports.Role = {
    ADMIN: 'ADMIN',
    USER: 'USER'
};
exports.BillStatus = {
    open: 'open',
    pending_cnab: 'pending_cnab',
    paid: 'paid',
    cancelled: 'cancelled'
};
exports.TitleStatus = {
    PENDING: 'PENDING',
    PARTIAL: 'PARTIAL',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE'
};
exports.TitleStakeholder = {
    PEOPLE: 'PEOPLE',
    STUDENT: 'STUDENT',
    PARTNER: 'PARTNER',
    INSTRUCTOR: 'INSTRUCTOR',
    EMPLOYEE: 'EMPLOYEE',
    COMPANY: 'COMPANY',
    NONE: 'NONE'
};
//# sourceMappingURL=enums.js.map
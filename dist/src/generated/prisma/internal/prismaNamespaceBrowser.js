"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonNullValueFilter = exports.NullsOrder = exports.QueryMode = exports.JsonNullValueInput = exports.NullableJsonNullValueInput = exports.SortOrder = exports.FileScalarFieldEnum = exports.CnabRemessaScalarFieldEnum = exports.BillScalarFieldEnum = exports.PayablePaymentScalarFieldEnum = exports.PayableScalarFieldEnum = exports.ReceivablePaymentScalarFieldEnum = exports.ReceivableScalarFieldEnum = exports.FlightScalarFieldEnum = exports.AircraftScalarFieldEnum = exports.CompanyScalarFieldEnum = exports.EmployeeScalarFieldEnum = exports.InstructorScalarFieldEnum = exports.PartnerScalarFieldEnum = exports.StudentScalarFieldEnum = exports.AddressScalarFieldEnum = exports.PeopleScalarFieldEnum = exports.UserPermissionScalarFieldEnum = exports.UserAddressScalarFieldEnum = exports.UserScalarFieldEnum = exports.PermissionScalarFieldEnum = exports.SicoobSettingsScalarFieldEnum = exports.SettingsScalarFieldEnum = exports.PayableTypeScalarFieldEnum = exports.ReceivableTypeScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.Decimal = void 0;
const runtime = require("@prisma/client/runtime/index-browser");
exports.Decimal = runtime.Decimal;
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    ReceivableType: 'ReceivableType',
    PayableType: 'PayableType',
    Settings: 'Settings',
    SicoobSettings: 'SicoobSettings',
    Permission: 'Permission',
    User: 'User',
    UserAddress: 'UserAddress',
    UserPermission: 'UserPermission',
    People: 'People',
    Address: 'Address',
    Student: 'Student',
    Partner: 'Partner',
    Instructor: 'Instructor',
    Employee: 'Employee',
    Company: 'Company',
    Aircraft: 'Aircraft',
    Flight: 'Flight',
    Receivable: 'Receivable',
    ReceivablePayment: 'ReceivablePayment',
    Payable: 'Payable',
    PayablePayment: 'PayablePayment',
    Bill: 'Bill',
    CnabRemessa: 'CnabRemessa',
    File: 'File'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.ReceivableTypeScalarFieldEnum = {
    id: 'id',
    name: 'name',
    created_at: 'created_at'
};
exports.PayableTypeScalarFieldEnum = {
    id: 'id',
    name: 'name',
    created_at: 'created_at'
};
exports.SettingsScalarFieldEnum = {
    id: 'id',
    instructor_percentage: 'instructor_percentage',
    partner_monthly_dues: 'partner_monthly_dues',
    glider_initial_minutes: 'glider_initial_minutes',
    glider_initial_value: 'glider_initial_value',
    glider_minute_value: 'glider_minute_value'
};
exports.SicoobSettingsScalarFieldEnum = {
    id: 'id',
    cooperative_prefix: 'cooperative_prefix',
    cooperative_digit: 'cooperative_digit',
    branch: 'branch',
    account: 'account',
    account_digit: 'account_digit',
    wallet: 'wallet',
    modality: 'modality',
    cnpj: 'cnpj',
    company_name: 'company_name',
    remittance_sequence: 'remittance_sequence',
    interest_rate: 'interest_rate',
    interest_period: 'interest_period',
    interest_type: 'interest_type'
};
exports.PermissionScalarFieldEnum = {
    id: 'id',
    key: 'key',
    module: 'module',
    module_label: 'module_label',
    action: 'action',
    action_label: 'action_label'
};
exports.UserScalarFieldEnum = {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'role',
    created_at: 'created_at',
    updated_at: 'updated_at'
};
exports.UserAddressScalarFieldEnum = {
    id: 'id',
    street: 'street',
    neighborhood: 'neighborhood',
    city: 'city',
    state: 'state',
    zip_code: 'zip_code',
    user_id: 'user_id'
};
exports.UserPermissionScalarFieldEnum = {
    id: 'id',
    user_id: 'user_id',
    permission: 'permission'
};
exports.PeopleScalarFieldEnum = {
    id: 'id',
    cpf: 'cpf',
    name: 'name',
    email: 'email',
    phone_number: 'phone_number',
    credit_balance: 'credit_balance',
    created_at: 'created_at',
    updated_at: 'updated_at'
};
exports.AddressScalarFieldEnum = {
    id: 'id',
    street: 'street',
    neighborhood: 'neighborhood',
    city: 'city',
    state: 'state',
    zip_code: 'zip_code',
    people_id: 'people_id'
};
exports.StudentScalarFieldEnum = {
    id: 'id',
    created_at: 'created_at',
    people_id: 'people_id'
};
exports.PartnerScalarFieldEnum = {
    id: 'id',
    monthly_dues: 'monthly_dues',
    next_due_date: 'next_due_date',
    last_payment_date: 'last_payment_date',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at',
    people_id: 'people_id'
};
exports.InstructorScalarFieldEnum = {
    id: 'id',
    created_at: 'created_at',
    people_id: 'people_id'
};
exports.EmployeeScalarFieldEnum = {
    id: 'id',
    created_at: 'created_at',
    people_id: 'people_id'
};
exports.CompanyScalarFieldEnum = {
    id: 'id',
    name: 'name',
    cnpj: 'cnpj',
    email: 'email',
    phone: 'phone',
    created_at: 'created_at',
    updated_at: 'updated_at'
};
exports.AircraftScalarFieldEnum = {
    id: 'id',
    registration: 'registration',
    model: 'model',
    type: 'type',
    flight_hour_value: 'flight_hour_value',
    created_at: 'created_at',
    updated_at: 'updated_at'
};
exports.FlightScalarFieldEnum = {
    id: 'id',
    type: 'type',
    origin: 'origin',
    destination: 'destination',
    start_date: 'start_date',
    end_date: 'end_date',
    total_hours: 'total_hours',
    total_amount: 'total_amount',
    calculation_breakdown: 'calculation_breakdown',
    aircraft_id: 'aircraft_id',
    people_id: 'people_id',
    instructor_id: 'instructor_id'
};
exports.ReceivableScalarFieldEnum = {
    id: 'id',
    stakeholder: 'stakeholder',
    title: 'title',
    description: 'description',
    expiration_date: 'expiration_date',
    total_amount: 'total_amount',
    amount_received: 'amount_received',
    adds_credit: 'adds_credit',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at',
    receivable_type_id: 'receivable_type_id',
    people_id: 'people_id',
    student_id: 'student_id',
    partner_id: 'partner_id',
    instructor_id: 'instructor_id',
    employee_id: 'employee_id',
    company_id: 'company_id',
    aircraft_id: 'aircraft_id',
    flight_id: 'flight_id'
};
exports.ReceivablePaymentScalarFieldEnum = {
    id: 'id',
    amount: 'amount',
    method: 'method',
    payment_date: 'payment_date',
    receivable_id: 'receivable_id',
    file_id: 'file_id',
    bill_id: 'bill_id'
};
exports.PayableScalarFieldEnum = {
    id: 'id',
    stakeholder: 'stakeholder',
    title: 'title',
    description: 'description',
    total_amount: 'total_amount',
    amount_paid: 'amount_paid',
    status: 'status',
    expiration_date: 'expiration_date',
    created_at: 'created_at',
    updated_at: 'updated_at',
    payable_type_id: 'payable_type_id',
    people_id: 'people_id',
    student_id: 'student_id',
    partner_id: 'partner_id',
    instructor_id: 'instructor_id',
    employee_id: 'employee_id',
    company_id: 'company_id',
    aircraft_id: 'aircraft_id',
    flight_id: 'flight_id'
};
exports.PayablePaymentScalarFieldEnum = {
    id: 'id',
    payable_id: 'payable_id',
    amount: 'amount',
    method: 'method',
    payment_date: 'payment_date',
    file_id: 'file_id'
};
exports.BillScalarFieldEnum = {
    id: 'id',
    total_amount: 'total_amount',
    expiration_date: 'expiration_date',
    status: 'status',
    payment_date: 'payment_date',
    payment_method: 'payment_method',
    created_at: 'created_at',
    people_id: 'people_id',
    file_id: 'file_id'
};
exports.CnabRemessaScalarFieldEnum = {
    id: 'id',
    sequence_number: 'sequence_number',
    bill_ids: 'bill_ids',
    bill_count: 'bill_count',
    total_amount: 'total_amount',
    created_at: 'created_at',
    file_id: 'file_id'
};
exports.FileScalarFieldEnum = {
    id: 'id',
    url: 'url',
    blob_path: 'blob_path',
    original_name: 'original_name',
    mime_type: 'mime_type',
    size: 'size',
    created_at: 'created_at'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.NullableJsonNullValueInput = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull
};
exports.JsonNullValueInput = {
    JsonNull: exports.JsonNull
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.JsonNullValueFilter = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull,
    AnyNull: exports.AnyNull
};
//# sourceMappingURL=prismaNamespaceBrowser.js.map
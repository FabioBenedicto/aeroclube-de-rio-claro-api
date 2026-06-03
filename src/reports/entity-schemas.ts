export type FieldType = 'string' | 'number' | 'date' | 'enum';

export interface EnumValue { value: string; label: string; }

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  enumValues?: EnumValue[];
  dbField?: string;
  whereKey?: string[];
  groupable: boolean;
  aggregatable: boolean;
  coerce?: (v: any) => any;
  extract: (row: any) => any;
}

const toNum = (v: any) => (v == null ? null : v?.toNumber ? v.toNumber() : Number(v));
const toDate = (v: any) => (v instanceof Date ? v.toISOString().split('T')[0] : null);

const PAYER_LABELS: Record<string, string> = {
  customer: 'Cliente', company: 'Empresa', instructor: 'Instrutor',
  partner: 'Sócio', employee: 'Funcionário', none: 'Nenhum',
};

export const ENTITY_SCHEMAS: Record<string, FieldDef[]> = {
  receivable: [
    { key: 'id', label: 'ID', type: 'number', dbField: 'id', whereKey: ['id'], groupable: true, aggregatable: false, extract: r => r.id },
    { key: 'title', label: 'Título', type: 'string', dbField: 'title', whereKey: ['title'], groupable: true, aggregatable: false, extract: r => r.title },
    {
      key: 'product', label: 'Produto', type: 'enum', dbField: 'product', whereKey: ['product'], groupable: true, aggregatable: false,
      enumValues: [
        { value: 'voo', label: 'Voo' }, { value: 'credito', label: 'Crédito' }, { value: 'servico', label: 'Serviço' },
        { value: 'mensalidade', label: 'Mensalidade' }, { value: 'instrucao', label: 'Instrução' }, { value: 'outro', label: 'Outro' },
      ],
      extract: r => r.product,
    },
    { key: 'total_amount', label: 'Valor total', type: 'number', dbField: 'total_amount', whereKey: ['total_amount'], groupable: false, aggregatable: true, coerce: Number, extract: r => toNum(r.total_amount) },
    { key: 'amount_received', label: 'Valor recebido', type: 'number', dbField: 'amount_received', whereKey: ['amount_received'], groupable: false, aggregatable: true, coerce: Number, extract: r => toNum(r.amount_received) },
    {
      key: 'status', label: 'Status', type: 'enum', dbField: 'status', whereKey: ['status'], groupable: true, aggregatable: false,
      enumValues: [{ value: '0', label: 'Em aberto' }, { value: '1', label: 'Pago' }],
      coerce: (v: any) => parseInt(String(v)),
      extract: r => (r.status === 1 ? 'Pago' : 'Em aberto'),
    },
    { key: 'expiration_date', label: 'Vencimento', type: 'date', dbField: 'expiration_date', whereKey: ['expiration_date'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.expiration_date) },
    { key: 'created_at', label: 'Criado em', type: 'date', dbField: 'created_at', whereKey: ['created_at'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.created_at) },
    {
      key: 'payer_type', label: 'Tipo de pagador', type: 'enum', dbField: 'payer_type', whereKey: ['payer_type'], groupable: true, aggregatable: false,
      enumValues: Object.entries(PAYER_LABELS).map(([value, label]) => ({ value, label })),
      extract: r => PAYER_LABELS[r.payer_type] ?? r.payer_type,
    },
    { key: 'customer_name', label: 'Cliente', type: 'string', whereKey: ['customer', 'name'], groupable: false, aggregatable: false, extract: r => r.customer?.name ?? null },
    { key: 'company_name', label: 'Empresa', type: 'string', whereKey: ['company', 'name'], groupable: false, aggregatable: false, extract: r => r.company?.name ?? null },
  ],

  payable: [
    { key: 'id', label: 'ID', type: 'number', dbField: 'id', whereKey: ['id'], groupable: true, aggregatable: false, extract: r => r.id },
    { key: 'title', label: 'Título', type: 'string', dbField: 'title', whereKey: ['title'], groupable: true, aggregatable: false, extract: r => r.title },
    { key: 'product', label: 'Produto', type: 'string', dbField: 'product', whereKey: ['product'], groupable: true, aggregatable: false, extract: r => r.product },
    { key: 'amount', label: 'Valor', type: 'number', dbField: 'amount', whereKey: ['amount'], groupable: false, aggregatable: true, coerce: Number, extract: r => toNum(r.amount) },
    { key: 'amount_paid', label: 'Valor pago', type: 'number', dbField: 'amount_paid', whereKey: ['amount_paid'], groupable: false, aggregatable: true, coerce: Number, extract: r => toNum(r.amount_paid) },
    {
      key: 'status', label: 'Status', type: 'enum', dbField: 'status', whereKey: ['status'], groupable: true, aggregatable: false,
      enumValues: [{ value: 'open', label: 'Em aberto' }, { value: 'partial', label: 'Parcial' }, { value: 'closed', label: 'Pago' }],
      extract: r => ({ open: 'Em aberto', partial: 'Parcial', closed: 'Pago' }[r.status as string] ?? r.status),
    },
    { key: 'due_date', label: 'Vencimento', type: 'date', dbField: 'due_date', whereKey: ['due_date'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.due_date) },
    { key: 'created_at', label: 'Criado em', type: 'date', dbField: 'created_at', whereKey: ['created_at'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.created_at) },
    {
      key: 'payer_type', label: 'Tipo', type: 'enum', dbField: 'payer_type', whereKey: ['payer_type'], groupable: true, aggregatable: false,
      enumValues: Object.entries(PAYER_LABELS).map(([value, label]) => ({ value, label })),
      extract: r => PAYER_LABELS[r.payer_type] ?? r.payer_type,
    },
    { key: 'customer_name', label: 'Cliente', type: 'string', whereKey: ['customer', 'name'], groupable: false, aggregatable: false, extract: r => r.customer?.name ?? null },
    { key: 'company_name', label: 'Empresa', type: 'string', whereKey: ['company', 'name'], groupable: false, aggregatable: false, extract: r => r.company?.name ?? null },
  ],

  flight: [
    { key: 'id', label: 'ID', type: 'number', dbField: 'id', whereKey: ['id'], groupable: true, aggregatable: false, extract: r => r.id },
    { key: 'type', label: 'Tipo', type: 'string', dbField: 'type', whereKey: ['type'], groupable: true, aggregatable: false, extract: r => r.type },
    { key: 'origin', label: 'Origem', type: 'string', dbField: 'origin', whereKey: ['origin'], groupable: true, aggregatable: false, extract: r => r.origin },
    { key: 'destination', label: 'Destino', type: 'string', dbField: 'destination', whereKey: ['destination'], groupable: true, aggregatable: false, extract: r => r.destination },
    { key: 'start_date', label: 'Início', type: 'date', dbField: 'start_date', whereKey: ['start_date'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.start_date) },
    { key: 'end_date', label: 'Fim', type: 'date', dbField: 'end_date', whereKey: ['end_date'], groupable: false, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.end_date) },
    { key: 'total_hours', label: 'Horas', type: 'number', dbField: 'total_hours', whereKey: ['total_hours'], groupable: false, aggregatable: true, coerce: Number, extract: r => toNum(r.total_hours) },
    { key: 'total_amount', label: 'Valor', type: 'number', dbField: 'total_amount', whereKey: ['total_amount'], groupable: false, aggregatable: true, coerce: Number, extract: r => toNum(r.total_amount) },
    {
      key: 'double_command', label: 'Duplo Comando', type: 'enum', dbField: 'double_command', whereKey: ['double_command'], groupable: true, aggregatable: false,
      enumValues: [{ value: 'true', label: 'Sim' }, { value: 'false', label: 'Não' }],
      coerce: (v: any) => v === 'true' || v === true,
      extract: r => (r.double_command ? 'Sim' : 'Não'),
    },
    { key: 'customer_name', label: 'Cliente', type: 'string', whereKey: ['customer', 'name'], groupable: false, aggregatable: false, extract: r => r.customer?.name ?? null },
    { key: 'plane_registration', label: 'Aeronave', type: 'string', whereKey: ['plane', 'registration'], groupable: false, aggregatable: false, extract: r => r.plane?.registration ?? null },
    { key: 'instructor_name', label: 'Instrutor', type: 'string', whereKey: ['instructor', 'customer', 'name'], groupable: false, aggregatable: false, extract: r => r.instructor?.customer?.name ?? null },
  ],

  person: [
    { key: 'id', label: 'ID', type: 'number', dbField: 'id', whereKey: ['id'], groupable: true, aggregatable: false, extract: r => r.id },
    { key: 'name', label: 'Nome', type: 'string', dbField: 'name', whereKey: ['name'], groupable: true, aggregatable: false, extract: r => r.name },
    { key: 'cpf', label: 'CPF', type: 'string', dbField: 'cpf', whereKey: ['cpf'], groupable: true, aggregatable: false, extract: r => r.cpf },
    { key: 'email', label: 'E-mail', type: 'string', dbField: 'email', whereKey: ['email'], groupable: true, aggregatable: false, extract: r => r.email },
    { key: 'phone_number', label: 'Telefone', type: 'string', dbField: 'phone_number', whereKey: ['phone_number'], groupable: false, aggregatable: false, extract: r => r.phone_number ?? null },
    { key: 'credit_balance', label: 'Saldo de crédito', type: 'number', dbField: 'credit_balance', whereKey: ['credit_balance'], groupable: false, aggregatable: true, coerce: Number, extract: r => toNum(r.credit_balance) },
    { key: 'created_at', label: 'Criado em', type: 'date', dbField: 'created_at', whereKey: ['created_at'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.created_at) },
  ],

  bill: [
    { key: 'id', label: 'ID', type: 'number', dbField: 'id', whereKey: ['id'], groupable: true, aggregatable: false, extract: r => r.id },
    { key: 'total_amount', label: 'Valor total', type: 'number', dbField: 'total_amount', whereKey: ['total_amount'], groupable: false, aggregatable: true, coerce: Number, extract: r => toNum(r.total_amount) },
    { key: 'issue_date', label: 'Emissão', type: 'date', dbField: 'issue_date', whereKey: ['issue_date'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.issue_date) },
    { key: 'due_date', label: 'Vencimento', type: 'date', dbField: 'due_date', whereKey: ['due_date'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.due_date) },
    { key: 'paid_at', label: 'Pago em', type: 'date', dbField: 'paid_at', whereKey: ['paid_at'], groupable: false, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.paid_at) },
    { key: 'created_at', label: 'Criado em', type: 'date', dbField: 'created_at', whereKey: ['created_at'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.created_at) },
    { key: 'customer_name', label: 'Cliente', type: 'string', whereKey: ['customer', 'name'], groupable: false, aggregatable: false, extract: r => r.customer?.name ?? null },
  ],

  receivablePayment: [
    { key: 'id', label: 'ID', type: 'number', dbField: 'id', whereKey: ['id'], groupable: true, aggregatable: false, extract: r => r.id },
    { key: 'amount_received', label: 'Valor recebido', type: 'number', dbField: 'amount_received', whereKey: ['amount_received'], groupable: false, aggregatable: true, coerce: Number, extract: r => toNum(r.amount_received) },
    { key: 'payment_method', label: 'Forma de pagamento', type: 'string', dbField: 'payment_method', whereKey: ['payment_method'], groupable: true, aggregatable: false, extract: r => r.payment_method ?? null },
    { key: 'payment_date', label: 'Data do pagamento', type: 'date', dbField: 'payment_date', whereKey: ['payment_date'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.payment_date) },
    { key: 'receivable_title', label: 'Título', type: 'string', whereKey: ['receivable', 'title'], groupable: false, aggregatable: false, extract: r => r.receivable?.title ?? null },
    { key: 'customer_name', label: 'Cliente', type: 'string', whereKey: ['receivable', 'customer', 'name'], groupable: false, aggregatable: false, extract: r => r.receivable?.customer?.name ?? null },
  ],

  payablePayment: [
    { key: 'id', label: 'ID', type: 'number', dbField: 'id', whereKey: ['id'], groupable: true, aggregatable: false, extract: r => r.id },
    { key: 'amount', label: 'Valor pago', type: 'number', dbField: 'amount', whereKey: ['amount'], groupable: false, aggregatable: true, coerce: Number, extract: r => toNum(r.amount) },
    { key: 'method', label: 'Forma de pagamento', type: 'string', dbField: 'method', whereKey: ['method'], groupable: true, aggregatable: false, extract: r => r.method ?? null },
    { key: 'paid_at', label: 'Data do pagamento', type: 'date', dbField: 'paid_at', whereKey: ['paid_at'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.paid_at) },
    { key: 'notes', label: 'Observações', type: 'string', dbField: 'notes', whereKey: ['notes'], groupable: false, aggregatable: false, extract: r => r.notes ?? null },
    { key: 'payable_title', label: 'Título', type: 'string', whereKey: ['payable', 'title'], groupable: false, aggregatable: false, extract: r => r.payable?.title ?? null },
    { key: 'customer_name', label: 'Cliente', type: 'string', whereKey: ['payable', 'customer', 'name'], groupable: false, aggregatable: false, extract: r => r.payable?.customer?.name ?? null },
  ],

  company: [
    { key: 'id', label: 'ID', type: 'number', dbField: 'id', whereKey: ['id'], groupable: true, aggregatable: false, extract: r => r.id },
    { key: 'name', label: 'Nome', type: 'string', dbField: 'name', whereKey: ['name'], groupable: true, aggregatable: false, extract: r => r.name },
    { key: 'cnpj', label: 'CNPJ', type: 'string', dbField: 'cnpj', whereKey: ['cnpj'], groupable: false, aggregatable: false, extract: r => r.cnpj ?? null },
    { key: 'email', label: 'E-mail', type: 'string', dbField: 'email', whereKey: ['email'], groupable: false, aggregatable: false, extract: r => r.email ?? null },
    { key: 'phone', label: 'Telefone', type: 'string', dbField: 'phone', whereKey: ['phone'], groupable: false, aggregatable: false, extract: r => r.phone ?? null },
    { key: 'created_at', label: 'Criado em', type: 'date', dbField: 'created_at', whereKey: ['created_at'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.created_at) },
  ],

  partner: [
    { key: 'id', label: 'ID', type: 'number', dbField: 'id', whereKey: ['id'], groupable: true, aggregatable: false, extract: r => r.id },
    { key: 'monthly_dues', label: 'Mensalidade', type: 'number', dbField: 'monthly_dues', whereKey: ['monthly_dues'], groupable: false, aggregatable: true, coerce: Number, extract: r => toNum(r.monthly_dues) },
    { key: 'next_due_date', label: 'Próximo vencimento', type: 'date', dbField: 'next_due_date', whereKey: ['next_due_date'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.next_due_date) },
    { key: 'last_payment_date', label: 'Último pagamento', type: 'date', dbField: 'last_payment_date', whereKey: ['last_payment_date'], groupable: false, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.last_payment_date) },
    { key: 'status', label: 'Status', type: 'enum', dbField: 'status', whereKey: ['status'], groupable: true, aggregatable: false,
      enumValues: [{ value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Inativo' }],
      extract: r => r.status },
    { key: 'created_at', label: 'Criado em', type: 'date', dbField: 'created_at', whereKey: ['created_at'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.created_at) },
    { key: 'customer_name', label: 'Sócio', type: 'string', whereKey: ['customer', 'name'], groupable: false, aggregatable: false, extract: r => r.customer?.name ?? null },
    { key: 'customer_cpf', label: 'CPF', type: 'string', whereKey: ['customer', 'cpf'], groupable: false, aggregatable: false, extract: r => r.customer?.cpf ?? null },
  ],

  instructor: [
    { key: 'id', label: 'ID', type: 'number', dbField: 'id', whereKey: ['id'], groupable: true, aggregatable: false, extract: r => r.id },
    { key: 'customer_name', label: 'Nome', type: 'string', whereKey: ['customer', 'name'], groupable: false, aggregatable: false, extract: r => r.customer?.name ?? null },
    { key: 'customer_cpf', label: 'CPF', type: 'string', whereKey: ['customer', 'cpf'], groupable: false, aggregatable: false, extract: r => r.customer?.cpf ?? null },
    { key: 'customer_email', label: 'E-mail', type: 'string', whereKey: ['customer', 'email'], groupable: false, aggregatable: false, extract: r => r.customer?.email ?? null },
  ],

  plane: [
    { key: 'id', label: 'ID', type: 'number', dbField: 'id', whereKey: ['id'], groupable: true, aggregatable: false, extract: r => r.id },
    { key: 'registration', label: 'Matrícula', type: 'string', dbField: 'registration', whereKey: ['registration'], groupable: true, aggregatable: false, extract: r => r.registration },
    { key: 'model', label: 'Modelo', type: 'string', dbField: 'model', whereKey: ['model'], groupable: true, aggregatable: false, extract: r => r.model ?? null },
    { key: 'flight_hour_value', label: 'Valor hora/voo', type: 'number', dbField: 'flight_hour_value', whereKey: ['flight_hour_value'], groupable: false, aggregatable: true, coerce: Number, extract: r => toNum(r.flight_hour_value) },
    { key: 'created_at', label: 'Criado em', type: 'date', dbField: 'created_at', whereKey: ['created_at'], groupable: true, aggregatable: false, coerce: (v: any) => new Date(v), extract: r => toDate(r.created_at) },
  ],
};

export const ENTITY_INCLUDE: Record<string, any> = {
  receivable: { customer: true, company: true },
  payable: { customer: true, company: true },
  flight: { customer: true, plane: true, instructor: { include: { customer: true } } },
  person: {},
  bill: { customer: true },
  receivablePayment: { receivable: { include: { customer: true } } },
  payablePayment: { payable: { include: { customer: true } } },
  company: {},
  partner: { customer: true },
  instructor: { customer: true },
  plane: {},
};

export const ENTITY_MODEL: Record<string, string> = {
  receivable: 'receivable',
  payable: 'payable',
  flight: 'flight',
  person: 'person',
  bill: 'bill',
  receivablePayment: 'receivablePayment',
  payablePayment: 'payablePayment',
  company: 'company',
  partner: 'partner',
  instructor: 'instructor',
  plane: 'plane',
};

export interface JoinDef {
  label: string;
  entity: string;
  include: any;
  extractRoot: (row: any) => any;
}

export const JOIN_DEFS: Record<string, Record<string, JoinDef>> = {
  receivable: {
    person:   { label: 'Person',   entity: 'person', include: { customer: true }, extractRoot: r => r.customer },
    company:  { label: 'Empresa',  entity: 'company',  include: { company: true },  extractRoot: r => r.company  },
    plane:    { label: 'Aeronave', entity: 'plane',    include: { plane: true },    extractRoot: r => r.plane    },
    flight:   { label: 'Voo',      entity: 'flight',   include: { flight: { include: { plane: true, customer: true } } }, extractRoot: r => r.flight },
  },
  payable: {
    person:   { label: 'Person',   entity: 'person', include: { customer: true }, extractRoot: r => r.customer },
    company:  { label: 'Empresa',  entity: 'company',  include: { company: true },  extractRoot: r => r.company  },
    plane:    { label: 'Aeronave', entity: 'plane',    include: { plane: true },    extractRoot: r => r.plane    },
  },
  flight: {
    person:   { label: 'Pilot',   entity: 'person', include: { customer: true }, extractRoot: r => r.customer },
    plane:    { label: 'Aeronave', entity: 'plane',    include: { plane: true },    extractRoot: r => r.plane    },
  },
  person: {},
  bill: {
    person:   { label: 'Person',   entity: 'person', include: { customer: true }, extractRoot: r => r.customer },
  },
  receivablePayment: {},
  payablePayment:    {},
  company:           {},
  partner: {
    person:   { label: 'Person',   entity: 'person', include: { customer: true }, extractRoot: r => r.customer },
  },
  instructor: {
    person:   { label: 'Person',   entity: 'person', include: { customer: true }, extractRoot: r => r.customer },
  },
  plane: {},
};

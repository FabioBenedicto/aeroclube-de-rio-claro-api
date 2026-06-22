import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

function charValue(ch: string): number {
  return parseInt(ch, 36);
}

@ValidatorConstraint({ name: 'isCnpj', async: false })
export class IsCnpjConstraint implements ValidatorConstraintInterface {
  validate(cnpj: string): boolean {
    if (typeof cnpj !== 'string') return false;
    if (!/^[0-9A-Z]{14}$/.test(cnpj)) return false;
    if (!/^\d$/.test(cnpj[12]) || !/^\d$/.test(cnpj[13])) return false;
    if (/^(.)\1+$/.test(cnpj)) return false;

    const calc = (weights: number[], len: number): number => {
      let sum = 0;
      for (let i = 0; i < len; i++) sum += charValue(cnpj[i]) * weights[i];
      const rem = sum % 11;
      return rem < 2 ? 0 : 11 - rem;
    };

    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    return (
      calc(w1, 12) === parseInt(cnpj[12]) &&
      calc(w2, 13) === parseInt(cnpj[13])
    );
  }

  defaultMessage(): string {
    return 'CNPJ inválido';
  }
}

export function IsCnpj(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: IsCnpjConstraint,
    });
  };
}

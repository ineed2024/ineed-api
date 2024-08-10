import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'ValidarQuantidade', async: false })
export class ValidarQuantidade implements ValidatorConstraintInterface {
  validate(text: string[], args: ValidationArguments) {
    return text && text.length == args.object['filtrarPor'].length;
  }

  defaultMessage() {
    return 'Quantidade de valores inválidos';
  }
}

import joi, { Schema, ValidationResult } from "joi";
import { Validator, Value } from "@thomazmz/core-context";

export class JoiValidator<V extends Value> implements Validator<V> {
  constructor(private readonly schema: Schema<V>) {}

  cast(value: unknown): value is V {
    return this.validate(value);
  }

  validate(value: unknown): boolean {
    const { error } = this.validateAgainstSchema(value);
    return !error;
  }

  assert(value: unknown): true | void {
    const { error } = this.validateAgainstSchema(value);
    return error ? this.throwError(error.message) : true;
  }

  extractValidationError(value: unknown): Error | undefined {
    const validationResult = this.validateAgainstSchema(value);
    return validationResult.error
      ? this.mapError(validationResult.error)
      : undefined;
  }

  protected mapError(error: joi.ValidationError): Error {
    return new Error(error.message);
  }

  protected validateAgainstSchema(
    objectUnderValidation: unknown,
    validateAll = true
  ): ValidationResult {
    return this.schema.strict(true).validate(objectUnderValidation, {
      abortEarly: validateAll,
    });
  }

  protected throwError(reason: string): void {
    throw new Error(reason);
  }
}

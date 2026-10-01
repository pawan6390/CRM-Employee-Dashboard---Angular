import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class CustomValidators {
  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(control.value);
      return valid ? null : { invalidEmail: true };
    };
  }

  static strongPassword(minLength = 8): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value ?? "";
      if (!value) return null;

      const errors: ValidationErrors = {};
      if (value.length < minLength)
        errors["minLength"] = { requiredLength: minLength };
      if (!/[A-Z]/.test(value)) errors["noUppercase"] = true;
      if (!/[a-z]/.test(value)) errors["noLowercase"] = true;
      if (!/\d/.test(value)) errors["noDigit"] = true;

      return Object.keys(errors).length ? errors : null;
    };
  }

  static matchFields(fieldA: string, fieldB: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const a = group.get(fieldA)?.value;
      const b = group.get(fieldB)?.value;
      if (!a || !b) return null;
      return a === b ? null : { fieldsMismatch: { fieldA, fieldB } };
    };
  }

  static notBlank(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value ?? "";
      return value.trim().length === 0 && value.length > 0
        ? { blank: true }
        : null;
    };
  }

  static phone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^\+?[0-9]{7,15}$/.test(control.value);
      return valid ? null : { invalidPhone: true };
    };
  }
}

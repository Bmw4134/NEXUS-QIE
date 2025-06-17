
export interface ValidationSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  required?: boolean;
  properties?: Record<string, ValidationSchema>;
  items?: ValidationSchema;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ValidationSystem {
  validate(data: any, schema: ValidationSchema): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    this.validateValue(data, schema, '', result);

    result.isValid = result.errors.length === 0;
    return result;
  }

  private validateValue(
    value: any,
    schema: ValidationSchema,
    path: string,
    result: ValidationResult
  ): void {
    // Check required
    if (schema.required && (value === undefined || value === null)) {
      result.errors.push(`${path || 'root'} is required`);
      return;
    }

    if (value === undefined || value === null) {
      return; // Optional field, skip validation
    }

    // Type validation
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== schema.type) {
      result.errors.push(`${path || 'root'} should be ${schema.type}, got ${actualType}`);
      return;
    }

    // Type-specific validations
    switch (schema.type) {
      case 'string':
        this.validateString(value, schema, path, result);
        break;
      case 'number':
        this.validateNumber(value, schema, path, result);
        break;
      case 'object':
        this.validateObject(value, schema, path, result);
        break;
      case 'array':
        this.validateArray(value, schema, path, result);
        break;
    }
  }

  private validateString(
    value: string,
    schema: ValidationSchema,
    path: string,
    result: ValidationResult
  ): void {
    if (schema.minLength && value.length < schema.minLength) {
      result.errors.push(`${path} should be at least ${schema.minLength} characters`);
    }

    if (schema.maxLength && value.length > schema.maxLength) {
      result.errors.push(`${path} should be at most ${schema.maxLength} characters`);
    }

    if (schema.pattern && !schema.pattern.test(value)) {
      result.errors.push(`${path} does not match required pattern`);
    }
  }

  private validateNumber(
    value: number,
    schema: ValidationSchema,
    path: string,
    result: ValidationResult
  ): void {
    if (schema.min !== undefined && value < schema.min) {
      result.errors.push(`${path} should be at least ${schema.min}`);
    }

    if (schema.max !== undefined && value > schema.max) {
      result.errors.push(`${path} should be at most ${schema.max}`);
    }
  }

  private validateObject(
    value: object,
    schema: ValidationSchema,
    path: string,
    result: ValidationResult
  ): void {
    if (!schema.properties) return;

    for (const [key, propertySchema] of Object.entries(schema.properties)) {
      const propertyPath = path ? `${path}.${key}` : key;
      this.validateValue((value as any)[key], propertySchema, propertyPath, result);
    }
  }

  private validateArray(
    value: any[],
    schema: ValidationSchema,
    path: string,
    result: ValidationResult
  ): void {
    if (schema.minLength && value.length < schema.minLength) {
      result.errors.push(`${path} should have at least ${schema.minLength} items`);
    }

    if (schema.maxLength && value.length > schema.maxLength) {
      result.errors.push(`${path} should have at most ${schema.maxLength} items`);
    }

    if (schema.items) {
      value.forEach((item, index) => {
        this.validateValue(item, schema.items!, `${path}[${index}]`, result);
      });
    }
  }
}

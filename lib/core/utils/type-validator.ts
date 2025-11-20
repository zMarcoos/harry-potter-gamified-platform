import type { ZodError, z, ZodObject } from 'zod/v4';

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

export const formatZodError = (error: ZodError): Record<string, string> => {
  return error.issues.reduce(
    (accumulator, issue) => {
      const path = issue.path.join('.');
      accumulator[path || 'form'] = issue.message;
      return accumulator;
    },
    {} as Record<string, string>,
  );
};

export const validate = <T>(
  schema: z.Schema<T>,
  input: unknown,
): ValidationResult<T> => {
  const parsedSchema = schema.safeParse(input);

  if (parsedSchema.success) {
    return { data: parsedSchema.data, ok: true };
  }

  return { errors: formatZodError(parsedSchema.error), ok: false };
};

export const validateField = <T extends ZodObject<any>>(
  schema: T,
  fieldName: keyof z.infer<T>,
  data: z.input<T>,
): ValidationResult<Partial<z.infer<T>>> => {
  const fieldSchema = schema.shape[fieldName as string];
  if (!fieldSchema) return { ok: true, data: {} };

  const valueToValidate = data[fieldName as keyof z.input<T>];

  const parsedSchema = fieldSchema.safeParse(valueToValidate);
  if (parsedSchema.success) {
    return {
      ok: true,
      data: { [fieldName]: parsedSchema.data } as Partial<z.infer<T>>,
    };
  }

  return {
    ok: false,
    errors: {
      [fieldName as string]: parsedSchema.error.issues[0].message,
    },
  };
};


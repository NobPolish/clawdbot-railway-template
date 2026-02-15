'use client';

import React from 'react';
import { useForm, SubmitHandler, FieldValues, Path } from 'react-hook-form';
import { ZodSchema } from 'zod';
import { Button } from './Button';
import { Input } from './Input';

interface FormWrapperProps<T extends FieldValues> {
  schema: ZodSchema;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  submitText?: string;
  isLoading?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Form Wrapper Component
 * Handles form state, validation, and submission with react-hook-form
 */
export function FormWrapper<T extends FieldValues>({
  schema,
  onSubmit,
  children,
  submitText = 'Submit',
  isLoading = false,
  onError,
}: FormWrapperProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<T>({
    mode: 'onChange',
  });

  const handleSubmitWrapper: SubmitHandler<T> = async (data) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('[v0] Form submission error:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitWrapper)} className="space-y-6">
      {children}
      <Button
        type="submit"
        isLoading={isSubmitting || isLoading}
        disabled={isSubmitting || isLoading}
        className="w-full"
      >
        {submitText}
      </Button>
    </form>
  );
}

/**
 * Reusable Form Field Component
 * Integrates with react-hook-form for validation
 */
interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  register?: any;
  helperText?: string;
}

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  error,
  register,
  helperText,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {helperText && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
    </div>
  );
}

/**
 * Select Field Component
 */
interface SelectFieldProps {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  register?: any;
}

export function SelectField({
  name,
  label,
  options,
  error,
  register,
}: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        {...register}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Select an option</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

/**
 * Checkbox Field Component
 */
interface CheckboxFieldProps {
  name: string;
  label: string;
  error?: string;
  register?: any;
}

export function CheckboxField({
  name,
  label,
  error,
  register,
}: CheckboxFieldProps) {
  return (
    <div>
      <label className="flex items-center">
        <input
          type="checkbox"
          {...register}
          className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      </label>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

/**
 * Textarea Field Component
 */
interface TextareaFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  error?: string;
  register?: any;
}

export function TextareaField({
  name,
  label,
  placeholder,
  rows = 4,
  error,
  register,
}: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        rows={rows}
        {...register}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

/**
 * Validation Schemas (using zod)
 */
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  avatar: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;

import { passwordRule, required, telegramRule } from '@features/Auth';
import type { FieldErrors } from '@features/Auth';
import type { ChangePasswordFormValues, EditProfileFormValues } from '../types';

export function validateEditProfileForm(
  values: EditProfileFormValues,
): FieldErrors<keyof EditProfileFormValues> {
  return {
    fullName: required(values.fullName, 'Full Name'),
    country: required(values.country, 'Country'),
    telegramId: telegramRule(values.telegramId),
  };
}

export function validateChangePasswordForm(
  values: ChangePasswordFormValues,
): FieldErrors<keyof ChangePasswordFormValues> {
  const currentPassword = passwordRule(values.currentPassword);
  const newPassword = passwordRule(values.newPassword);

  let confirmPassword: string | undefined;
  const missingConfirm = required(values.confirmPassword, 'Confirm New Password');

  if (missingConfirm) {
    confirmPassword = missingConfirm;
  } else if (values.confirmPassword !== values.newPassword) {
    confirmPassword = 'Passwords do not match.';
  }

  return {
    currentPassword,
    newPassword,
    confirmPassword,
  };
}

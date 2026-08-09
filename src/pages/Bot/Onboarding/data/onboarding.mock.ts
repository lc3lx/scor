import type { OnboardingContent } from '../types';

/**
 * Onboarding copy aligned with Phase 7/9 product model:
 * Telegram → Binolla credentials (partner signup) → admin approval → FREE Demo + RSI.
 */
export const ONBOARDING_MOCK_CONTENT: OnboardingContent = {
  step1: {
    title: 'Connect Your Binolla Account',
    description:
      'Log in or sign up on Binolla with your email — Scar Alpha has no separate accounts. Partner signup uses our referral link.',
    keyPoints: [
      {
        id: 'step1-1',
        text: 'Sign up or log in with your Binolla email and password in the app.',
        variant: 'check',
      },
      {
        id: 'step1-2',
        text: 'New accounts are created on Binolla via our partner referral (lid=15968).',
        variant: 'check',
      },
      { id: 'step1-3', text: 'Wait for admin approval before using the bot.', variant: 'check' },
      {
        id: 'step1-4',
        text: 'Demo trading and RSI signals use your linked Binolla session.',
        variant: 'trade',
      },
    ],
    footnote:
      'Referral is attribution only. Access requires administrator approval. No subscription or activation keys.',
  },
  step2: {
    title: 'Wait for Admin Approval',
    description:
      'After you connect Binolla, an administrator reviews your account. Access is free once approved.',
    activationItems: [
      { label: 'Binolla', status: 'Connected', tone: 'success' },
      { label: 'Admin Approval', status: 'Pending', tone: 'warning' },
    ],
    activationKey: 'Admin review required',
    keyPoints: [
      { id: 'step2-1', text: 'Connect Binolla from Sign up / Log in in the app.', variant: 'check' },
      { id: 'step2-2', text: 'Wait for administrator approval.', variant: 'check' },
      { id: 'step2-3', text: 'Once approved, you get free access to the bot.', variant: 'check' },
      {
        id: 'step2-4',
        text: 'There is no subscription or activation key.',
        variant: 'check',
      },
      {
        id: 'step2-5',
        text: 'Rejected accounts cannot trade until reviewed again.',
        variant: 'warning',
      },
    ],
  },
  step3: {
    title: 'Use RSI and Demo Trading',
    description:
      'After approval, open Trading for live Demo charts and manual UP/DOWN orders. RSI is a signal only — not auto-trading.',
    botPreview: {
      name: 'Scar Alpha',
      statusLabel: 'Manual Demo',
      statusTone: 'warning',
      strengthLabel: 'Mode',
      strengthValue: 'Demo',
      fields: [
        { id: 'indicator', label: 'Signal', value: 'RSI' },
        { id: 'strategy', label: 'Strategy', value: 'RSI' },
        { id: 'amount', label: 'Amount', value: 'Set on Trading' },
        { id: 'duration', label: 'Duration', value: 'Set on Trading' },
        { id: 'profit-target', label: 'Auto trading', value: 'Not available' },
        { id: 'loss-limit', label: 'Account', value: 'Demo only' },
      ],
    },
    keyPoints: [
      {
        id: 'step3-1',
        text: 'Market data and balance come from your live Binolla Demo session.',
        variant: 'check',
      },
      {
        id: 'step3-2',
        text: 'RSI signal is calculated on the server from Binolla candles.',
        variant: 'check',
      },
      {
        id: 'step3-3',
        text: 'Place Demo trades manually on the Trading screen only.',
        variant: 'check',
      },
      {
        id: 'step3-4',
        text: 'Real trading and auto-trading are disabled.',
        variant: 'check',
      },
      {
        id: 'step3-5',
        text: 'Admin approval remains the access gate — not the referral link alone.',
        variant: 'check',
      },
    ],
  },
};

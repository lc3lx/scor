import type { OnboardingContent } from '../types';

/**
 * Temporary onboarding content — replace with API responses when backend is ready.
 */
export const ONBOARDING_MOCK_CONTENT: OnboardingContent = {
  step1: {
    title: 'Connect Your Binolla Account',
    description:
      'Scar Alpha AI works with your Binolla trading account through the Trading page.',
    keyPoints: [
      { id: 'step1-1', text: 'Create or log in to your Binolla account.', variant: 'check' },
      {
        id: 'step1-2',
        text: 'Add your Binolla Account ID or email in Scar Alpha AI.',
        variant: 'check',
      },
      { id: 'step1-3', text: 'Wait for admin approval before using the bot.', variant: 'check' },
      {
        id: 'step1-4',
        text: 'All trades happen inside the embedded Binolla view.',
        variant: 'trade',
      },
    ],
    footnote:
      'Home, Trades, AI Bot, Account, and Notifications belong to Scar Alpha AI — Binolla appears only inside Trading.',
  },
  step2: {
    title: 'Activate Scar Alpha AI',
    description:
      'Your bot access starts after admin approval and Activation Key verification.',
    activationItems: [
      { label: 'Account Status', status: 'Approved', tone: 'success' },
      { label: 'Subscription', status: 'Pending Activation', tone: 'warning' },
    ],
    activationKey: 'SCAR-••••-••••-1B2A',
    keyPoints: [
      { id: 'step2-1', text: 'Register your account.', variant: 'check' },
      { id: 'step2-2', text: 'Wait for admin approval.', variant: 'check' },
      { id: 'step2-3', text: 'Enter your Activation Key.', variant: 'check' },
      {
        id: 'step2-4',
        text: 'Subscription duration starts after activation.',
        variant: 'check',
      },
      {
        id: 'step2-5',
        text: 'Invalid, expired, or reused keys will fail.',
        variant: 'warning',
      },
    ],
  },
  step3: {
    title: 'Start the AI Bot Safely',
    description:
      'Choose your market, indicator, strategy, amount, duration, and risk limits before starting.',
    botPreview: {
      name: 'Scar Alpha AI Bot',
      statusLabel: 'Searching',
      statusTone: 'warning',
      strengthLabel: 'Strength',
      strengthValue: '82%',
      fields: [
        { id: 'indicator', label: 'Indicator', value: 'Bollinger Bands' },
        { id: 'strategy', label: 'Strategy', value: 'Alpha Momentum' },
        { id: 'amount', label: 'Amount', value: '$25' },
        { id: 'duration', label: 'Duration', value: '1m' },
        { id: 'profit-target', label: 'Profit Target', value: '+$50', valueTone: 'success' },
        { id: 'loss-limit', label: 'Loss Limit', value: '-$30', valueTone: 'loss-limit' },
      ],
    },
    keyPoints: [
      {
        id: 'step3-1',
        text: 'Choose Market Type: Global Indicators or Binolla Market.',
        variant: 'check',
      },
      {
        id: 'step3-2',
        text: 'Select a Trading Pair, Indicator, and Strategy.',
        variant: 'check',
      },
      { id: 'step3-3', text: 'Set Trade Amount and Duration.', variant: 'check' },
      {
        id: 'step3-4',
        text: 'Set Daily Profit Target and Loss Limit.',
        variant: 'check',
      },
      { id: 'step3-5', text: 'Start, Pause, or Stop the bot anytime.', variant: 'check' },
    ],
  },
};

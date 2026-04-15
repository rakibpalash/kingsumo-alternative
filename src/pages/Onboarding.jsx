import React from 'react';
import {
  Page,
  Card,
  BlockStack,
  InlineStack,
  InlineGrid,
  Text,
  Button,
  ProgressBar,
  Box,
  Icon,
  Divider,
} from '@shopify/polaris';
import {
  GiftCardIcon,
  ViewIcon,
  SendIcon,
  CheckCircleIcon,
} from '@shopify/polaris-icons';

// ─── Onboarding Step Card ─────────────────────────────────────────────────────
function OnboardingStep({ number, icon, title, description, done }) {
  return (
    <Card>
      <InlineStack gap="400" blockAlign="start">
        {/* Step number / done icon */}
        <Box
          background={done ? 'bg-fill-success' : 'bg-fill-secondary'}
          borderRadius="full"
          padding="300"
          minWidth="40px"
          minHeight="40px"
        >
          <InlineStack align="center" blockAlign="center">
            {done
              ? <Icon source={CheckCircleIcon} tone="success" />
              : <Text variant="headingSm" as="span" alignment="center">{number}</Text>
            }
          </InlineStack>
        </Box>

        {/* Content */}
        <BlockStack gap="100">
          <InlineStack gap="200" blockAlign="center">
            <Icon source={icon} />
            <Text variant="headingSm" as="h3">{title}</Text>
          </InlineStack>
          <Text variant="bodySm" tone="subdued">{description}</Text>
        </BlockStack>
      </InlineStack>
    </Card>
  );
}

// ─── Onboarding Page ──────────────────────────────────────────────────────────
export default function Onboarding({ onStart }) {
  // Track which steps are conceptually "done" for demo
  const completedSteps = 0;
  const totalSteps = 3;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <Page narrowWidth>
      <BlockStack gap="600">

        {/* ─── Hero ──────────────────────────────────────────────────────── */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="200">
              <Text variant="headingXl" as="h1">Welcome to Viral Giveaway</Text>
              <Text variant="bodyLg" tone="subdued">
                Launch your first giveaway in under 2 minutes and grow your audience organically.
              </Text>
            </BlockStack>

            <Divider />

            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text variant="bodySm" tone="subdued">Getting started</Text>
                <Text variant="bodySm" tone="subdued">{completedSteps}/{totalSteps} steps</Text>
              </InlineStack>
              <ProgressBar progress={progress} size="medium" tone="primary" />
            </BlockStack>
          </BlockStack>
        </Card>

        {/* ─── Steps ─────────────────────────────────────────────────────── */}
        <BlockStack gap="300">
          <OnboardingStep
            number={1}
            icon={GiftCardIcon}
            title="Create your first giveaway"
            description="Set a prize, entry rules, and end date. Your campaign will be live in seconds."
            done={false}
          />
          <OnboardingStep
            number={2}
            icon={ViewIcon}
            title="Enable the entry widget"
            description="Embed a signup widget on your store or share your campaign link directly."
            done={false}
          />
          <OnboardingStep
            number={3}
            icon={SendIcon}
            title="Launch and promote"
            description="Share on social media. Every referral earns bonus entries — driving viral growth."
            done={false}
          />
        </BlockStack>

        {/* ─── CTA ───────────────────────────────────────────────────────── */}
        <InlineStack align="center">
          <Button variant="primary" size="large" onClick={onStart} icon={GiftCardIcon}>
            Create your first giveaway
          </Button>
        </InlineStack>

        {/* ─── Social proof ──────────────────────────────────────────────── */}
        <Card>
          <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
            <BlockStack gap="100">
              <Text variant="headingLg" as="p" alignment="center">12,400+</Text>
              <Text variant="bodySm" tone="subdued" alignment="center">Giveaways launched</Text>
            </BlockStack>
            <BlockStack gap="100">
              <Text variant="headingLg" as="p" alignment="center">2.1M</Text>
              <Text variant="bodySm" tone="subdued" alignment="center">Total entries collected</Text>
            </BlockStack>
            <BlockStack gap="100">
              <Text variant="headingLg" as="p" alignment="center">4.8★</Text>
              <Text variant="bodySm" tone="subdued" alignment="center">Average merchant rating</Text>
            </BlockStack>
          </InlineGrid>
        </Card>

      </BlockStack>
    </Page>
  );
}

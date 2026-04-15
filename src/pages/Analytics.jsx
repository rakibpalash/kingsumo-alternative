import React, { useState } from 'react';
import {
  Page,
  Card,
  BlockStack,
  InlineStack,
  InlineGrid,
  Text,
  Select,
  Divider,
  Box,
  Badge,
  DataTable,
} from '@shopify/polaris';

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, delta, deltaLabel, tone }) {
  const isPositive = delta > 0;
  return (
    <Card>
      <BlockStack gap="200">
        <Text variant="bodySm" tone="subdued">{label}</Text>
        <Text variant="headingXl" as="p">{value}</Text>
        <InlineStack gap="100" blockAlign="center">
          <Badge tone={isPositive ? 'success' : 'critical'}>
            {isPositive ? '↑' : '↓'} {Math.abs(delta)}%
          </Badge>
          <Text variant="bodySm" tone="subdued">{deltaLabel}</Text>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

// ─── Inline Bar Chart ─────────────────────────────────────────────────────────
function InlineBarChart({ data, max }) {
  return (
    <BlockStack gap="200">
      {data.map((item) => (
        <BlockStack gap="100" key={item.label}>
          <InlineStack align="space-between">
            <Text variant="bodySm">{item.label}</Text>
            <Text variant="bodySm" fontWeight="semibold">{item.value.toLocaleString()}</Text>
          </InlineStack>
          <Box background="bg-fill-secondary" borderRadius="full" minHeight="8px">
            <Box
              background="bg-fill-brand"
              borderRadius="full"
              minHeight="8px"
              style={{ width: `${Math.round((item.value / max) * 100)}%` }}
            />
          </Box>
        </BlockStack>
      ))}
    </BlockStack>
  );
}

// ─── Top Referrers Table ──────────────────────────────────────────────────────
const TOP_REFERRERS = [
  { name: 'Alice Johnson', email: 'alice@example.com', referrals: 12, entries: 48 },
  { name: 'Ben Carter', email: 'ben@example.com', referrals: 9, entries: 36 },
  { name: 'Clara Diaz', email: 'clara@example.com', referrals: 7, entries: 28 },
  { name: 'David Kim', email: 'david@example.com', referrals: 5, entries: 20 },
  { name: 'Eva Müller', email: 'eva@example.com', referrals: 3, entries: 12 },
];

// ─── Entry sources data ───────────────────────────────────────────────────────
const ENTRY_SOURCES = [
  { label: 'Email sign-up', value: 3840 },
  { label: 'Referral link', value: 1640 },
  { label: 'Social share', value: 920 },
  { label: 'Product page visit', value: 480 },
  { label: 'Instagram follow', value: 260 },
];
const MAX_SOURCE = Math.max(...ENTRY_SOURCES.map((s) => s.value));

// ─── Analytics Page ───────────────────────────────────────────────────────────
export default function Analytics() {
  const [period, setPeriod] = useState('30d');

  const referrerRows = TOP_REFERRERS.map((r) => [
    r.name,
    r.email,
    r.referrals,
    r.entries,
  ]);

  return (
    <Page
      title="Analytics"
      secondaryActions={[
        {
          content: 'Export report',
          accessibilityLabel: 'Export analytics report',
        },
      ]}
    >
      <BlockStack gap="500">

        {/* ─── Period Filter ─────────────────────────────────────────────── */}
        <InlineStack align="end">
          <Box minWidth="160px">
            <Select
              label="Time period"
              labelHidden
              options={[
                { label: 'Last 7 days', value: '7d' },
                { label: 'Last 30 days', value: '30d' },
                { label: 'Last 90 days', value: '90d' },
                { label: 'All time', value: 'all' },
              ]}
              value={period}
              onChange={setPeriod}
            />
          </Box>
        </InlineStack>

        {/* ─── Key Metrics ───────────────────────────────────────────────── */}
        <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
          <MetricCard
            label="Total Entries"
            value="7,140"
            delta={18}
            deltaLabel="vs last period"
          />
          <MetricCard
            label="Total Shares"
            value="2,436"
            delta={24}
            deltaLabel="vs last period"
          />
          <MetricCard
            label="Conversion Rate"
            value="34.1%"
            delta={-3}
            deltaLabel="vs last period"
          />
        </InlineGrid>

        {/* ─── Two-column section ────────────────────────────────────────── */}
        <InlineGrid columns={{ xs: 1, lg: '3fr 2fr' }} gap="500">

          {/* Entry sources */}
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Entries by source</Text>
              <Text variant="bodySm" tone="subdued">
                Where your participants are coming from.
              </Text>
              <Divider />
              <InlineBarChart data={ENTRY_SOURCES} max={MAX_SOURCE} />
            </BlockStack>
          </Card>

          {/* Quick summary */}
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">Campaign summary</Text>
              <Divider />
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text variant="bodySm" tone="subdued">Active campaigns</Text>
                  <Badge tone="success">1</Badge>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text variant="bodySm" tone="subdued">Completed campaigns</Text>
                  <Text variant="bodyMd">2</Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text variant="bodySm" tone="subdued">Avg. entries per campaign</Text>
                  <Text variant="bodyMd">2,380</Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text variant="bodySm" tone="subdued">Avg. referrals per entry</Text>
                  <Text variant="bodyMd">0.34</Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text variant="bodySm" tone="subdued">Best performing campaign</Text>
                  <Text variant="bodyMd" fontWeight="semibold">Black Friday</Text>
                </InlineStack>
              </BlockStack>
            </BlockStack>
          </Card>

        </InlineGrid>

        {/* ─── Top Referrers ─────────────────────────────────────────────── */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Top referrers</Text>
            <Text variant="bodySm" tone="subdued">
              Your most valuable participants — reward them to amplify word-of-mouth.
            </Text>
            <DataTable
              columnContentTypes={['text', 'text', 'numeric', 'numeric']}
              headings={['Name', 'Email', 'Referrals', 'Bonus Entries']}
              rows={referrerRows}
              hoverable
            />
          </BlockStack>
        </Card>

      </BlockStack>
    </Page>
  );
}

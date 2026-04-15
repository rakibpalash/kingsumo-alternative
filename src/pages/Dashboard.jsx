import React, { useState, useCallback } from 'react';
import {
  Page,
  Card,
  DataTable,
  Badge,
  Button,
  EmptyState,
  InlineStack,
  BlockStack,
  Text,
  ButtonGroup,
  Divider,
  Box,
  InlineGrid,
} from '@shopify/polaris';
import { GiftCardIcon, DeleteIcon, EditIcon, ViewIcon } from '@shopify/polaris-icons';

// ─── Sample Data ─────────────────────────────────────────────────────────────
const SAMPLE_CAMPAIGNS = [
  {
    id: '1',
    name: 'Spring Flash Giveaway',
    status: 'active',
    entries: 1284,
    shares: 432,
    endDate: '2026-05-01',
  },
  {
    id: '2',
    name: 'Product Launch Contest',
    status: 'ended',
    entries: 3620,
    shares: 1180,
    endDate: '2026-03-15',
  },
  {
    id: '3',
    name: 'Black Friday Bonanza',
    status: 'ended',
    entries: 8741,
    shares: 3290,
    endDate: '2025-11-29',
  },
];

// ─── Stats Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <Card>
      <BlockStack gap="100">
        <Text variant="bodySm" tone="subdued">{label}</Text>
        <Text variant="headingXl" as="p">{value}</Text>
        {sub && <Text variant="bodySm" tone="subdued">{sub}</Text>}
      </BlockStack>
    </Card>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function Dashboard({ onCreateNew, onViewCampaign, showToast }) {
  const [campaigns, setCampaigns] = useState(SAMPLE_CAMPAIGNS);

  const handleDelete = useCallback((id) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    showToast?.('Campaign deleted');
  }, [showToast]);

  // ─── Aggregate Stats ─────────────────────────────────────────────────────
  const totalEntries = campaigns.reduce((s, c) => s + c.entries, 0);
  const totalShares = campaigns.reduce((s, c) => s + c.shares, 0);
  const convRate =
    totalEntries > 0
      ? `${((totalShares / totalEntries) * 100).toFixed(1)}%`
      : '0%';

  // ─── DataTable Rows ───────────────────────────────────────────────────────
  const rows = campaigns.map((c) => [
    // Campaign name
    <Text variant="bodyMd" fontWeight="semibold">{c.name}</Text>,

    // Status badge
    <Badge tone={c.status === 'active' ? 'success' : 'info'}>
      {c.status === 'active' ? 'Active' : 'Ended'}
    </Badge>,

    // Entries
    c.entries.toLocaleString(),

    // Actions
    <ButtonGroup>
      <Button
        size="slim"
        icon={ViewIcon}
        onClick={() => onViewCampaign(c)}
        accessibilityLabel={`View ${c.name}`}
      >
        View
      </Button>
      <Button
        size="slim"
        icon={DeleteIcon}
        tone="critical"
        onClick={() => handleDelete(c.id)}
        accessibilityLabel={`Delete ${c.name}`}
      >
        Delete
      </Button>
    </ButtonGroup>,
  ]);

  // ─── Empty State ─────────────────────────────────────────────────────────
  if (campaigns.length === 0) {
    return (
      <Page title="Giveaways" primaryAction={{ content: 'Create Giveaway', onAction: onCreateNew, icon: GiftCardIcon }}>
        <Card>
          <EmptyState
            heading="No giveaways yet"
            action={{ content: 'Create your first giveaway', onAction: onCreateNew }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Launch a viral giveaway campaign in under 2 minutes and grow your audience fast.</p>
          </EmptyState>
        </Card>
      </Page>
    );
  }

  return (
    <Page
      title="Giveaways"
      primaryAction={{
        content: 'Create Giveaway',
        onAction: onCreateNew,
        icon: GiftCardIcon,
      }}
    >
      <BlockStack gap="500">

        {/* ─── Stats Row ────────────────────────────────────────────────── */}
        <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
          <StatCard label="Total Entries" value={totalEntries.toLocaleString()} sub="All campaigns" />
          <StatCard label="Total Shares" value={totalShares.toLocaleString()} sub="Referral actions" />
          <StatCard label="Conversion Rate" value={convRate} sub="Shares ÷ Entries" />
        </InlineGrid>

        {/* ─── Campaigns Table ──────────────────────────────────────────── */}
        <Card>
          <BlockStack gap="400">
            <Box paddingBlockStart="0">
              <Text variant="headingMd" as="h2">Campaigns</Text>
            </Box>
            <DataTable
              columnContentTypes={['text', 'text', 'numeric', 'text']}
              headings={['Campaign', 'Status', 'Entries', 'Actions']}
              rows={rows}
              hoverable
            />
          </BlockStack>
        </Card>

      </BlockStack>
    </Page>
  );
}

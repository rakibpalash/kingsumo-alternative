import React, { useState, useCallback } from 'react';
import {
  Page,
  Card,
  Tabs,
  DataTable,
  Badge,
  Button,
  BlockStack,
  InlineStack,
  InlineGrid,
  Text,
  Banner,
  Modal,
  Divider,
  Box,
  Avatar,
} from '@shopify/polaris';
import { ConfettiIcon, ExportIcon } from '@shopify/polaris-icons';

// ─── Sample Entries ───────────────────────────────────────────────────────────
const SAMPLE_ENTRIES = [
  { id: 'e1', name: 'Alice Johnson', email: 'alice@example.com', entries: 9, referred: 3 },
  { id: 'e2', name: 'Ben Carter', email: 'ben@example.com', entries: 7, referred: 2 },
  { id: 'e3', name: 'Clara Diaz', email: 'clara@example.com', entries: 5, referred: 1 },
  { id: 'e4', name: 'David Kim', email: 'david@example.com', entries: 4, referred: 1 },
  { id: 'e5', name: 'Eva Müller', email: 'eva@example.com', entries: 3, referred: 0 },
  { id: 'e6', name: 'Felix Wang', email: 'felix@example.com', entries: 2, referred: 0 },
];

const SAMPLE_REFERRALS = [
  { id: 'r1', referrer: 'Alice Johnson', referrerEmail: 'alice@example.com', invited: 3, converted: 2 },
  { id: 'r2', referrer: 'Ben Carter', referrerEmail: 'ben@example.com', invited: 2, converted: 2 },
  { id: 'r3', referrer: 'Clara Diaz', referrerEmail: 'clara@example.com', invited: 1, converted: 1 },
  { id: 'r4', referrer: 'David Kim', referrerEmail: 'david@example.com', invited: 1, converted: 0 },
];

// ─── Stats Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, tone }) {
  return (
    <Card>
      <BlockStack gap="100">
        <Text variant="bodySm" tone="subdued">{label}</Text>
        <Text variant="headingXl" as="p" tone={tone}>{value}</Text>
        {sub && <Text variant="bodySm" tone="subdued">{sub}</Text>}
      </BlockStack>
    </Card>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ campaign, onPickWinner }) {
  const totalEntries = SAMPLE_ENTRIES.reduce((s, e) => s + e.entries, 0);
  const totalShares = SAMPLE_REFERRALS.reduce((s, r) => s + r.invited, 0);
  const convRate = totalEntries > 0
    ? `${((totalShares / totalEntries) * 100).toFixed(1)}%`
    : '0%';

  return (
    <BlockStack gap="400">
      {campaign?.status === 'active' && (
        <Banner tone="info">
          This campaign is live. Winners can be picked once the campaign ends.
        </Banner>
      )}
      {campaign?.status === 'ended' && (
        <Banner tone="success">
          This campaign has ended. You can now pick a winner.
        </Banner>
      )}

      {/* Stats */}
      <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
        <StatCard label="Total Entries" value={totalEntries.toLocaleString()} sub="All participants" />
        <StatCard label="Total Shares" value={totalShares.toLocaleString()} sub="Social & referral" />
        <StatCard label="Conversion Rate" value={convRate} sub="Shares ÷ Entries" />
      </InlineGrid>

      {/* Pick winner action */}
      <Card>
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="100">
            <Text variant="headingMd" as="h3">Pick a winner</Text>
            <Text variant="bodySm" tone="subdued">
              Select one random winner from all eligible entries.
            </Text>
          </BlockStack>
          <Button
            icon={ConfettiIcon}
            variant="primary"
            onClick={onPickWinner}
            disabled={campaign?.status === 'active'}
          >
            Pick Winner
          </Button>
        </InlineStack>
      </Card>
    </BlockStack>
  );
}

// ─── Entries Tab ─────────────────────────────────────────────────────────────
function EntriesTab() {
  const rows = SAMPLE_ENTRIES.map((e) => [
    <InlineStack gap="200" blockAlign="center">
      <Avatar customer size="extraSmall" name={e.name} initials={e.name.slice(0,2)} />
      <Text variant="bodyMd">{e.name}</Text>
    </InlineStack>,
    e.email,
    e.entries,
    e.referred,
  ]);

  return (
    <BlockStack gap="400">
      <InlineStack align="space-between">
        <Text variant="bodySm" tone="subdued">{SAMPLE_ENTRIES.length} participants</Text>
        <Button icon={ExportIcon} size="slim" variant="plain">Export CSV</Button>
      </InlineStack>
      <DataTable
        columnContentTypes={['text', 'text', 'numeric', 'numeric']}
        headings={['Participant', 'Email', 'Entries', 'Referred']}
        rows={rows}
        sortable={[false, false, true, true]}
        hoverable
      />
    </BlockStack>
  );
}

// ─── Referrals Tab ────────────────────────────────────────────────────────────
function ReferralsTab() {
  const rows = SAMPLE_REFERRALS.map((r) => [
    r.referrer,
    r.referrerEmail,
    r.invited,
    <Badge tone={r.converted === r.invited ? 'success' : 'info'}>
      {r.converted}/{r.invited}
    </Badge>,
  ]);

  return (
    <BlockStack gap="400">
      <Text variant="bodySm" tone="subdued">
        Shows who referred others and how many of those invites converted.
      </Text>
      <DataTable
        columnContentTypes={['text', 'text', 'numeric', 'text']}
        headings={['Referrer', 'Email', 'Invited', 'Converted']}
        rows={rows}
        hoverable
      />
    </BlockStack>
  );
}

// ─── Campaign Detail Page ─────────────────────────────────────────────────────
export default function CampaignDetail({ campaign, onBack, showToast }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [winner, setWinner] = useState(null);

  // Fallback campaign data
  const camp = campaign || {
    id: '1',
    name: 'Spring Flash Giveaway',
    status: 'ended',
    entries: 1284,
    shares: 432,
  };

  const handlePickWinner = useCallback(() => {
    // Weighted random draw by entry count
    const random = SAMPLE_ENTRIES[Math.floor(Math.random() * SAMPLE_ENTRIES.length)];
    setWinner(random);
    setWinnerModalOpen(true);
  }, []);

  const handleConfirmWinner = useCallback(() => {
    setWinnerModalOpen(false);
    showToast?.(`Winner selected: ${winner?.name}`);
  }, [winner, showToast]);

  const tabs = [
    { id: 'overview', content: 'Overview', panelID: 'overview-panel' },
    { id: 'entries', content: `Entries (${SAMPLE_ENTRIES.length})`, panelID: 'entries-panel' },
    { id: 'referrals', content: `Referrals (${SAMPLE_REFERRALS.length})`, panelID: 'referrals-panel' },
  ];

  return (
    <Page
      title={camp.name}
      backAction={{ content: 'Giveaways', onAction: onBack }}
      titleMetadata={
        <Badge tone={camp.status === 'active' ? 'success' : 'info'}>
          {camp.status === 'active' ? 'Active' : 'Ended'}
        </Badge>
      }
    >
      <BlockStack gap="400">
        <Card padding="0">
          <Tabs
            tabs={tabs}
            selected={selectedTab}
            onSelect={setSelectedTab}
          >
            <Box padding="400">
              {selectedTab === 0 && (
                <OverviewTab campaign={camp} onPickWinner={handlePickWinner} />
              )}
              {selectedTab === 1 && <EntriesTab />}
              {selectedTab === 2 && <ReferralsTab />}
            </Box>
          </Tabs>
        </Card>
      </BlockStack>

      {/* ─── Pick Winner Modal ─────────────────────────────────────────────── */}
      <Modal
        open={winnerModalOpen}
        onClose={() => setWinnerModalOpen(false)}
        title="Winner selected!"
        primaryAction={{ content: 'Confirm & notify winner', onAction: handleConfirmWinner }}
        secondaryActions={[{ content: 'Re-draw', onAction: handlePickWinner }]}
      >
        <Modal.Section>
          {winner && (
            <BlockStack gap="400">
              <Banner tone="success">
                Congratulations! A winner has been randomly selected from all eligible entries.
              </Banner>
              <Card>
                <InlineStack gap="400" blockAlign="center">
                  <Avatar size="large" name={winner.name} initials={winner.name.slice(0,2)} />
                  <BlockStack gap="100">
                    <Text variant="headingMd">{winner.name}</Text>
                    <Text variant="bodySm" tone="subdued">{winner.email}</Text>
                    <Text variant="bodySm">{winner.entries} total entries</Text>
                  </BlockStack>
                </InlineStack>
              </Card>
              <Text variant="bodySm" tone="subdued">
                Confirming will send the winner a notification email with instructions to claim their prize.
              </Text>
            </BlockStack>
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}

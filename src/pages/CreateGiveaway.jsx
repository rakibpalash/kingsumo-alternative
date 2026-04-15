import React, { useState, useCallback } from 'react';
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Select,
  Checkbox,
  DatePicker,
  Button,
  ButtonGroup,
  BlockStack,
  InlineStack,
  Text,
  Banner,
  ProgressBar,
  Divider,
  Box,
  RadioButton,
  Thumbnail,
  ResourceList,
  ResourceItem,
  Badge,
  InlineGrid,
} from '@shopify/polaris';
import { GiftCardIcon, ImageIcon } from '@shopify/polaris-icons';

// ─── Step Metadata ───────────────────────────────────────────────────────────
const STEPS = [
  { title: 'Basic Info', description: 'Name your campaign' },
  { title: 'Prize', description: 'Choose a prize product' },
  { title: 'Entry Rules', description: 'How people enter' },
  { title: 'Reward', description: 'Winner discount (optional)' },
  { title: 'Review', description: 'Publish your giveaway' },
];

// ─── Sample Products ─────────────────────────────────────────────────────────
const SAMPLE_PRODUCTS = [
  { id: 'p1', title: 'Premium Wireless Headphones', price: '$149.00', image: '' },
  { id: 'p2', title: 'Leather Tote Bag', price: '$89.00', image: '' },
  { id: 'p3', title: 'Smart Watch Series X', price: '$299.00', image: '' },
  { id: 'p4', title: 'Scented Candle Set', price: '$45.00', image: '' },
];

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ current, total }) {
  const progress = Math.round((current / total) * 100);
  return (
    <BlockStack gap="200">
      <InlineStack align="space-between">
        <Text variant="bodySm" tone="subdued">
          Step {current} of {total} — {STEPS[current - 1].title}
        </Text>
        <Text variant="bodySm" tone="subdued">{progress}% complete</Text>
      </InlineStack>
      <ProgressBar progress={progress} size="small" tone="primary" />
    </BlockStack>
  );
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────
function StepBasicInfo({ data, onChange, errors }) {
  const [{ month, year }, setDateNav] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [selectedDates, setSelectedDates] = useState(
    data.endDate || { start: new Date(), end: new Date() }
  );

  const handleDateChange = (dates) => {
    setSelectedDates(dates);
    onChange('endDate', dates);
  };

  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">Campaign basics</Text>
      <Text variant="bodySm" tone="subdued">
        Give your giveaway a clear name. Entrants will see this on the entry page.
      </Text>
      <FormLayout>
        <TextField
          label="Campaign name"
          value={data.name}
          onChange={(v) => onChange('name', v)}
          placeholder="e.g. Summer Flash Giveaway"
          error={errors.name}
          autoComplete="off"
          helpText="Keep it short and exciting — under 60 characters."
          maxLength={60}
          showCharacterCount
        />
        <TextField
          label="Description"
          value={data.description}
          onChange={(v) => onChange('description', v)}
          placeholder="Tell entrants what they can win and why they should join…"
          multiline={3}
          error={errors.description}
          autoComplete="off"
          helpText="Optional but improves conversion. Max 250 characters."
          maxLength={250}
          showCharacterCount
        />
      </FormLayout>

      <Divider />

      <BlockStack gap="300">
        <Text variant="headingMd" as="h3">End date</Text>
        <Text variant="bodySm" tone="subdued">
          The giveaway automatically closes at midnight on this day.
        </Text>
        <DatePicker
          month={month}
          year={year}
          onChange={handleDateChange}
          onMonthChange={(m, y) => setDateNav({ month: m, year: y })}
          selected={selectedDates}
          disableDatesBefore={new Date()}
        />
      </BlockStack>
    </BlockStack>
  );
}

// ─── Step 2: Prize Selection ──────────────────────────────────────────────────
function StepPrize({ data, onChange, errors }) {
  const [selectedId, setSelectedId] = useState(data.prizeProductId || null);

  const handleSelect = (id) => {
    setSelectedId(id);
    onChange('prizeProductId', id);
  };

  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">Select a prize product</Text>
      <Text variant="bodySm" tone="subdued">
        Pick one product from your store to give away. The winner receives this item for free.
      </Text>

      {errors.prizeProductId && (
        <Banner tone="critical">{errors.prizeProductId}</Banner>
      )}

      <ResourceList
        resourceName={{ singular: 'product', plural: 'products' }}
        items={SAMPLE_PRODUCTS}
        renderItem={(item) => (
          <ResourceItem
            id={item.id}
            media={
              <Thumbnail
                source={item.image || ImageIcon}
                alt={item.title}
                size="small"
              />
            }
            onClick={() => handleSelect(item.id)}
            shortcutActions={[
              {
                content: selectedId === item.id ? 'Selected' : 'Select',
                onAction: () => handleSelect(item.id),
              },
            ]}
          >
            <InlineStack align="space-between">
              <BlockStack gap="050">
                <Text variant="bodyMd" fontWeight="semibold">{item.title}</Text>
                <Text variant="bodySm" tone="subdued">{item.price}</Text>
              </BlockStack>
              {selectedId === item.id && (
                <Badge tone="success">Prize</Badge>
              )}
            </InlineStack>
          </ResourceItem>
        )}
      />
    </BlockStack>
  );
}

// ─── Step 3: Entry Rules ──────────────────────────────────────────────────────
function StepEntryRules({ data, onChange }) {
  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">Entry rules</Text>
      <Text variant="bodySm" tone="subdued">
        Choose how participants earn entries. More ways = more virality.
      </Text>

      <Card>
        <BlockStack gap="300">
          <Text variant="headingSm" as="h3">Required</Text>
          <Checkbox
            label="Email sign-up (always required)"
            checked
            disabled
            helpText="Every participant must provide their email to enter."
          />
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="300">
          <Text variant="headingSm" as="h3">Bonus entries</Text>
          <Checkbox
            label="Share on social media (+2 entries)"
            checked={data.shareBonus}
            onChange={(v) => onChange('shareBonus', v)}
            helpText="Entrants share your campaign link to earn bonus entries."
          />
          <Checkbox
            label="Refer a friend (+3 entries per referral)"
            checked={data.referralBonus}
            onChange={(v) => onChange('referralBonus', v)}
            helpText="Each successful referral earns the referrer extra entries."
          />
          <Checkbox
            label="Visit product page (+1 entry)"
            checked={data.visitBonus}
            onChange={(v) => onChange('visitBonus', v)}
            helpText="Entrants visit your product page to earn an entry."
          />
          <Checkbox
            label="Follow on Instagram (+1 entry)"
            checked={data.followBonus}
            onChange={(v) => onChange('followBonus', v)}
            helpText="Entrants follow your Instagram account to earn an entry."
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

// ─── Step 4: Reward ───────────────────────────────────────────────────────────
function StepReward({ data, onChange }) {
  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">Winner reward</Text>
      <Text variant="bodySm" tone="subdued">
        Optionally send all participants a consolation discount to boost conversions.
      </Text>

      <Card>
        <BlockStack gap="300">
          <RadioButton
            label="No consolation reward"
            helpText="Only the prize winner receives anything."
            checked={data.rewardType === 'none'}
            id="reward-none"
            name="rewardType"
            onChange={() => onChange('rewardType', 'none')}
          />
          <RadioButton
            label="Discount code for all participants"
            helpText="Everyone who enters gets a discount code after the giveaway ends."
            checked={data.rewardType === 'discount'}
            id="reward-discount"
            name="rewardType"
            onChange={() => onChange('rewardType', 'discount')}
          />
        </BlockStack>
      </Card>

      {data.rewardType === 'discount' && (
        <Card>
          <FormLayout>
            <Select
              label="Discount type"
              options={[
                { label: 'Percentage off', value: 'percentage' },
                { label: 'Fixed amount off', value: 'fixed' },
                { label: 'Free shipping', value: 'shipping' },
              ]}
              value={data.discountType || 'percentage'}
              onChange={(v) => onChange('discountType', v)}
            />
            {data.discountType !== 'shipping' && (
              <TextField
                label="Discount value"
                type="number"
                value={data.discountValue || ''}
                onChange={(v) => onChange('discountValue', v)}
                suffix={data.discountType === 'percentage' ? '%' : '$'}
                min={1}
                autoComplete="off"
                helpText="Applied automatically when participants use the code."
              />
            )}
          </FormLayout>
        </Card>
      )}
    </BlockStack>
  );
}

// ─── Step 5: Review ───────────────────────────────────────────────────────────
function StepReview({ data }) {
  const prize = SAMPLE_PRODUCTS.find((p) => p.id === data.prizeProductId);
  const bonuses = [
    data.shareBonus && 'Share on social (+2)',
    data.referralBonus && 'Refer a friend (+3)',
    data.visitBonus && 'Visit product page (+1)',
    data.followBonus && 'Follow on Instagram (+1)',
  ].filter(Boolean);

  const ReviewRow = ({ label, value }) => (
    <InlineStack align="space-between" gap="200">
      <Text variant="bodySm" tone="subdued">{label}</Text>
      <Text variant="bodyMd">{value}</Text>
    </InlineStack>
  );

  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">Review & publish</Text>
      <Text variant="bodySm" tone="subdued">
        Double-check your settings before going live. You can edit anytime after publishing.
      </Text>

      <Banner tone="info">
        Your giveaway will go live immediately after publishing.
      </Banner>

      <Card>
        <BlockStack gap="300">
          <Text variant="headingSm" as="h3">Campaign details</Text>
          <ReviewRow label="Name" value={data.name || '—'} />
          <ReviewRow label="Description" value={data.description || 'None'} />
          <ReviewRow
            label="End date"
            value={
              data.endDate?.start
                ? data.endDate.start.toLocaleDateString()
                : '—'
            }
          />
          <Divider />
          <ReviewRow label="Prize" value={prize ? prize.title : '—'} />
          <ReviewRow
            label="Bonus entry methods"
            value={bonuses.length > 0 ? bonuses.join(', ') : 'Email only'}
          />
          <ReviewRow
            label="Consolation reward"
            value={
              data.rewardType === 'discount'
                ? `${data.discountValue || '?'}${data.discountType === 'percentage' ? '% off' : ' off'}`
                : 'None'
            }
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

// ─── Create Giveaway (Multi-step) ─────────────────────────────────────────────
export default function CreateGiveaway({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endDate: null,
    prizeProductId: null,
    shareBonus: true,
    referralBonus: true,
    visitBonus: false,
    followBonus: false,
    rewardType: 'none',
    discountType: 'percentage',
    discountValue: '10',
  });

  const updateField = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  // ─── Validation per step ────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Campaign name is required.';
      if (!formData.endDate) newErrors.endDate = 'Please select an end date.';
    }
    if (step === 2) {
      if (!formData.prizeProductId) newErrors.prizeProductId = 'Please select a prize product.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step < STEPS.length) setStep((s) => s + 1);
    else onComplete();
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else onCancel();
  };

  // ─── Render Active Step ─────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 1: return <StepBasicInfo data={formData} onChange={updateField} errors={errors} />;
      case 2: return <StepPrize data={formData} onChange={updateField} errors={errors} />;
      case 3: return <StepEntryRules data={formData} onChange={updateField} />;
      case 4: return <StepReward data={formData} onChange={updateField} />;
      case 5: return <StepReview data={formData} />;
      default: return null;
    }
  };

  return (
    <Page
      title="Create Giveaway"
      backAction={{ content: 'Giveaways', onAction: onCancel }}
      narrowWidth
    >
      <BlockStack gap="500">

        {/* ─── Progress ─────────────────────────────────────────────────── */}
        <Card>
          <StepIndicator current={step} total={STEPS.length} />
        </Card>

        {/* ─── Active Step Content ───────────────────────────────────────── */}
        <Card>
          {renderStep()}
        </Card>

        {/* ─── Navigation ───────────────────────────────────────────────── */}
        <InlineStack align="space-between">
          <Button onClick={handleBack} variant="plain">
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={handleNext}
            variant="primary"
            icon={step === STEPS.length ? undefined : undefined}
          >
            {step === STEPS.length ? 'Publish Giveaway' : 'Continue'}
          </Button>
        </InlineStack>

      </BlockStack>
    </Page>
  );
}

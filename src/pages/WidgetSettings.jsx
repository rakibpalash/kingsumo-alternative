import React, { useState, useCallback } from 'react';
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Select,
  Checkbox,
  BlockStack,
  InlineStack,
  InlineGrid,
  Text,
  Button,
  Divider,
  ColorPicker,
  Box,
  Banner,
  RangeSlider,
  Badge,
} from '@shopify/polaris';

// ─── Widget Preview ───────────────────────────────────────────────────────────
function WidgetPreview({ buttonText, buttonColor, widgetType }) {
  // Convert HSB to CSS hex (simplified)
  const hsl = `hsl(${Math.round(buttonColor.hue)}, ${Math.round(buttonColor.saturation * 100)}%, ${Math.round(buttonColor.brightness * 50)}%)`;

  if (widgetType === 'embed') {
    return (
      <Box
        background="bg-fill-secondary"
        borderRadius="200"
        padding="400"
        borderWidth="025"
        borderColor="border"
      >
        <BlockStack gap="300">
          <Text variant="bodySm" tone="subdued" alignment="center">Embedded widget preview</Text>
          <Box
            background="bg-fill"
            borderRadius="200"
            padding="400"
            shadow="100"
          >
            <BlockStack gap="300">
              <Text variant="headingSm" as="h3" alignment="center">Enter the Giveaway</Text>
              <Text variant="bodySm" tone="subdued" alignment="center">
                Win amazing prizes — enter with your email below.
              </Text>
              <Box
                borderRadius="100"
                padding="200"
                style={{ backgroundColor: hsl, textAlign: 'center', color: '#fff', cursor: 'pointer' }}
              >
                <Text variant="bodyMd" fontWeight="semibold">
                  {buttonText || 'Enter Now'}
                </Text>
              </Box>
            </BlockStack>
          </Box>
        </BlockStack>
      </Box>
    );
  }

  return (
    <Box
      background="bg-fill-secondary"
      borderRadius="200"
      padding="400"
      borderWidth="025"
      borderColor="border"
    >
      <BlockStack gap="300">
        <Text variant="bodySm" tone="subdued" alignment="center">Popup widget preview</Text>
        <Box
          background="bg-fill"
          borderRadius="200"
          padding="500"
          shadow="300"
          style={{ maxWidth: '280px', margin: '0 auto' }}
        >
          <BlockStack gap="300">
            <Text variant="headingSm" as="h3">Win a Prize! 🎁</Text>
            <Text variant="bodySm" tone="subdued">
              Enter your email to join the giveaway.
            </Text>
            <Box
              borderRadius="100"
              padding="200"
              style={{ backgroundColor: hsl, textAlign: 'center', color: '#fff', cursor: 'pointer' }}
            >
              <Text variant="bodyMd" fontWeight="semibold">
                {buttonText || 'Enter Now'}
              </Text>
            </Box>
          </BlockStack>
        </Box>
      </BlockStack>
    </Box>
  );
}

// ─── Widget Settings Page ─────────────────────────────────────────────────────
export default function WidgetSettings({ showToast }) {
  // ─── Display Settings ─────────────────────────────────────────────────
  const [widgetType, setWidgetType] = useState('popup');
  const [showOnAllPages, setShowOnAllPages] = useState(true);
  const [showOnMobile, setShowOnMobile] = useState(true);
  const [delaySeconds, setDelaySeconds] = useState(3);

  // ─── Style Settings ───────────────────────────────────────────────────
  const [buttonText, setButtonText] = useState('Enter Now');
  const [buttonColor, setButtonColor] = useState({
    hue: 262,
    saturation: 0.82,
    brightness: 0.65,
    alpha: 1,
  });

  const handleSave = useCallback(() => {
    showToast?.('Widget settings saved');
  }, [showToast]);

  return (
    <Page
      title="Widget Settings"
      primaryAction={{ content: 'Save settings', onAction: handleSave }}
    >
      <InlineGrid columns={{ xs: 1, lg: '2fr 1fr' }} gap="500">

        {/* ─── Settings Column ─────────────────────────────────────────── */}
        <BlockStack gap="500">

          {/* Display */}
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Display settings</Text>

              <FormLayout>
                <Select
                  label="Widget type"
                  options={[
                    { label: 'Popup — appears over the page', value: 'popup' },
                    { label: 'Embed — inline inside a page section', value: 'embed' },
                  ]}
                  value={widgetType}
                  onChange={setWidgetType}
                  helpText="Popup works for most stores. Use embed for a dedicated landing page."
                />

                <Checkbox
                  label="Show on all pages"
                  checked={showOnAllPages}
                  onChange={setShowOnAllPages}
                  helpText="If unchecked, the widget only appears on your home page."
                />

                <Checkbox
                  label="Show on mobile devices"
                  checked={showOnMobile}
                  onChange={setShowOnMobile}
                />
              </FormLayout>

              {widgetType === 'popup' && (
                <>
                  <Divider />
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3">Popup delay</Text>
                    <Text variant="bodySm" tone="subdued">
                      Wait before showing the popup after the page loads.
                    </Text>
                    <RangeSlider
                      label={`Delay: ${delaySeconds} seconds`}
                      min={0}
                      max={15}
                      step={1}
                      value={delaySeconds}
                      onChange={setDelaySeconds}
                      output
                    />
                  </BlockStack>
                </>
              )}
            </BlockStack>
          </Card>

          {/* Styles */}
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Style settings</Text>

              <FormLayout>
                <TextField
                  label="Button text"
                  value={buttonText}
                  onChange={setButtonText}
                  placeholder="Enter Now"
                  maxLength={30}
                  showCharacterCount
                  autoComplete="off"
                  helpText="Call-to-action shown on the entry button."
                />
              </FormLayout>

              <BlockStack gap="200">
                <Text variant="headingSm" as="h3">Button color</Text>
                <Text variant="bodySm" tone="subdued">
                  Choose a brand color that stands out on your storefront.
                </Text>
                <ColorPicker
                  onChange={setButtonColor}
                  color={buttonColor}
                  allowAlpha={false}
                />
              </BlockStack>
            </BlockStack>
          </Card>

          {/* Embed snippet */}
          {widgetType === 'embed' && (
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h2">Embed snippet</Text>
                  <Badge tone="info">Copy & paste</Badge>
                </InlineStack>
                <Banner tone="info">
                  Paste this snippet where you want the widget to appear in your theme.
                </Banner>
                <Box
                  background="bg-fill-secondary"
                  borderRadius="100"
                  padding="300"
                >
                  <Text variant="bodySm" as="code">
                    {'<div id="viral-giveaway-widget" data-shop="your-store.myshopify.com"></div>'}
                  </Text>
                </Box>
                <Button variant="plain" size="slim">Copy snippet</Button>
              </BlockStack>
            </Card>
          )}

        </BlockStack>

        {/* ─── Preview Column ───────────────────────────────────────────── */}
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">Live preview</Text>
              <Text variant="bodySm" tone="subdued">
                Updates as you change settings.
              </Text>
              <WidgetPreview
                buttonText={buttonText}
                buttonColor={buttonColor}
                widgetType={widgetType}
              />
            </BlockStack>
          </Card>
        </BlockStack>

      </InlineGrid>
    </Page>
  );
}

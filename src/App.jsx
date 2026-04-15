import React, { useState, useCallback } from 'react';
import {
  AppProvider,
  Frame,
  Navigation,
  TopBar,
  Toast,
} from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import {
  HomeIcon,
  GiftCardIcon,
  ChartLineIcon,
  SettingsIcon,
  QuestionCircleIcon,
} from '@shopify/polaris-icons';

import Dashboard from './pages/Dashboard';
import CreateGiveaway from './pages/CreateGiveaway';
import CampaignDetail from './pages/CampaignDetail';
import Onboarding from './pages/Onboarding';
import WidgetSettings from './pages/WidgetSettings';
import Analytics from './pages/Analytics';

// ─── App Shell ──────────────────────────────────────────────────────────────
export default function App() {
  const [currentPage, setCurrentPage] = useState('onboarding');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const [userMenuActive, setUserMenuActive] = useState(false);
  const [toastProps, setToastProps] = useState(null);

  const navigate = useCallback((page, data = null) => {
    setSelectedCampaign(data);
    setCurrentPage(page);
    setMobileNavActive(false);
  }, []);

  const showToast = useCallback((message, isError = false) => {
    setToastProps({ message, isError });
  }, []);

  // ─── Top Bar ──────────────────────────────────────────────────────────────
  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={
        <TopBar.UserMenu
          actions={[
            {
              items: [
                { content: 'Help center', icon: QuestionCircleIcon },
              ],
            },
          ]}
          name="My Store"
          detail="viral-giveaway.myshopify.com"
          initials="MS"
          open={userMenuActive}
          onToggle={() => setUserMenuActive((v) => !v)}
        />
      }
      onNavigationToggle={() => setMobileNavActive((v) => !v)}
    />
  );

  // ─── Side Nav ─────────────────────────────────────────────────────────────
  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            label: 'Dashboard',
            icon: HomeIcon,
            onClick: () => navigate('dashboard'),
            selected: currentPage === 'dashboard',
          },
          {
            label: 'Giveaways',
            icon: GiftCardIcon,
            onClick: () => navigate('dashboard'),
            selected: ['dashboard', 'create', 'detail'].includes(currentPage),
          },
          {
            label: 'Analytics',
            icon: ChartLineIcon,
            onClick: () => navigate('analytics'),
            selected: currentPage === 'analytics',
          },
          {
            label: 'Widget Settings',
            icon: SettingsIcon,
            onClick: () => navigate('widget'),
            selected: currentPage === 'widget',
          },
        ]}
      />
    </Navigation>
  );

  // ─── Page Router ──────────────────────────────────────────────────────────
  const renderPage = () => {
    switch (currentPage) {
      case 'onboarding':
        return <Onboarding onStart={() => navigate('create')} />;
      case 'dashboard':
        return (
          <Dashboard
            onCreateNew={() => navigate('create')}
            onViewCampaign={(campaign) => navigate('detail', campaign)}
            showToast={showToast}
          />
        );
      case 'create':
        return (
          <CreateGiveaway
            onComplete={() => { showToast('Giveaway published!'); navigate('dashboard'); }}
            onCancel={() => navigate('dashboard')}
          />
        );
      case 'detail':
        return (
          <CampaignDetail
            campaign={selectedCampaign}
            onBack={() => navigate('dashboard')}
            showToast={showToast}
          />
        );
      case 'analytics':
        return <Analytics />;
      case 'widget':
        return <WidgetSettings showToast={showToast} />;
      default:
        return <Dashboard onCreateNew={() => navigate('create')} />;
    }
  };

  return (
    <AppProvider i18n={enTranslations}>
      <Frame
        topBar={topBarMarkup}
        navigation={navigationMarkup}
        showMobileNavigation={mobileNavActive}
        onNavigationDismiss={() => setMobileNavActive(false)}
      >
        {renderPage()}
        {toastProps && (
          <Toast
            content={toastProps.message}
            error={toastProps.isError}
            onDismiss={() => setToastProps(null)}
          />
        )}
      </Frame>
    </AppProvider>
  );
}

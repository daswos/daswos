import React from 'react';
import SubscriptionAwareAiSearchToggle from './subscription-aware-ai-search-toggle';
import { useAdminSettings } from '@/hooks/use-admin-settings';

interface FeatureAwareAiSearchToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
  showDropdown?: boolean;
  onDropdownToggle?: () => void;
}

const FeatureAwareAiSearchToggle: React.FC<FeatureAwareAiSearchToggleProps> = ({
  isEnabled,
  onToggle,
  className = '',
  showDropdown = false,
  onDropdownToggle = () => {}
}) => {
  const { settings, loading } = useAdminSettings();

  // If settings are still loading, don't render anything
  if (loading) {
    return null;
  }

  // If Daswos AI is disabled in admin settings, don't render the toggle
  if (!settings.aiShopperEnabled) {
    return null;
  }

  // Otherwise, render the subscription-aware toggle that will check for proper subscription
  return (
    <SubscriptionAwareAiSearchToggle
      isEnabled={isEnabled}
      onToggle={onToggle}
      className={className}
      showDropdown={showDropdown}
      onDropdownToggle={onDropdownToggle}
    />
  );
};

export default FeatureAwareAiSearchToggle;

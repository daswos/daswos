import React from 'react';
import SuperSafeToggle from './super-safe-toggle';
import { useAdminSettings } from '@/hooks/use-admin-settings';

interface FeatureAwareSuperSafeToggleProps {
  className?: string;
}

const FeatureAwareSuperSafeToggle: React.FC<FeatureAwareSuperSafeToggleProps> = ({
  className = ''
}) => {
  const { settings, loading } = useAdminSettings();

  // If settings are still loading, don't render anything
  if (loading) {
    return null;
  }

  // If SuperSafe is disabled in admin settings, don't render the toggle
  if (!settings.superSafeEnabled) {
    return null;
  }

  // Otherwise, render the normal SuperSafeToggle
  return (
    <SuperSafeToggle className={className} />
  );
};

export default FeatureAwareSuperSafeToggle;

import React from 'react';
import SphereToggle from './sphere-toggle';
import { useAdminSettings } from '@/hooks/use-admin-settings';

interface FeatureAwareSphereToggleProps {
  activeSphere: 'safesphere' | 'opensphere';
  onChange: (sphere: 'safesphere' | 'opensphere') => void;
  className?: string;
}

const FeatureAwareSphereToggle: React.FC<FeatureAwareSphereToggleProps> = ({
  activeSphere,
  onChange,
  className = ''
}) => {
  const { settings, loading } = useAdminSettings();

  // If settings are still loading, don't render anything
  if (loading) {
    return null;
  }

  // If SafeSphere is disabled in admin settings, don't render the toggle
  if (!settings.safesphereEnabled) {
    return null;
  }

  // Otherwise, render the normal SphereToggle
  return (
    <SphereToggle
      activeSphere={activeSphere}
      onChange={onChange}
      className={className}
    />
  );
};

export default FeatureAwareSphereToggle;

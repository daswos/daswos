import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ShieldAlert } from 'lucide-react';
import { useSuperSafe } from '@/contexts/super-safe-context';

interface SuperSafeSettingsProps {
  className?: string;
}

const SuperSafeSettings: React.FC<SuperSafeSettingsProps> = ({ className = '' }) => {
  const { isSuperSafeEnabled, settings, toggleSuperSafe, updateSettings, isLoading } = useSuperSafe();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            SuperSafe Mode
          </CardTitle>
          {isSuperSafeEnabled && (
            <div className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1 rounded-full border">
              Enabled
            </div>
          )}
        </div>
        <CardDescription>
          Control content restrictions and SafeSphere settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="super-safe-toggle">SuperSafe Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable content restrictions and safety features
              </p>
            </div>
            <Switch
              id="super-safe-toggle"
              checked={isSuperSafeEnabled}
              disabled={isLoading}
              onCheckedChange={toggleSuperSafe}
            />
          </div>

          {isSuperSafeEnabled && (
            <div className="space-y-4 pt-2">
              <h3 className="font-medium text-sm">SuperSafe Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="block-gambling"
                      className="font-normal text-sm"
                    >
                      Block Gambling Content
                    </Label>
                  </div>
                  <Switch
                    id="block-gambling"
                    checked={settings.blockGambling}
                    onCheckedChange={(checked) => updateSettings('blockGambling', checked)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="block-adult"
                      className="font-normal text-sm"
                    >
                      Block Adult Content
                    </Label>
                  </div>
                  <Switch
                    id="block-adult"
                    checked={settings.blockAdultContent}
                    onCheckedChange={(checked) => updateSettings('blockAdultContent', checked)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="block-opensphere"
                      className="font-normal text-sm"
                    >
                      Block OpenSphere Shopping
                    </Label>
                    <p className="text-xs text-muted-foreground">Restrict to SafeSphere vendors only</p>
                  </div>
                  <Switch
                    id="block-opensphere"
                    checked={settings.blockOpenSphere}
                    onCheckedChange={(checked) => updateSettings('blockOpenSphere', checked)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SuperSafeSettings;

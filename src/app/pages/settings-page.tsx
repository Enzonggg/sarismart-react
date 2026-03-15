import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { Save, Database, Bell, Palette, Download, Upload } from "lucide-react";

export function SettingsPage() {
  const [settings, setSettings] = useState({
    businessName: "My Business",
    email: "admin@mybusiness.com",
    lowStockThreshold: 20,
    enableNotifications: true,
    enableEmailAlerts: false,
    darkMode: false,
    currency: "USD",
  });

  const handleSave = () => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
    toast.success("Settings saved successfully");
  };

  const handleExportData = () => {
    const data = {
      products: localStorage.getItem("products"),
      salesData: localStorage.getItem("salesData"),
      stockHistory: localStorage.getItem("stockHistory"),
      forecastData: localStorage.getItem("forecastData"),
      settings: localStorage.getItem("appSettings"),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Data exported successfully");
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const data = JSON.parse(e.target.result);
            if (data.products) localStorage.setItem("products", data.products);
            if (data.salesData)
              localStorage.setItem("salesData", data.salesData);
            if (data.stockHistory)
              localStorage.setItem("stockHistory", data.stockHistory);
            if (data.forecastData)
              localStorage.setItem("forecastData", data.forecastData);
            if (data.settings)
              localStorage.setItem("appSettings", data.settings);

            toast.success("Data imported successfully. Please refresh the page.");
          } catch (error) {
            toast.error("Failed to import data. Invalid file format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleResetData = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all data? This action cannot be undone."
      )
    ) {
      localStorage.clear();
      toast.success("All data has been reset. Please refresh the page.");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your application preferences</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={settings.businessName}
                onChange={(e) =>
                  setSettings({ ...settings, businessName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.target.value })
                }
                placeholder="USD, EUR, GBP, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Inventory Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">
                Default Low Stock Threshold
              </Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    lowStockThreshold: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-gray-500">
                Default threshold for new products
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableNotifications">Enable Notifications</Label>
                <p className="text-xs text-gray-500">
                  Show in-app notifications for important events
                </p>
              </div>
              <Switch
                id="enableNotifications"
                checked={settings.enableNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableNotifications: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableEmailAlerts">Email Alerts</Label>
                <p className="text-xs text-gray-500">
                  Receive email alerts for low stock and other events
                </p>
              </div>
              <Switch
                id="enableEmailAlerts"
                checked={settings.enableEmailAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableEmailAlerts: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Export Data</Label>
              <p className="text-xs text-gray-500 mb-2">
                Download all your inventory data as a JSON file
              </p>
              <Button onClick={handleExportData} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Import Data</Label>
              <p className="text-xs text-gray-500 mb-2">
                Import inventory data from a backup file
              </p>
              <Button onClick={handleImportData} variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Import Data
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Reset All Data</Label>
              <p className="text-xs text-gray-500 mb-2">
                Clear all data and start fresh (cannot be undone)
              </p>
              <Button
                onClick={handleResetData}
                variant="destructive"
                className="gap-2"
              >
                Reset All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

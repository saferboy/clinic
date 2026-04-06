'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Settings, Bell, Lock, Palette, Database, BarChart3 } from 'lucide-react';

export default function SettingsPage() {
  const [clinicSettings, setClinicSettings] = useState({
    clinicName: 'Klinika Boshqarish Tizimi',
    address: 'Tashkent, Uzbekistan',
    phone: '+998 (71) 123-45-67',
    email: 'info@clinic.com',
    description: 'Modern clinic management system with comprehensive healthcare services',
    timezone: 'Asia/Tashkent',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    paymentAlerts: true,
    systemUpdates: false,
  });

  const [displaySettings, setDisplaySettings] = useState({
    theme: 'light',
    language: 'en',
    itemsPerPage: 10,
    dateFormat: 'DD/MM/YYYY',
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    lastBackup: '2024-04-02 14:30:00',
  });

  const [analyticsSettings, setAnalyticsSettings] = useState({
    trackingEnabled: true,
    detailedReports: true,
    exportData: true,
    dataRetention: 12,
  });

  const handleSaveClinicSettings = () => {
    toast.success('Clinic settings updated successfully');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated');
  };

  const handleSaveDisplay = () => {
    toast.success('Display settings updated');
  };

  const handlePerformBackup = () => {
    toast.success('Backup completed successfully');
    setBackupSettings({
      ...backupSettings,
      lastBackup: new Date().toLocaleString(),
    });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage clinic configuration and system preferences</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="clinic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="clinic" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Clinic</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Backup</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Clinic Settings */}
          <TabsContent value="clinic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinic Information</CardTitle>
                <CardDescription>Update your clinic details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Clinic Name</label>
                    <Input
                      value={clinicSettings.clinicName}
                      onChange={(e) => setClinicSettings({ ...clinicSettings, clinicName: e.target.value })}
                      placeholder="Your Clinic Name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={clinicSettings.email}
                      onChange={(e) => setClinicSettings({ ...clinicSettings, email: e.target.value })}
                      placeholder="info@clinic.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={clinicSettings.phone}
                      onChange={(e) => setClinicSettings({ ...clinicSettings, phone: e.target.value })}
                      placeholder="+998 (71) 123-45-67"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timezone</label>
                    <Input
                      value={clinicSettings.timezone}
                      onChange={(e) => setClinicSettings({ ...clinicSettings, timezone: e.target.value })}
                      placeholder="Asia/Tashkent"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    value={clinicSettings.address}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, address: e.target.value })}
                    placeholder="Clinic Address"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={clinicSettings.description}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, description: e.target.value })}
                    placeholder="Clinic description"
                    rows={4}
                  />
                </div>
                <Button onClick={handleSaveClinicSettings}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Appointment Reminders</p>
                      <p className="text-sm text-gray-600">Get notified about upcoming appointments</p>
                    </div>
                    <Switch
                      checked={notificationSettings.appointmentReminders}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, appointmentReminders: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Payment Alerts</p>
                      <p className="text-sm text-gray-600">Alerts for payment transactions</p>
                    </div>
                    <Switch
                      checked={notificationSettings.paymentAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, paymentAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">System Updates</p>
                      <p className="text-sm text-gray-600">Notifications about system updates</p>
                    </div>
                    <Switch
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, systemUpdates: checked })}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Settings */}
          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Customize how the system looks and behaves</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Theme</label>
                    <select
                      value={displaySettings.theme}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, theme: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <select
                      value={displaySettings.language}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="en">English</option>
                      <option value="uz">Uzbek</option>
                      <option value="ru">Russian</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Items Per Page</label>
                    <Input
                      type="number"
                      value={displaySettings.itemsPerPage}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, itemsPerPage: parseInt(e.target.value) })}
                      min="5"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date Format</label>
                    <select
                      value={displaySettings.dateFormat}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, dateFormat: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleSaveDisplay}>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Settings */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Recovery</CardTitle>
                <CardDescription>Manage your data backups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Last Backup</p>
                    <p className="text-blue-700">{backupSettings.lastBackup}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Automatic Backups</p>
                      <p className="text-sm text-gray-600">Enable automatic daily backups</p>
                    </div>
                    <Switch
                      checked={backupSettings.autoBackup}
                      onCheckedChange={(checked) => setBackupSettings({ ...backupSettings, autoBackup: checked })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Backup Frequency</label>
                    <select
                      value={backupSettings.backupFrequency}
                      onChange={(e) => setBackupSettings({ ...backupSettings, backupFrequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handlePerformBackup} variant="outline">Perform Backup Now</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Settings */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Data</CardTitle>
                <CardDescription>Control data collection and analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Enable Tracking</p>
                      <p className="text-sm text-gray-600">Allow analytics tracking</p>
                    </div>
                    <Switch
                      checked={analyticsSettings.trackingEnabled}
                      onCheckedChange={(checked) => setAnalyticsSettings({ ...analyticsSettings, trackingEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Detailed Reports</p>
                      <p className="text-sm text-gray-600">Generate detailed analytics reports</p>
                    </div>
                    <Switch
                      checked={analyticsSettings.detailedReports}
                      onCheckedChange={(checked) => setAnalyticsSettings({ ...analyticsSettings, detailedReports: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Export Data</p>
                      <p className="text-sm text-gray-600">Allow exporting analytics data</p>
                    </div>
                    <Switch
                      checked={analyticsSettings.exportData}
                      onCheckedChange={(checked) => setAnalyticsSettings({ ...analyticsSettings, exportData: checked })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data Retention (months)</label>
                    <Input
                      type="number"
                      value={analyticsSettings.dataRetention}
                      onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, dataRetention: parseInt(e.target.value) })}
                      min="1"
                      max="36"
                    />
                  </div>
                </div>
                <Button onClick={() => toast.success('Analytics settings updated')}>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}

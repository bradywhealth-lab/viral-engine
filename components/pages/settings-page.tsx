"use client";

import { Key, Bell, Bot, Eye, EyeOff, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AutomationMode = "full" | "semi" | "manual";

interface ApiKeyConfig {
  key: string;
  label: string;
  value: string;
  show: boolean;
}

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface PlatformAutomation {
  platform: string;
  mode: AutomationMode;
}

const API_KEYS_CONFIG: Omit<ApiKeyConfig, "value" | "show">[] = [
  { key: "OPENAI_API_KEY", label: "OpenAI API Key" },
  { key: "FIRECRAWL_API_KEY", label: "Firecrawl API Key" },
  { key: "INSTAGRAM_ACCESS_TOKEN", label: "Instagram Access Token" },
  { key: "TIKTOK_CLIENT_KEY", label: "TikTok Client Key" },
  { key: "YOUTUBE_API_KEY", label: "YouTube API Key" },
];

const NOTIFICATIONS_DEFAULTS: NotificationSetting[] = [
  {
    id: "trend-alerts",
    label: "Trend Alerts",
    description: "Get notified when new trending topics match your niches",
    enabled: true,
  },
  {
    id: "post-reminders",
    label: "Post Reminders",
    description: "Daily reminders for scheduled content",
    enabled: true,
  },
  {
    id: "analytics-reports",
    label: "Analytics Reports",
    description: "Weekly performance summaries via email",
    enabled: false,
  },
];

const PLATFORMS_DEFAULTS: PlatformAutomation[] = [
  { platform: "YouTube", mode: "semi" },
  { platform: "TikTok", mode: "full" },
  { platform: "Instagram", mode: "full" },
];

export function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>(() =>
    API_KEYS_CONFIG.map((config) => ({
      ...config,
      value: typeof window !== "undefined" ? (localStorage.getItem(config.key) || "") : "",
      show: false,
    })),
  );
  const [notifications, setNotifications] = useState<NotificationSetting[]>(() => {
    if (typeof window === "undefined") return NOTIFICATIONS_DEFAULTS;
    const saved = localStorage.getItem("notification_settings");
    return saved ? JSON.parse(saved) : NOTIFICATIONS_DEFAULTS;
  });
  const [platformSettings, setPlatformSettings] = useState<PlatformAutomation[]>(() => {
    if (typeof window === "undefined") return PLATFORMS_DEFAULTS;
    const saved = localStorage.getItem("platform_automation_settings");
    return saved ? JSON.parse(saved) : PLATFORMS_DEFAULTS;
  });
  const [globalMode, setGlobalMode] = useState<AutomationMode>(() => {
    if (typeof window === "undefined") return "semi";
    const saved = localStorage.getItem("global_automation_mode") as AutomationMode;
    return saved || "semi";
  });

  const maskKey = (key: string) => {
    if (!key) return "Not set";
    if (key.length <= 8) return "*".repeat(key.length);
    return `${key.slice(0, 4)}${"*".repeat(key.length - 8)}${key.slice(-4)}`;
  };

  const toggleKeyVisibility = (index: number) => {
    setApiKeys((prev) =>
      prev.map((key, i) => (i === index ? { ...key, show: !key.show } : key)),
    );
  };

  const handleApiKeySave = (index: number, value: string) => {
    const config = apiKeys[index];
    localStorage.setItem(config.key, value);
    setApiKeys((prev) => prev.map((key, i) => (i === index ? { ...key, value } : key)));
    toast.success(`${config.label} saved`);
  };

  const handleNotificationToggle = (id: string) => {
    setNotifications((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting,
      ),
    );
    localStorage.setItem(
      "notification_settings",
      JSON.stringify(notifications.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))),
    );
  };

  const handlePlatformModeChange = (platform: string, mode: AutomationMode) => {
    setPlatformSettings((prev) =>
      prev.map((p) => (p.platform === platform ? { ...p, mode } : p)),
    );
    localStorage.setItem(
      "platform_automation_settings",
      JSON.stringify(platformSettings.map((p) => (p.platform === platform ? { ...p, mode } : p))),
    );
    toast.success(`${platform} automation set to ${mode}`);
  };

  const handleGlobalModeChange = (mode: AutomationMode) => {
    setGlobalMode(mode);
    localStorage.setItem("global_automation_mode", mode);
    toast.success(`Global automation mode set to ${mode}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage your API keys, notifications, and automation preferences.</p>
      </div>

      <Tabs defaultValue="api-keys">
        <TabsList>
          <TabsTrigger value="api-keys">
            <Key className="mr-2 h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Bot className="mr-2 h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Securely store your API keys for third-party integrations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {apiKeys.map((config, index) => (
                <div key={config.key} className="space-y-2">
                  <Label htmlFor={config.key}>{config.label}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={config.key}
                        type={config.show ? "text" : "password"}
                        value={config.value}
                        onChange={(e) => setApiKeys((prev) => prev.map((key, i) => (i === index ? { ...key, value: e.target.value } : key)))}
                        placeholder={maskKey(config.value)}
                        className="pr-20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-8 top-1/2 -translate-y-1/2 h-7 px-2"
                        onClick={() => toggleKeyVisibility(index)}
                      >
                        {config.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleApiKeySave(index, apiKeys[index].value)}
                      size="sm"
                      className="shrink-0"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                  {config.value && (
                    <p className="text-xs text-zinc-500">
                      Currently set: {config.show ? config.value : maskKey(config.value)}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control which alerts and updates you receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {notifications.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <div className="flex-1">
                    <p className="font-medium text-white">{setting.label}</p>
                    <p className="mt-1 text-sm text-zinc-400">{setting.description}</p>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => handleNotificationToggle(setting.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Automation Mode</CardTitle>
              <CardDescription>Set the default automation behavior for all platforms.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {(["full", "semi", "manual"] as AutomationMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant={globalMode === mode ? "default" : "outline"}
                    onClick={() => handleGlobalModeChange(mode)}
                    className="flex-1"
                  >
                    {mode === "full" ? "Full Auto" : mode === "semi" ? "Semi-Auto" : "Manual"}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform-Specific Settings</CardTitle>
              <CardDescription>Override global settings for individual platforms.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {platformSettings.map((setting) => (
                <div
                  key={setting.platform}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 p-4"
                >
                  <div>
                    <p className="font-medium text-white">{setting.platform}</p>
                    <Badge variant="outline" className="mt-2">
                      Current: {setting.mode === "full" ? "Full Auto" : setting.mode === "semi" ? "Semi-Auto" : "Manual"}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    {(["full", "semi", "manual"] as AutomationMode[]).map((mode) => (
                      <Button
                        key={mode}
                        variant={setting.mode === mode ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePlatformModeChange(setting.platform, mode)}
                      >
                        {mode === "full" ? "Full" : mode === "semi" ? "Semi" : "Manual"}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

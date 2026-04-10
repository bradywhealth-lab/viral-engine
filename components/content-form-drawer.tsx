"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { parseHashtags } from "@/lib/utils";

type ContentFormDrawerProps = {
  profileId: string;
  onCreated: () => Promise<void> | void;
};

export function ContentFormDrawer({ profileId, onCreated }: ContentFormDrawerProps) {
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [contentType, setContentType] = useState("post");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setCaption("");
      setHashtags("");
      setPlatform("tiktok");
      setContentType("post");
      setScheduledAt("");
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          caption,
          hashtags: parseHashtags(hashtags),
          platform,
          contentType,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      });
      await onCreated();
      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Content</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Content Item</DialogTitle>
          <DialogDescription>Build a draft or queue a scheduled post for the active profile.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea id="caption" value={caption} onChange={(event) => setCaption(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              placeholder="viral, trending, niche"
              value={hashtags}
              onChange={(event) => setHashtags(event.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="scheduledAt">Scheduled Time</Label>
            <Input id="scheduledAt" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isSaving || !caption.trim()}>
              {isSaving ? "Saving..." : "Save Content"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

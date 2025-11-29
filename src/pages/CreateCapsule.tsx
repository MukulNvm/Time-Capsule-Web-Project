import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Clock } from "lucide-react";
import { toast } from "sonner";

const CreateCapsule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [privacy, setPrivacy] = useState("private");
  const [recipients, setRecipients] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) throw new Error("Not authenticated");

      // Create capsule
      const response = await fetch(`http://localhost:8080/api/capsules?userId=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          messageEncrypted: message,
          unlockAt: new Date(unlockDate).toISOString(),
          privacy,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create capsule");
      }

      const capsule = await response.json();

      // TODO: Handle file uploads if needed
      // For now, skip file uploads as backend doesn't have file handling yet

      toast.success("Time capsule created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create capsule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Create Time Capsule</CardTitle>
            </div>
            <CardDescription>
              Preserve your message for the future
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Capsule Title</Label>
                <Input
                  id="title"
                  placeholder="My Future Message"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your message to the future..."
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unlock-date">Unlock Date & Time</Label>
                <Input
                  id="unlock-date"
                  type="datetime-local"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacy">Privacy</Label>
                <Select value={privacy} onValueChange={setPrivacy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Only you)</SelectItem>
                    <SelectItem value="recipient">Recipients only</SelectItem>
                    <SelectItem value="public">Public on unlock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {privacy === "recipient" && (
                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
                  <Input
                    id="recipients"
                    type="text"
                    placeholder="email1@example.com, email2@example.com"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="files">Attachments (images/audio)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="files"
                    type="file"
                    multiple
                    accept="image/*,audio/*"
                    onChange={(e) => setFiles(e.target.files)}
                    className="cursor-pointer"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload images or audio files to include in your capsule
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating..." : "Create Time Capsule"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateCapsule;
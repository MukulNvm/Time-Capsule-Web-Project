import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Lock, Unlock, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Capsule {
  id: string;
  title: string;
  message_encrypted: string;
  unlock_at: string;
  status: string;
  privacy: string;
  recipients: any;
  created_at: string;
  revealed_at: string | null;
}

interface CapsuleFile {
  id: string;
  filename: string;
  storage_path: string;
  file_type: string;
}

const CapsuleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [files, setFiles] = useState<CapsuleFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCapsule();
    fetchFiles();
  }, [id]);

  const fetchCapsule = async () => {
    try {
      const { data, error } = await supabase
        .from("capsules")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setCapsule(data);
    } catch (error: any) {
      toast.error("Failed to load capsule");
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("capsule_id", id);

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      console.error("Failed to load files", error);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("capsules")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Capsule deleted successfully");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Failed to delete capsule");
    }
  };

  const downloadFile = async (file: CapsuleFile) => {
    try {
      const { data, error } = await supabase.storage
        .from("capsule-files")
        .download(file.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error("Failed to download file");
    }
  };

  const isUnlocked = () => {
    if (!capsule) return false;
    return capsule.status === "revealed" || new Date(capsule.unlock_at) <= new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Capsule not found</p>
      </div>
    );
  }

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

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {isUnlocked() ? (
                    <Unlock className="h-6 w-6 text-green-500" />
                  ) : (
                    <Lock className="h-6 w-6 text-primary" />
                  )}
                  <CardTitle className="text-2xl">{capsule.title}</CardTitle>
                </div>
                <CardDescription>
                  Created on {format(new Date(capsule.created_at), "PPP")}
                </CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Time Capsule?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      time capsule and all associated files.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="flex gap-2 mt-4">
              <Badge>{capsule.status}</Badge>
              <Badge variant="outline">{capsule.privacy}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {isUnlocked() ? "Unlocked on" : "Unlocks on"}{" "}
                  {format(new Date(capsule.unlock_at), "PPP 'at' p")}
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Message</h3>
              {isUnlocked() ? (
                <p className="text-foreground whitespace-pre-wrap">
                  {capsule.message_encrypted}
                </p>
              ) : (
                <div className="bg-muted/50 p-6 rounded-lg text-center">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    This message is locked until {format(new Date(capsule.unlock_at), "PPP")}
                  </p>
                </div>
              )}
            </div>

            {files.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-4">Attachments</h3>
                  {isUnlocked() ? (
                    <div className="space-y-2">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                        >
                          <span className="text-sm">{file.filename}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFile(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/50 p-6 rounded-lg text-center">
                      <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {files.length} file{files.length > 1 ? "s" : ""} locked
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {Array.isArray(capsule.recipients) && capsule.recipients.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Recipients</h3>
                  <div className="flex flex-wrap gap-2">
                    {capsule.recipients.map((email: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {email}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CapsuleDetail;
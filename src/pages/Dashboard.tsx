import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, LogOut, Calendar, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Capsule {
  id: string;
  title: string;
  message_encrypted: string;
  unlock_at: string;
  status: string;
  privacy: string;
  created_at: string;
  revealed_at: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchCapsules();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchCapsules = async () => {
    try {
      const { data, error } = await supabase
        .from("capsules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCapsules(data || []);
    } catch (error: any) {
      toast.error("Failed to load capsules");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-500";
      case "revealed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const isUnlocked = (capsule: Capsule) => {
    return capsule.status === "revealed" || new Date(capsule.unlock_at) <= new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Time Capsule</h1>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Time Capsules</h2>
            <p className="text-muted-foreground">
              Messages preserved for the future
            </p>
          </div>
          <Button onClick={() => navigate("/create")} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Capsule
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading capsules...</p>
          </div>
        ) : capsules.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No capsules yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first time capsule to get started
              </p>
              <Button onClick={() => navigate("/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Capsule
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capsules.map((capsule) => (
              <Card
                key={capsule.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/capsule/${capsule.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{capsule.title}</CardTitle>
                    {isUnlocked(capsule) ? (
                      <Unlock className="h-5 w-5 text-green-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {capsule.message_encrypted?.substring(0, 100)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Unlocks {formatDistanceToNow(new Date(capsule.unlock_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(capsule.status)}>
                        {capsule.status}
                      </Badge>
                      <Badge variant="outline">{capsule.privacy}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
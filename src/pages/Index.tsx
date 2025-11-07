import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Lock, Mail, Calendar } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Time Capsule</h1>
          </div>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Preserve Your Memories for the Future
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create time-locked messages with text, images, and audio that unlock on a future date of your choosing
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Create Your First Capsule
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-lg border text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your messages are encrypted and protected until the unlock date
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Schedule Delivery</h3>
            <p className="text-muted-foreground">
              Set exact future dates for automatic message reveal
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Share with Others</h3>
            <p className="text-muted-foreground">
              Send time capsules to friends and family via email
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-20 bg-card p-8 rounded-lg border">
          <h3 className="text-2xl font-bold mb-4 text-center">How It Works</h3>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold">Create Your Capsule</h4>
                <p className="text-muted-foreground">Write your message and upload images or audio files</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold">Set Unlock Date</h4>
                <p className="text-muted-foreground">Choose when your capsule should be revealed</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold">Share or Keep Private</h4>
                <p className="text-muted-foreground">Add recipients or keep it just for yourself</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-semibold">Automatic Unlock</h4>
                <p className="text-muted-foreground">Your capsule unlocks on the scheduled date</p>
              </div>
            </li>
          </ol>
        </div>
      </main>

      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Time Capsule Web. Preserve your memories securely.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

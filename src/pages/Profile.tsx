import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Loader2, Save } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { AppHeader } from "@/components/AppHeader";
import { toast } from "sonner";
import { toProfile, type Profile as ProfileType } from "@/types";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Perfil · España en directo";
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        const p = toProfile(data);
        setProfile(p);
        setDisplayName(p.displayName ?? "");
        setBio(p.bio ?? "");
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || null, bio: bio.trim() || null })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil actualizado");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const initial = (displayName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Perfil" icon={UserIcon} />

      <main className="container mx-auto px-4 py-4 max-w-md">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Card className="p-5 mb-4 flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">
                  {displayName || "Sin nombre"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                {profile && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Miembro desde {new Date(profile.createdAt).toLocaleDateString("es-ES")}
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="displayName">Nombre</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  maxLength={60}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Biografía</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Sobre ti..."
                  maxLength={200}
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar cambios
              </Button>
            </Card>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full mt-4 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

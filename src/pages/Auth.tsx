import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Radio } from "lucide-react";
import { toast } from "sonner";

const emailSchema = z.string().trim().email("Correo no válido").max(255);
const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres");

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Acceder · España en directo";
  }, []);

  if (!loading && user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsedEmail = emailSchema.parse(email);
      const parsedPassword = passwordSchema.parse(password);

      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsedEmail,
          password: parsedPassword,
        });
        if (error) throw error;
        toast.success("¡Bienvenido!");
        navigate("/", { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email: parsedEmail,
          password: parsedPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName.trim() || undefined },
          },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Ya puedes acceder.");
        navigate("/", { replace: true });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8 safe-top safe-bottom">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-6 gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Radio className="h-7 w-7" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">España en directo</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Noticias en tiempo real con IA
              </p>
            </div>
          </div>

          <Card className="p-5">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Acceder</TabsTrigger>
                <TabsTrigger value="signup">Registrarme</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-3">
                {tab === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName">Nombre (opcional)</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Tu nombre"
                      maxLength={60}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={tab === "login" ? "current-password" : "new-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                <TabsContent value="login" className="m-0">
                  <Button type="submit" className="w-full mt-2" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Acceder
                  </Button>
                </TabsContent>
                <TabsContent value="signup" className="m-0">
                  <Button type="submit" className="w-full mt-2" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Crear cuenta
                  </Button>
                </TabsContent>
              </form>
            </Tabs>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Continuar implica aceptar el uso de la app para fines informativos.
          </p>
        </div>
      </div>
    </div>
  );
}

// Re-export del cliente oficial gestionado por Lovable Cloud.
// Mantiene `src/lib/supabase.ts` como punto de entrada estable
// sin perder la sincronización automática de tipos.
export { supabase } from "@/integrations/supabase/client";
export type { Database } from "@/integrations/supabase/types";

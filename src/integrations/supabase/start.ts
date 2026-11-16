import { createStart } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

// Registers the middleware globally so every server function call
// from the browser carries the user's Supabase access token.
export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
}));
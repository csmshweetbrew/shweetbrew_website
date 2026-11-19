/*
 * Who's signed in, and the login popup.
 *
 * Supabase keeps the session (in localStorage, refreshed automatically). This
 * context mirrors it for React, loads the customer's profile row, and owns the
 * one AuthModal: any component can call `openAuth()`. A "reset your password"
 * email link lands back on the site and opens the popup on the new-password step.
 */

import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { AuthStep } from "@/components/AuthModal";

// Loaded on first use (the popup is only needed once someone clicks Log in)
const AuthModal = lazy(() => import("@/components/AuthModal"));
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  city: string | null;
  street: string | null;
  apartment: string | null;
  default_zone_id: string | null;
};

type AuthState = {
  /** false until the saved session has been read (avoids a "Log in" flash for signed-in visitors) */
  ready: boolean;
  user: User | null;
  profile: Profile | null;
  /** "Dana" from the profile or the sign-up details */
  firstName: string;
  isAdmin: boolean;
  enabled: boolean;
  openAuth: (step?: AuthStep) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  ready: true,
  user: null,
  profile: null,
  firstName: "",
  isAdmin: false,
  enabled: false,
  openAuth: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [modal, setModal] = useState<{ open: boolean; step: AuthStep }>({ open: false, step: "email" });

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u) return setProfile(null);
    const sb = await getSupabase();
    if (!sb) return;
    const { data } = await sb.from("profiles").select("id, email, full_name, phone, role, city, street, apartment, default_zone_id").eq("id", u.id).maybeSingle();
    setProfile((data as Profile) ?? null);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let unsubscribe: (() => void) | undefined;
    let alive = true;
    void (async () => {
      const sb = await getSupabase();
      if (!sb || !alive) return;
      const { data } = await sb.auth.getSession();
      setUser(data.session?.user ?? null);
      setReady(true);
      void loadProfile(data.session?.user ?? null);
      const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "SIGNED_OUT") void loadProfile(session?.user ?? null);
        // Came back from the "reset your password" email: ask for the new one
        if (event === "PASSWORD_RECOVERY") setModal({ open: true, step: "reset" });
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    })();
    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [loadProfile]);

  const openAuth = useCallback((step: AuthStep = "email") => setModal({ open: true, step }), []);
  const signOut = useCallback(async () => {
    const sb = await getSupabase();
    await sb?.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);
  const refreshProfile = useCallback(() => loadProfile(user), [loadProfile, user]);

  const metaName = (user?.user_metadata?.first_name as string | undefined) || (user?.user_metadata?.full_name as string | undefined) || "";
  const firstName = ((profile?.full_name || metaName).trim().split(/\s+/)[0] || "").slice(0, 30);

  return (
    <AuthContext.Provider
      value={{
        ready,
        user,
        profile,
        firstName,
        isAdmin: profile?.role === "admin",
        enabled: isSupabaseConfigured,
        openAuth,
        signOut,
        refreshProfile,
      }}
    >
      {children}
      {modal.open && (
        <Suspense fallback={null}>
          <AuthModal open initialStep={modal.step} onClose={() => setModal((m) => ({ ...m, open: false }))} />
        </Suspense>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

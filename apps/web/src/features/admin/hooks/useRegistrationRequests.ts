import { useCallback, useEffect, useState } from "react";
import type { AppRole, Database } from "@krishnas-kitchen/types";

import { useAuth } from "@/features/auth";

export type RegistrationRequest = Database["public"]["Tables"]["registration_requests"]["Row"];

export function useRegistrationRequests() {
  const auth = useAuth();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!auth.client) return;
    setIsLoading(true);
    setError(null);
    const { data, error: loadError } = await auth.client
      .from("registration_requests")
      .select("*")
      .eq("status", "pending")
      .order("requested_at", { ascending: true });

    if (loadError) setError(loadError.message);
    else setRequests(data);
    setIsLoading(false);
  }, [auth.client]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function review(
    requestId: string,
    decision: "approve" | "reject",
    role: AppRole,
    note: string
  ) {
    if (!auth.client) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result =
      decision === "approve"
        ? await auth.client.rpc("approve_registration_request", {
            p_request_id: requestId,
            p_review_note: note || null,
            p_role: role
          })
        : await auth.client.rpc("reject_registration_request", {
            p_request_id: requestId,
            p_review_note: note || null
          });

    if (result.error) setError(result.error.message);
    else {
      setSuccess(decision === "approve" ? "Access request approved." : "Access request rejected.");
      await refresh();
    }
    setIsSubmitting(false);
  }

  return { error, isLoading, isSubmitting, refresh, requests, review, success };
}

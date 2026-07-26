import { useRef, useState } from "react";

import {
  useInventoryActor,
  useInventoryPermissions,
  useInventoryServices,
  type InventoryTransaction
} from "@/domains/inventory";

export type InventoryReversalWorkflowState = {
  error: string | null;
  isSubmitting: boolean;
  notes: string;
  reversedTransaction: InventoryTransaction | null;
  selectedTransaction: InventoryTransaction | null;
};

export function useInventoryReversalWorkflow() {
  const actor = useInventoryActor();
  const permissions = useInventoryPermissions();
  const services = useInventoryServices();
  const submitLock = useRef(false);
  const [state, setState] = useState<InventoryReversalWorkflowState>({
    error: null,
    isSubmitting: false,
    notes: "",
    reversedTransaction: null,
    selectedTransaction: null
  });

  function clearSelection() {
    setState((currentState) => ({
      ...currentState,
      error: null,
      isSubmitting: false,
      notes: "",
      selectedTransaction: null
    }));
  }

  async function confirmReversal() {
    if (submitLock.current || state.isSubmitting) {
      return null;
    }

    if (!permissions.canUndoInventory) {
      setState((currentState) => ({
        ...currentState,
        error: "You do not have permission to reverse inventory transactions."
      }));
      return null;
    }

    if (!actor) {
      setState((currentState) => ({
        ...currentState,
        error: "Inventory actor is required."
      }));
      return null;
    }

    if (!state.selectedTransaction) {
      setState((currentState) => ({
        ...currentState,
        error: "Select a transaction before reversing."
      }));
      return null;
    }

    setState((currentState) => ({
      ...currentState,
      error: null,
      isSubmitting: true
    }));
    submitLock.current = true;

    try {
      const notes = state.notes.trim();
      const reversedTransaction = await services.inventory.undoTransaction(
        state.selectedTransaction.id,
        {
          actor,
          auditMetadata: {
            reason: "manager_reversal",
            source: "online"
          },
          ...(notes ? { notes } : {})
        }
      );

      setState({
        error: null,
        isSubmitting: false,
        notes: "",
        reversedTransaction,
        selectedTransaction: null
      });

      return reversedTransaction;
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        error: error instanceof Error ? error.message : "Reversal failed.",
        isSubmitting: false
      }));
      return null;
    } finally {
      submitLock.current = false;
    }
  }

  return {
    canReverseInventory: permissions.canUndoInventory,
    clearSelection,
    confirmReversal,
    selectTransaction(transaction: InventoryTransaction) {
      setState({
        error: null,
        isSubmitting: false,
        notes: "",
        reversedTransaction: null,
        selectedTransaction: transaction
      });
    },
    setNotes(notes: string) {
      setState((currentState) => ({
        ...currentState,
        notes
      }));
    },
    state
  };
}

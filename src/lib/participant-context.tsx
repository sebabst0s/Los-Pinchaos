"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CURRENT_USER_STORAGE_KEY } from "@/lib/constants";

export interface CurrentParticipant {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface ParticipantContextValue {
  participant: CurrentParticipant | null;
  isLoaded: boolean;
  setParticipant: (participant: CurrentParticipant) => void;
  clearParticipant: () => void;
}

const ParticipantContext = createContext<ParticipantContextValue | null>(null);

export function ParticipantProvider({ children }: { children: ReactNode }) {
  const [participant, setParticipantState] = useState<CurrentParticipant | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (raw) {
        setParticipantState(JSON.parse(raw));
      }
    } catch {
      // localStorage corrupto o no disponible: se tratará como no logueado.
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setParticipant = (next: CurrentParticipant) => {
    setParticipantState(next);
    window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(next));
  };

  const clearParticipant = () => {
    setParticipantState(null);
    window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ participant, isLoaded, setParticipant, clearParticipant }),
    [participant, isLoaded]
  );

  return (
    <ParticipantContext.Provider value={value}>
      {children}
    </ParticipantContext.Provider>
  );
}

export function useParticipant() {
  const ctx = useContext(ParticipantContext);
  if (!ctx) {
    throw new Error("useParticipant debe usarse dentro de ParticipantProvider");
  }
  return ctx;
}

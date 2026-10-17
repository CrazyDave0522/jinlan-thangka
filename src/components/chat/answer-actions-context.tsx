"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export function createWriteCoordinator() {
  let busy = false;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => busy,
    acquire() {
      if (busy) return null;
      busy = true;
      notify();
      let released = false;
      return () => {
        if (released) return;
        released = true;
        busy = false;
        notify();
      };
    },
  };
}
export const AnswerActionsContext = createContext<{
  coordinator: ReturnType<typeof createWriteCoordinator>;
  onRead: () => void;
} | null>(null);
export const useAnswerReading = () =>
  useContext(AnswerActionsContext)?.onRead ?? (() => {});
export function AnswerActionsProvider({
  children,
  onRead = () => {},
}: {
  children: ReactNode;
  onRead?: () => void;
}) {
  const [coordinator] = useState(createWriteCoordinator);
  return (
    <AnswerActionsContext.Provider value={{ coordinator, onRead }}>
      {children}
    </AnswerActionsContext.Provider>
  );
}

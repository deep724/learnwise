import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { DemoState } from "../types";
import { freshState, loadState, saveState, STORAGE_KEY } from "./storage";
type Store = {
  state: DemoState;
  update: (fn: (state: DemoState) => DemoState, message?: string) => boolean;
  notify: (message: string) => void;
  toast: string;
  reset: () => void;
  storageAvailable: boolean;
};
const Context = createContext<Store | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadState);
  const [state, setState] = useState(initial.state);
  const [toast, setToast] = useState(initial.notice ?? "");
  const current = useRef(state);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const persist = (next: DemoState, message?: string) => {
    try {
      saveState(next);
      setStorageAvailable(true);
      if (message) setToast(message);
      return true;
    } catch {
      setStorageAvailable(false);
      setToast(
        "Change applied for this session only. Storage is unavailable; refreshing will lose it.",
      );
      return false;
    }
  };
  useEffect(() => {
    persist(current.current);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const loaded = loadState().state;
        // Shared learning records sync, but another tab never switches this session.
        const next = {
          ...loaded,
          role: current.current.role,
          profileId: current.current.profileId,
          sessionActive: current.current.sessionActive,
        };
        current.current = next;
        setState(next);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const update: Store["update"] = (fn, message) => {
    const next = fn(current.current);
    current.current = next;
    setState(next);
    return persist(next, message);
  };
  return (
    <Context.Provider
      value={{
        state,
        update,
        notify: setToast,
        toast,
        storageAvailable,
        reset: () => {
          update(
            () => freshState(),
            "Demo data reset. Your fresh start is ready.",
          );
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useDemo = () => {
  const context = useContext(Context);
  if (!context) throw Error("Missing DemoProvider");
  return context;
};
export const useStudent = () => {
  const { state } = useDemo();
  return state.students.find((s) => s.id === state.profileId)!;
};

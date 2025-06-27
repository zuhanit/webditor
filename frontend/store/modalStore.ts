import { create } from "zustand";
import { v4 } from "uuid";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";

enableMapSet();

export interface ModalComponentProps<P = Record<string, unknown>> {
  Component: React.FC<P>;
  props?: P;
}

interface ModalStore {
  modals: Map<string, ModalComponentProps>;
  /**
   * Open Modal Component in `ModalContainer`.
   *
   * Usage:
   * ```ts
   * const open = useModalStore((state) => state.open);
   * open(ModalComponent);
   * ```
   * @param Component
   * @param props
   * @returns
   */
  open: <P extends Record<string, unknown>>(
    Component: React.FC<P>,
    id?: string,
    props?: P,
  ) => string;
  close: (id: string) => void;
}

export const useModalStore = create<ModalStore>()(
  immer((set) => ({
    modals: new Map(),
    open: <P extends Record<string, unknown>>(
      Component: React.FC<P>,
      id: string = v4(),
      props?: P,
    ) => {
      set((state) => {
        // Immer에서는 draft를 직접 수정
        state.modals.set(id, {
          Component,
          props,
        } as ModalComponentProps);
      });
      return id;
    },
    close: (id: string) => set((state) => {
      // Immer에서는 draft를 직접 수정
      state.modals.delete(id);
    }),
  })),
);

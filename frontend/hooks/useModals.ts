import { useModalStore } from "@/store/modalStore";

export const useModals = () => {
  const modals = useModalStore((state) => state.modals);
  const open = useModalStore((state) => state.open);
  const close = useModalStore((state) => state.close);

  return {
    modals,
    open,
    close,
  };
};

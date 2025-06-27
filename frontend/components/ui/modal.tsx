import { v4 as uuidv4 } from "uuid";
import { useModalStore } from "@/store/modalStore";

export default function ModalContainer() {
  const modals = useModalStore((state) => state.modals);

  return (
    <>
      {Array.from(modals.values()).map((modal) => {
        const { Component, props } = modal;
        return (
          <div key={uuidv4()} className="modal">
            <Component {...props} />
          </div>
        );
      })}
    </>
  );
}

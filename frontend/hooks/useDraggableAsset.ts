import { DraggableAssetKind, DroppableContextKind } from "@/types/dnd";
import {
  useDraggable,
  UseDraggableArguments,
  useDroppable,
  UseDroppableArguments,
} from "@dnd-kit/core";

export function useDraggableAsset(
  args: UseDraggableArguments & { kind: DraggableAssetKind },
) {
  return useDraggable({ ...args, id: [args.kind, args.id].join("-") });
}

export function useDroppableContext(
  args: UseDroppableArguments & { kind: DroppableContextKind },
) {
  return useDroppable({
    ...args,
    id: [args.kind, args.id].join("-"),
  });
}

import { logEvent } from "firebase/analytics";
import { analytics } from "./clientApp";

export function trackInspectorEdit(
  entityId: string,
  field: string,
  newValue: any,
) {
  if (!analytics) return;

  logEvent(analytics, "inspector_edit", {
    entity_id: entityId,
    field,
    value: newValue,
  });
}

import { useState } from "react";

export function useSideBarSectionFold() {
  const [isFolded, setIsFolded] = useState(false);

  return { isFolded, setIsFolded };
}

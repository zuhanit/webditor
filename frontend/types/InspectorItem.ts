export interface Item {
  label: string;
  icon?: React.ReactNode;
  path: string[];
  properties: Record<string, any>;
}

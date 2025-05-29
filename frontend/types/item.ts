export interface Item {
  label: string;
  icon?: React.ReactNode;
  path: (string | number)[];
  properties: Record<string, any>;
}

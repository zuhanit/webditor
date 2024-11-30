export interface Item {
  label: string;
  icon?: React.ReactNode;
  properties?: Property[];
}

export interface Property {
  label: string;
  value: string;
}

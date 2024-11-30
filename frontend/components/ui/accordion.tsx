interface AccordionProps {
  children:
    | React.ReactElement<AccordionItemProps>
    | React.ReactElement<AccordionItemProps>[];
}

export function Accordion({ children }: AccordionProps) {
  return <div>{children}</div>;
}

interface AccordionItemProps {
  children:
    | React.ReactElement<AccordionContentProps | AccordionTriggerProps>
    | React.ReactElement<AccordionContentProps | AccordionTriggerProps>[];
}

export function AccordionItem({ children }: AccordionItemProps) {
  return <div>{children}</div>;
}

interface AccordionContentProps {
  children: React.ReactNode | React.ReactNode[];
}

export function AccordionContent({ children }: AccordionContentProps) {
  return <div>{children}</div>;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
}

export function AccordionTrigger({ children }: AccordionTriggerProps) {
  return <div>AccordionTrigger</div>;
}

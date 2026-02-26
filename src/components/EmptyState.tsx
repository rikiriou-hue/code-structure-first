import { ReactNode } from "react";

const EmptyState = ({ icon, title, description }: { icon: ReactNode; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="mb-4 text-muted-foreground/30 scale-125">{icon}</div>
    <h3 className="font-handwritten text-3xl text-foreground mb-2">{title}</h3>
    <p className="font-handwritten text-lg text-muted-foreground max-w-xs">{description}</p>
  </div>
);

export default EmptyState;

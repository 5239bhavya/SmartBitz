import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface PlanSectionProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}

export function PlanSection({ icon: Icon, title, children }: PlanSectionProps) {
  return (
    <Card variant="glass" className="border-border/50 shadow-sm animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface ListItemProps {
  children: ReactNode;
  bullet?: string;
}

export function ListItem({ children, bullet = "•" }: ListItemProps) {
  return (
    <li className="flex gap-3 text-sm">
      <span className="text-primary font-bold">{bullet}</span>
      <span className="text-muted-foreground">{children}</span>
    </li>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function InfoRow({ label, value, highlight }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm font-medium ${highlight ? "text-success" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  title: string;
  description?: string;
  items: ReactNode[];
  emptyText?: string;
};

export function FeedbackSection({
  title,
  description,
  items,
  emptyText = "Nothing to show here.",
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={index}
                className="border-l-2 border-border pl-3 text-sm leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { LinkSection as LinkSectionType } from "../data";

interface LinkSectionProps {
  section: LinkSectionType;
}

export default function LinkSection({ section }: LinkSectionProps) {
  if (section.links.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{section.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {section.links.map((link, index) => {
            const isExternal = link.url.startsWith("http");
            const LinkComponent = isExternal ? "a" : Link;
            const linkProps = isExternal
              ? { href: link.url, target: "_blank", rel: "noopener noreferrer" }
              : { href: link.url };

            return (
              <div key={index} className="group">
                <LinkComponent
                  {...linkProps}
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <span className="flex-1">
                    <span className="font-medium">{link.label}</span>
                    {link.description && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        {link.description}
                      </span>
                    )}
                  </span>
                  {isExternal && (
                    <ExternalLink className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </LinkComponent>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


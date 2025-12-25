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
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl">{section.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <div className="space-y-2 md:space-y-3">
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
                  className="flex items-center gap-2 text-sm md:text-base hover:text-primary transition-colors py-2 md:py-1 -mx-2 md:mx-0 px-2 md:px-0 rounded-md md:rounded-none -my-1 md:my-0"
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
                    <ExternalLink className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-opacity" />
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


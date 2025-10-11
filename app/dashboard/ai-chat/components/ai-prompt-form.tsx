"use client"

import { useMemo, useState } from "react"
import {
  IconArrowUp,
  IconAt,
  IconPaperclip,
  IconWorld,
  IconX,
} from "@tabler/icons-react"

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { navItems } from "../../components/sidebar/data"
import { LucideIcon } from "lucide-react"

interface MentionableItem {
  title: string
  image: LucideIcon
}

interface AiPromptFormProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  disabled?: boolean
}

const DATA = {
  mentionable: navItems.map((item) => ({
    title: item.title,
    image: item.icon,
  })),
  modes: [
    {
      name: "Auto",
    },
    {
      name: "Agent",
    },
    {
      name: "Ask",
    },
  ],
}

function MentionableIcon({ item }: { item: MentionableItem }) {
  return (
    <span className="flex size-4 items-center justify-center">
      <item.image className="size-4" />
    </span>
  )
}

export function AiPromptForm({ input, onInputChange, onSubmit, disabled = false }: AiPromptFormProps) {
  const [mentions, setMentions] = useState<string[]>([])
  const [mentionPopoverOpen, setMentionPopoverOpen] = useState(false)
  const [modePopoverOpen, setModePopoverOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<(typeof DATA.modes)[0]>(
    DATA.modes[0]
  )
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false)

  const availableItems = useMemo(() => {
    return DATA.mentionable.filter((item) => !mentions.includes(item.title))
  }, [mentions])

  const hasMentions = mentions.length > 0

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e as any)
    }
  }

  return (
    <form onSubmit={onSubmit} className="[--radius:1.2rem]">
      <Field>
        <FieldLabel htmlFor="ai-prompt" className="sr-only">
          Prompt
        </FieldLabel>
        <InputGroup className="bg-background dark:bg-background shadow-none">
          <InputGroupTextarea
            id="ai-prompt"
            placeholder="Ask, search, or make anything..."
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />
          <InputGroupAddon align="block-start">
            <Popover
              open={mentionPopoverOpen}
              onOpenChange={setMentionPopoverOpen}
            >
              <Tooltip>
                <TooltipTrigger
                  asChild
                  onFocusCapture={(e) => e.stopPropagation()}
                >
                  <PopoverTrigger asChild>
                    <InputGroupButton
                      variant="outline"
                      size={!hasMentions ? "sm" : "icon-sm"}
                      className="rounded-full transition-transform"
                      disabled={disabled}
                    >
                      <IconAt /> {!hasMentions && "Add context"}
                    </InputGroupButton>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Add context to your prompt</TooltipContent>
              </Tooltip>
              <PopoverContent className="p-0 [--radius:1.2rem]" align="start">
                <Command>
                  <CommandInput placeholder="Search pages..." />
                  <CommandList>
                    <CommandEmpty>No pages found</CommandEmpty>
                    {availableItems.map((item) => (
                      <CommandItem
                        key={item.title}
                        value={item.title}
                        onSelect={(currentValue) => {
                          setMentions((prev) => [...prev, currentValue])
                          setMentionPopoverOpen(false)
                        }}
                      >
                        <MentionableIcon item={item} />
                        {item.title}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected mentions */}
            <div className="no-scrollbar -m-1.5 flex gap-1 overflow-y-auto p-1.5">
              {mentions.map((mention) => {
                const item = DATA.mentionable.find(
                  (item) => item.title === mention
                )

                if (!item) {
                  return null
                }

                return (
                  <InputGroupButton
                    key={mention}
                    size="sm"
                    variant="secondary"
                    className="rounded-full !pl-2"
                    onClick={() => {
                      setMentions((prev) => prev.filter((m) => m !== mention))
                    }}
                    disabled={disabled}
                  >
                    <MentionableIcon item={item} />
                    {item.title}
                    <IconX className="size-3" />
                  </InputGroupButton>
                )
              })}
            </div>
          </InputGroupAddon>

          <InputGroupAddon align="block-end" className="gap-1">
            {/* Attach file button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton
                  size="icon-sm"
                  className="rounded-full"
                  aria-label="Attach file"
                  disabled={disabled}
                >
                  <IconPaperclip />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>

            {/* AI Mode selector */}
            <DropdownMenu
              open={modePopoverOpen}
              onOpenChange={setModePopoverOpen}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <InputGroupButton 
                      size="sm" 
                      className="rounded-full"
                      disabled={disabled}
                    >
                      {selectedMode.name}
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Select AI mode</TooltipContent>
              </Tooltip>
              <DropdownMenuContent
                side="top"
                align="start"
                className="[--radius:1rem]"
              >
                <DropdownMenuGroup className="w-42">
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    Select AI Mode
                  </DropdownMenuLabel>
                  {DATA.modes.map((mode) => (
                    <DropdownMenuCheckboxItem
                      key={mode.name}
                      checked={mode.name === selectedMode.name}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMode(mode)
                        }
                      }}
                      className="pl-2 pr-8 [&>span]:left-auto [&>span]:right-2"
                    >
                      {mode.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Scope/Sources selector */}
            <DropdownMenu open={scopeMenuOpen} onOpenChange={setScopeMenuOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <InputGroupButton 
                      size="sm" 
                      className="rounded-full"
                      disabled={disabled}
                    >
                      <IconWorld /> All Sources
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Configure AI sources</TooltipContent>
              </Tooltip>
              <DropdownMenuContent
                side="top"
                align="end"
                className="[--radius:1rem]"
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    asChild
                    onSelect={(e) => e.preventDefault()}
                  >
                    <label htmlFor="web-search">
                      <IconWorld /> Web Search{" "}
                      <Switch
                        id="web-search"
                        className="ml-auto"
                        defaultChecked
                      />
                    </label>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Send button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton
                  type="submit"
                  aria-label="Send"
                  className="ml-auto rounded-full"
                  variant="default"
                  size="icon-sm"
                  disabled={disabled || !input.trim()}
                >
                  <IconArrowUp />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>Send message (Enter)</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </form>
  )
}
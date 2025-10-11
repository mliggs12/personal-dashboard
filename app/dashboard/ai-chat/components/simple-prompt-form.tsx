"use client"

import { useEffect, useRef } from "react"
import { IconArrowUp } from "@tabler/icons-react"

import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SimplePromptFormProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  disabled?: boolean
}

export function SimplePromptForm({ 
  input, 
  onInputChange, 
  onSubmit, 
  disabled = false 
}: SimplePromptFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && input.trim()) {
        onSubmit(e as any)
      }
    }
  }

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [input])

  // Auto-focus on input when not disabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [disabled])

  return (
    <form onSubmit={onSubmit} className="[--radius:1.2rem] p-3 md:p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Field>
        <FieldLabel htmlFor="ai-prompt" className="sr-only">
          Prompt
        </FieldLabel>
        <InputGroup className="bg-background shadow-sm">
          <InputGroupTextarea
            ref={textareaRef}
            id="ai-prompt"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            className="resize-none min-h-[44px] max-h-[120px] md:max-h-[200px] text-base"
          />
          <InputGroupAddon align="block-end" className="gap-1">
            {/* Send button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton
                  type="submit"
                  aria-label="Send message"
                  className="rounded-full"
                  variant="default"
                  size="icon-sm"
                  disabled={disabled || !input.trim()}
                >
                  <IconArrowUp />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send message (Enter)</p>
                <p className="text-xs text-muted-foreground mt-1">Shift+Enter for new line</p>
              </TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </form>
  )
}


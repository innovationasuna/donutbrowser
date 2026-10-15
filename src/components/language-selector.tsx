"use client";

import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuChevronsUpDown } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import languageOptions from "@/lib/browser-language-options.json";
import { cn } from "@/lib/utils";
import type { WayfernConfig } from "@/types";

export function LanguageSelector({
  config,
  onConfigChange,
  readOnly = false,
}: {
  config: WayfernConfig;
  onConfigChange: (key: keyof WayfernConfig, value: unknown) => void;
  readOnly?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [open, setOpen] = useState(false);
  const selected = config.language_override;
  const names = useMemo(
    () =>
      new Intl.DisplayNames([i18n.resolvedLanguage || "en"], {
        type: "language",
      }),
    [i18n.resolvedLanguage],
  );
  const label = (language: string) =>
    `${names.of(language) || language} (${language})`;
  const languages = selected
    ? Array.from(new Set([selected, selected.split("-")[0]]))
    : [];

  return (
    <div className="space-y-3 rounded-lg bg-foreground/4 p-4">
      <Label htmlFor={`${id}-language-mode`}>
        {t("fingerprint.languageModeLabel")}
      </Label>
      <Select
        value={selected ? "manual" : "auto"}
        onValueChange={(mode) => {
          onConfigChange(
            "language_override",
            mode === "manual" ? "en-US" : null,
          );
        }}
        disabled={readOnly}
      >
        <SelectTrigger id={`${id}-language-mode`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">
            {t("fingerprint.languageModeAuto")}
          </SelectItem>
          <SelectItem value="manual">
            {t("fingerprint.languageModeManual")}
          </SelectItem>
        </SelectContent>
      </Select>
      {selected && (
        <div className="space-y-2">
          <Label htmlFor={`${id}-language-locale`}>
            {t("fingerprint.languageLocale")}
          </Label>
          <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
              <Button
                id={`${id}-language-locale`}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
                disabled={readOnly}
              >
                {label(selected)}
                <LuChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 overflow-hidden p-0" align="start">
              <Command className="h-auto">
                <CommandInput placeholder={t("fingerprint.languageSearch")} />
                <CommandList className="max-h-[min(20rem,calc(var(--radix-popover-content-available-height)-2.5rem))] overscroll-contain">
                  <CommandEmpty>
                    {t("fingerprint.languageNoResults")}
                  </CommandEmpty>
                  <CommandGroup>
                    {languageOptions.map((locale) => (
                      <CommandItem
                        key={locale}
                        data-language={locale}
                        value={`${locale} ${label(locale)}`}
                        onSelect={() => {
                          onConfigChange("language_override", locale);
                          setOpen(false);
                        }}
                      >
                        <LuCheck
                          className={cn(
                            "mr-2 size-4 shrink-0",
                            selected === locale ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {label(locale)}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        {selected
          ? t("fingerprint.languageChoiceDescription", {
              languages: languages.join(", "),
            })
          : t("fingerprint.languageAutoDescription")}
      </p>
    </div>
  );
}

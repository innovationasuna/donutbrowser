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
import { cn } from "@/lib/utils";
import type { WayfernConfig } from "@/types";

function locationTimezone(config: WayfernConfig): string {
  try {
    const timezone = JSON.parse(config.location ?? "{}").timezone;
    if (typeof timezone === "string" && timezone) return timezone;
  } catch {
    // A missing stored location still allows an explicit timezone selection.
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function TimezoneSelector({
  config,
  onConfigChange,
  readOnly = false,
}: {
  config: WayfernConfig;
  onConfigChange: (key: keyof WayfernConfig, value: unknown) => void;
  readOnly?: boolean;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [open, setOpen] = useState(false);
  const selected = config.timezone_override;
  const zones = useMemo(() => {
    const intl = Intl as typeof Intl & {
      supportedValuesOf?: (key: string) => string[];
    };
    return Array.from(
      new Set([
        "UTC",
        ...(intl.supportedValuesOf?.("timeZone") ?? [
          "America/Los_Angeles",
          "America/Chicago",
          "America/New_York",
          "Europe/London",
          "Asia/Taipei",
          "Asia/Shanghai",
          "Asia/Tokyo",
        ]),
        ...(selected ? [selected] : []),
      ]),
    ).sort();
  }, [selected]);

  return (
    <div className="space-y-3 rounded-lg bg-foreground/4 p-4">
      <Label htmlFor={`${id}-timezone-mode`}>
        {t("fingerprint.timezoneModeLabel")}
      </Label>
      <Select
        value={selected ? "manual" : "auto"}
        onValueChange={(mode) => {
          onConfigChange(
            "timezone_override",
            mode === "manual" ? locationTimezone(config) : null,
          );
        }}
        disabled={readOnly}
      >
        <SelectTrigger id={`${id}-timezone-mode`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">
            {t("fingerprint.timezoneModeAuto")}
          </SelectItem>
          <SelectItem value="manual">
            {t("fingerprint.timezoneModeManual")}
          </SelectItem>
        </SelectContent>
      </Select>
      {selected && (
        <div className="space-y-2">
          <Label htmlFor={`${id}-timezone-zone`}>
            {t("fingerprint.timezoneIana")}
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id={`${id}-timezone-zone`}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-controls={`${id}-timezone-zones`}
                className="w-full justify-between font-normal"
                disabled={readOnly}
              >
                {selected}
                <LuChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder={t("fingerprint.timezoneSearch")} />
                <CommandList id={`${id}-timezone-zones`}>
                  <CommandEmpty>
                    {t("fingerprint.timezoneNoResults")}
                  </CommandEmpty>
                  <CommandGroup>
                    {zones.map((zone) => (
                      <CommandItem
                        key={zone}
                        value={zone}
                        onSelect={() => {
                          onConfigChange("timezone_override", zone);
                          setOpen(false);
                        }}
                      >
                        <LuCheck
                          className={cn(
                            "mr-2 size-4 shrink-0",
                            selected === zone ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {zone}
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
        {t("fingerprint.timezoneChoiceDescription")}
      </p>
    </div>
  );
}

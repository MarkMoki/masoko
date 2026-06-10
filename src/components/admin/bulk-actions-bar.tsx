"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Trash2, Power, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type BulkAction = "delete" | "toggle_active" | "update_status" | "mark_read";

type BulkActionsBarProps<T extends { id: string }> = {
  items: T[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  entity: string;
  onActionComplete?: () => void;
  actions?: BulkAction[];
  extraActions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    variant?: "default" | "outline" | "destructive";
    onClick: (ids: string[]) => void;
  }>;
};

export function BulkActionsBar<T extends { id: string }>({
  items,
  selectedIds,
  onSelectionChange,
  entity,
  onActionComplete,
  actions = ["delete", "toggle_active"],
  extraActions = [],
}: BulkActionsBarProps<T>) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const allSelected = items.length > 0 && selectedIds.size === items.length;

  function toggleAll() {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map((i) => i.id)));
    }
  }

  const bulkAction = useCallback(
    async (action: BulkAction, extra: Record<string, unknown> = {}) => {
      if (selectedIds.size === 0) return;
      setLoading(true);
      try {
        const res = await apiFetch<{
          success: number;
          failed: number;
          entity: string;
          action: string;
        }>("/api/admin/bulk", {
          method: "PATCH",
          body: JSON.stringify({
            entity,
            action,
            ids: Array.from(selectedIds),
            ...extra,
          }),
        });

        if (res.failed > 0) {
          toast({
            title: "Partially completed",
            description: `${res.success} succeeded, ${res.failed} failed`,
            variant: "error",
          });
        } else {
          toast({
            title: "Bulk action completed",
            description: `${res.success} items ${action === "delete" ? "deleted" : "updated"}`,
            variant: "success",
          });
        }

        onSelectionChange(new Set());
        onActionComplete?.();
      } catch {
        toast({
          title: "Bulk action failed",
          description: "Please try again.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedIds, entity, onSelectionChange, onActionComplete, toast]
  );

  if (items.length === 0) return null;

  return (
    <div className="sticky top-0 z-30 -mx-2 mb-3 rounded-xl border bg-background/95 backdrop-blur-md p-2.5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) (el as HTMLInputElement).indeterminate = selectedIds.size > 0 && !allSelected;
              }}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-primary"
            />
            <span className="text-xs font-medium text-muted-foreground">
              {selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : "Select all"}
            </span>
          </label>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 ml-auto">
            {actions.includes("toggle_active") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkAction("toggle_active")}
                disabled={loading}
                className="h-9 text-xs"
              >
                <Power className="h-3.5 w-3.5 mr-1" />
                Toggle Active
              </Button>
            )}

            {actions.includes("mark_read") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkAction("mark_read")}
                disabled={loading}
                className="h-9 text-xs"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Mark Read
              </Button>
            )}

            {extraActions.map((ea) => (
              <Button
                key={ea.key}
                size="sm"
                variant={ea.variant || "outline"}
                onClick={() => {
                  ea.onClick(Array.from(selectedIds));
                  onSelectionChange(new Set());
                }}
                disabled={loading}
                className="h-9 text-xs"
              >
                {ea.icon}
                {ea.label}
              </Button>
            ))}

            {actions.includes("delete") && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => bulkAction("delete")}
                disabled={loading}
                className="h-9 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

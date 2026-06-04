"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

type ImageUploadProps = {
  folder: "products" | "stores";
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
};

export function ImageUpload({
  folder,
  value,
  onChange,
  label = "Image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {value ? (
        <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-lg border bg-muted">
          <Image src={value} alt="Upload preview" fill className="object-cover" />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute right-2 top-2 h-8 w-8"
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="flex h-40 max-w-xs cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50 hover:bg-muted"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {uploading ? "Uploading..." : "Click to upload"}
          </p>
        </div>
      )}
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

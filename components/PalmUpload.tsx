"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";

interface PalmUploadProps {
  latestScan?: {
    generatedSummary?: string | null;
    createdAt: string | Date;
  } | null;
  onUpload: (imageUrl: string) => Promise<void>;
  loading?: boolean;
}

export function PalmUpload({ latestScan, onUpload, loading }: PalmUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      // TODO: Upload the file to your storage provider (Vercel Blob / S3 / UploadThing)
      // and pass the returned HTTPS URL to onUpload().
      //
      // Example with Vercel Blob:
      //   const { url } = await put(file.name, file, { access: "public" });
      //   await onUpload(url);
      //
      // The API endpoint rejects data: URLs to prevent DB bloat.
      // Until a storage provider is wired up, this button is intentionally disabled.
      setUploadError(
        "Image storage is not yet configured. Set up Vercel Blob or another provider to enable palm uploads."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <h2 className="text-xl font-bold text-white mb-2">🤚 Palm Reading (Left Hand)</h2>
      <p className="text-slate-400 text-sm mb-4">
        Upload a clear photo of your <strong className="text-indigo-300">left hand</strong> with
        your palm facing the camera. Use good lighting for best results.
      </p>

      {latestScan ? (
        <div className="space-y-4">
          <div className="bg-indigo-900/30 rounded-xl p-4 border border-indigo-500/20">
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {latestScan.generatedSummary}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Last scanned:{" "}
            {new Date(latestScan.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            Re-scan Palm
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Palm preview" className="max-h-48 mx-auto rounded-lg" />
          ) : (
            <>
              <div className="text-4xl mb-3">📷</div>
              <p className="text-slate-400 text-sm">
                Tap to take a photo or upload from your gallery
              </p>
              <p className="text-slate-500 text-xs mt-1">JPG, PNG up to 10MB</p>
            </>
          )}
        </div>
      )}

      {uploadError && (
        <p className="mt-3 text-sm text-amber-400 bg-amber-900/20 rounded-lg px-3 py-2">
          {uploadError}
        </p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview && !latestScan && (
        <Button
          className="w-full mt-4"
          disabled={uploading || loading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading || loading ? "Analyzing your palm…" : "Analyze Palm"}
        </Button>
      )}
    </div>
  );
}

import { UploadCloud } from "lucide-react";

export function FileUploadCard({
  file,
  onFile,
  title = "Drop or choose an electricity bill image",
  helper = "JPG, PNG, WEBP, PDF, or a clear bill screenshot.",
  accept = "image/png,image/jpeg,image/webp,application/pdf"
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  title?: string;
  helper?: string;
  accept?: string;
}) {
  return (
    <label className="block cursor-pointer rounded-lg border border-dashed border-neon-green/40 bg-neon-green/10 p-5 text-center transition hover:bg-neon-green/15">
      <UploadCloud className="mx-auto text-neon-green" size={32} />
      <p className="mt-3 font-bold">{file ? file.name : title}</p>
      <p className="mt-1 text-sm text-slate-400">{helper}</p>
      <input className="sr-only" type="file" accept={accept} aria-label={title} onChange={(event) => onFile(event.target.files?.[0] ?? null)} />
    </label>
  );
}

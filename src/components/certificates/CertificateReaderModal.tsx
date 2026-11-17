"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  ShieldCheck,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { CertificationDoc } from "@/lib/db/types";

interface ReaderProps {
  cert: CertificationDoc | null;
  onClose: () => void;
}

export function CertificateReaderModal({ cert, onClose }: ReaderProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [turnKey, setTurnKey] = useState(0);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  useEffect(() => {
    setPageNumber(1);
    setZoom(1.1);
    setPdfError(null);
  }, [cert?._id]);

  useEffect(() => {
    if (!cert || !cert.documentUrl || cert.documentType !== "pdf") return;

    let cancelled = false;
    setLoadingPdf(true);
    setPdfError(null);

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const loadingTask = pdfjs.getDocument(cert.documentUrl!);
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        setNumPages(pdf.numPages);

        const page = await pdf.getPage(Math.min(pageNumber, pdf.numPages));
        if (cancelled) return;
        const viewport = page.getViewport({ scale: zoom * 1.35 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        if (!cancelled) {
          setPdfError((err as Error).message || "Unable to render PDF document.");
        }
      } finally {
        if (!cancelled) setLoadingPdf(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cert, pageNumber, zoom]);

  if (!cert) return null;

  const toggleFullscreen = async () => {
    const el = modalRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const changePage = (delta: number) => {
    setPageNumber((p) => {
      const next = Math.min(numPages, Math.max(1, p + delta));
      if (next !== p) setTurnKey((k) => k + 1);
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-lg sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Certificate viewer for ${cert.title}`}
    >
      <div
        ref={modalRef}
        className="glass-panel flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-cyan-400/25"
      >
        {/* Top Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0b0e14] px-5 py-3.5">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              {cert.title}
            </div>
            <div className="text-xs text-slate-400">
              {cert.issuer}
              {cert.location ? ` · ${cert.location}` : ""} · {cert.issueDate}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {cert.documentType === "pdf" && cert.documentUrl && (
              <>
                <button
                  type="button"
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1}
                  className="rounded-lg border border-white/15 bg-white/5 p-1.5 text-slate-200 disabled:opacity-40"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-mono text-xs text-slate-300">
                  Page {pageNumber} / {numPages}
                </span>
                <button
                  type="button"
                  onClick={() => changePage(1)}
                  disabled={pageNumber >= numPages}
                  className="rounded-lg border border-white/15 bg-white/5 p-1.5 text-slate-200 disabled:opacity-40"
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
              className="rounded-lg border border-white/15 bg-white/5 p-1.5 text-slate-200 hover:border-cyan-400/40"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="font-mono text-xs text-slate-300">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
              className="rounded-lg border border-white/15 bg-white/5 p-1.5 text-slate-200 hover:border-cyan-400/40"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-lg border border-white/15 bg-white/5 p-1.5 text-slate-200 hover:border-cyan-400/40"
              title="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {cert.documentUrl && (
              <a
                href={cert.documentUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
              >
                <Download className="h-3.5 w-3.5" />
                Download Original
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/15 bg-white/5 p-1.5 text-slate-300 hover:text-white"
              aria-label="Close certificate reader"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewport Body with 3D Page-Turn Perspective */}
        <div className="perspective-1200 flex-1 overflow-auto bg-[#06080d] p-5 sm:p-8">
          {cert.documentType === "pdf" && cert.documentUrl ? (
            <div key={turnKey} className="animate-page-turn mx-auto flex flex-col items-center">
              {loadingPdf && (
                <div className="mb-3 text-xs text-cyan-300">Rendering original PDF page...</div>
              )}
              {pdfError ? (
                <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">
                  {pdfError}
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className="max-w-full rounded-xl border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.85)]"
                />
              )}
            </div>
          ) : cert.documentType === "image" && cert.documentUrl ? (
            <div
              key={turnKey}
              className="animate-page-turn mx-auto flex justify-center"
              style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
            >
              <img
                src={cert.documentUrl}
                alt={`${cert.title} certificate document`}
                className="max-h-[72vh] rounded-xl border border-white/15 shadow-2xl"
              />
            </div>
          ) : (
            <div
              className="animate-page-turn mx-auto max-w-2xl rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-[#101521] via-[#0b0e15] to-[#080a10] p-8 shadow-2xl"
              style={{ transform: `scale(${Math.min(zoom, 1.3)})`, transformOrigin: "top center" }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
                  Verified Resume Credential
                </span>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 text-[11px] text-amber-200">
                  Original Document Pending Admin Upload
                </span>
              </div>

              <h3 className="mt-6 font-display text-2xl font-bold text-white">{cert.title}</h3>
              <p className="mt-2 text-sm text-cyan-300">
                Issued by {cert.issuer}
                {cert.location ? ` (${cert.location})` : ""} · {cert.issueDate}
              </p>

              <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-slate-300">
                <p>{cert.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-xs text-slate-400">
                  <div>
                    <span className="block text-slate-500">Recipient</span>
                    <span className="font-medium text-slate-200">Indrajeet Kumar (Shourya Sinha)</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Credential ID</span>
                    <span className="font-medium text-slate-200">
                      {cert.credentialId || "Listed on verified resume"}
                    </span>
                  </div>
                </div>
              </div>

              {cert.verificationUrl && (
                <a
                  href={cert.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Open External Verification <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

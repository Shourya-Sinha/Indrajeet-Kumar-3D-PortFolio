"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Download,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import type {
  FreelanceServiceDoc,
  ServiceDoc,
  SiteSettingsDoc,
} from "@/lib/db/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { Section3DReveal } from "@/components/ui/Section3DReveal";

const ContactPortalCanvas = dynamic(
  () => import("@/components/three/ContactPortalCanvas").then((m) => m.ContactPortalCanvas),
  { ssr: false }
);

export function FreelanceContactSection({
  freelanceServices,
  allServices,
  settings,
  preselectedService,
  latestResumeVersion,
}: {
  freelanceServices: FreelanceServiceDoc[];
  allServices: ServiceDoc[];
  settings: SiteSettingsDoc;
  preselectedService?: string;
  latestResumeVersion?: string;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceCategory, setServiceCategory] = useState(
    preselectedService || freelanceServices[0]?.title || "Full-Stack Development"
  );
  const [budget, setBudget] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<
    "Email" | "Phone" | "WhatsApp" | "LinkedIn"
  >("Email");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (preselectedService) {
      setServiceCategory(preselectedService);
    }
  }, [preselectedService]);

  const serviceOptions = Array.from(
    new Set([
      ...freelanceServices.map((f) => f.title),
      ...allServices.map((s) => s.title),
    ])
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const resp = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          serviceCategory,
          budget,
          preferredContactMethod,
          description,
        }),
      });
      const json = (await resp.json()) as { ok: boolean; message?: string; error?: string };
      if (!resp.ok || !json.ok) {
        setFeedback({ type: "err", text: json.error || "Unable to submit inquiry." });
      } else {
        setFeedback({
          type: "ok",
          text: json.message || "Inquiry submitted successfully.",
        });
        setFullName("");
        setEmail("");
        setPhone("");
        setBudget("");
        setDescription("");
      }
    } catch {
      setFeedback({ type: "err", text: "Network error while sending inquiry." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Freelance Solutions Showcase */}
      <section id="freelance" className="relative py-24 sm:py-32">
        <Section3DReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Freelance & Consulting"
            title="Let's Build Something Exceptional."
            subtitle="Direct end-to-end engineering engagements spanning web applications, React Native mobile products, local AI automation, cloud DevOps, and authorized security hardening."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {freelanceServices.map((pkg) => (
              <div key={pkg._id} data-3d-card>
                <TiltCard3D maxTilt={11} depth={22}>
                  <div className="glass-panel glass-panel-hover preserve-3d flex h-full flex-col justify-between rounded-3xl p-6">
                    <div className="preserve-3d">
                      <span className="depth-z-2 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-medium text-cyan-300">
                        {pkg.category}
                      </span>
                      <h3 className="depth-z-2 mt-3 font-display text-lg font-bold text-white">
                        {pkg.title}
                      </h3>
                      <p className="depth-z-1 mt-2 text-xs leading-relaxed text-slate-300">
                        {pkg.description}
                      </p>
                      <ul className="depth-z-1 mt-4 space-y-1.5 text-xs text-slate-300">
                        {pkg.deliverables.map((d) => (
                          <li key={d} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="depth-z-2 mt-6 border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-cyan-300" />
                          {pkg.timelineEstimate}
                        </span>
                        <span className="font-semibold text-white">{pkg.startingBudget}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setServiceCategory(pkg.title);
                          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="mt-3 w-full rounded-xl border border-cyan-400/35 bg-cyan-400/10 py-2 text-xs font-semibold text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-400/20"
                      >
                        Inquire About This Scope
                      </button>
                    </div>
                  </div>
                </TiltCard3D>
              </div>
            ))}
          </div>
        </Section3DReveal>
      </section>

      {/* Contact 3D Portal & Inquiry Section */}
      <section id="contact" className="relative py-24 sm:py-32">
        <Section3DReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Direct Engineering Contact"
            title="Start a Conversation"
            subtitle="Submit project specifications, hiring inquiries, or security consulting scopes directly into the CMS inquiry queue and support@anantainfratechsolutions.com."
          />

          <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-12">
            {/* Left: 3D Portal + Direct Channels */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              <div data-3d-card>
                <TiltCard3D maxTilt={10} depth={22}>
                  <div className="glass-panel glass-panel-hover relative h-64 overflow-hidden rounded-3xl">
                    <ContactPortalCanvas />
                  </div>
                </TiltCard3D>
              </div>

              <div data-3d-card className="flex-1">
                <TiltCard3D maxTilt={7} depth={18} className="h-full">
                  <div className="glass-panel glass-panel-hover preserve-3d flex h-full flex-col space-y-4 rounded-3xl p-6">
                    <h3 className="depth-z-2 font-display text-lg font-bold text-white">
                      Verified Contact Channels
                    </h3>

                    <div className="depth-z-1 space-y-3 text-sm">
                      <a
                        href={`mailto:${settings.contactEmail}`}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-slate-200 transition hover:border-cyan-400/40"
                      >
                        <Mail className="h-4 w-4 text-cyan-300" />
                        <span>{settings.contactEmail}</span>
                      </a>

                      <a
                        href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-slate-200 transition hover:border-cyan-400/40"
                      >
                        <Phone className="h-4 w-4 text-cyan-300" />
                        <span>{settings.contactPhone}</span>
                      </a>

                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-slate-300">
                        <MapPin className="h-4 w-4 text-cyan-300" />
                        <span>{settings.location}</span>
                      </div>

                      <div className="flex gap-3 pt-1">
                        <a
                          href={settings.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-400/40"
                        >
                          <Github className="h-4 w-4 text-cyan-300" /> GitHub
                        </a>
                        <a
                          href={settings.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-400/40"
                        >
                          <Linkedin className="h-4 w-4 text-cyan-300" /> LinkedIn
                        </a>
                      </div>

                      <Link
                        href="/resume"
                        className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/35 bg-cyan-400/10 py-2.5 text-xs font-semibold text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-400/20"
                      >
                        <Download className="h-4 w-4" />
                        Download Resume ({latestResumeVersion || "v1.0"})
                      </Link>
                    </div>
                  </div>
                </TiltCard3D>
              </div>
            </div>

            {/* Right: 3D Inquiry Form */}
            <div data-3d-card className="lg:col-span-7">
              <TiltCard3D maxTilt={4} depth={14} className="h-full">
                <form
                  onSubmit={handleSubmit}
                  className="glass-panel glass-panel-hover preserve-3d h-full space-y-5 rounded-3xl p-6 sm:p-8"
                >
                  <div className="depth-z-1 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                        Full Name *
                      </label>
                      <input
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-white/15 bg-[#07090d] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full rounded-xl border border-white/15 bg-[#07090d] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="depth-z-1 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                        Phone (Optional)
                      </label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 ..."
                        className="w-full rounded-xl border border-white/15 bg-[#07090d] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                        Service Category *
                      </label>
                      <select
                        value={serviceCategory}
                        onChange={(e) => setServiceCategory(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-[#07090d] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      >
                        {serviceOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="depth-z-1 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                        Project Budget (Optional)
                      </label>
                      <input
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g. $1,500 – $5,000 or Monthly Retainer"
                        className="w-full rounded-xl border border-white/15 bg-[#07090d] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                        Preferred Contact Method
                      </label>
                      <select
                        value={preferredContactMethod}
                        onChange={(e) =>
                          setPreferredContactMethod(
                            e.target.value as "Email" | "Phone" | "WhatsApp" | "LinkedIn"
                          )
                        }
                        className="w-full rounded-xl border border-white/15 bg-[#07090d] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      >
                        <option value="Email">Email</option>
                        <option value="Phone">Phone</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="LinkedIn">LinkedIn</option>
                      </select>
                    </div>
                  </div>

                  <div className="depth-z-1">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Project Scope & Requirements *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Share your goals, architecture requirements, timeline, or role details..."
                      className="w-full rounded-xl border border-white/15 bg-[#07090d] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  {feedback && (
                    <div
                      className={`rounded-xl border px-4 py-3 text-xs ${
                        feedback.type === "ok"
                          ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-200"
                          : "border-rose-400/35 bg-rose-400/10 text-rose-200"
                      }`}
                    >
                      {feedback.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="depth-z-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_6px_0_rgba(14,116,144,0.7),0_0_28px_rgba(0,229,255,0.28)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Sending Inquiry..." : "Submit Project Inquiry"}
                  </button>
                </form>
              </TiltCard3D>
            </div>
          </div>
        </Section3DReveal>
      </section>
    </>
  );
}

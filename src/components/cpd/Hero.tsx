import { Link } from "react-router-dom";
import { ArrowRight, Award, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS = [
  { icon: Users,    value: "40+",  label: "Departments" },
  { icon: BookOpen, value: "CPD",  label: "Tracked Hours" },
  { icon: Award,    value: "100%", label: "Digital Process" },
];

const STEPS = [
  { num: "01", label: "Plan" },
  { num: "02", label: "Submit" },
  { num: "03", label: "Verify" },
];

export const Hero = () => {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-background">

      {/* ── Background decorative shapes ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* large navy arc top-right */}
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/5" />
        <div className="absolute -right-20 -top-20 h-[380px] w-[380px] rounded-full bg-primary/8" />
        {/* orange glow bottom-left */}
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        {/* fine dot grid */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="hsl(204 82% 20%)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="container relative mx-auto flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-12 pt-28 sm:pt-32 lg:flex-row lg:items-center lg:gap-0 lg:pt-0">

          {/* ── Left: copy ── */}
          <div className="flex flex-1 flex-col justify-center lg:py-24 lg:pr-16">

            {/* Eyebrow */}
            <div className="flex items-center gap-2.5">
              <span className="h-px w-8 bg-secondary" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Human Capital Department · UniKL RCMP
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[3.6rem] xl:text-[4.2rem]">
              Empowering
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-secondary">Excellence</span>
                {/* underline squiggle */}
                <svg aria-hidden className="absolute -bottom-1 left-0 w-full" viewBox="0 0 220 8" fill="none" preserveAspectRatio="none">
                  <path d="M2 5.5 C 40 1, 80 8, 120 4.5 S 180 1, 218 5.5" stroke="hsl(33 100% 57% / 0.4)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </svg>
              </span>
              <br />
              Through Training.
            </h1>

            {/* Sub-copy */}
            <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              The official platform for UniKL RCMP staff to plan, submit, and track Continuous
              Professional Development requisitions and annual training hours.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="group h-12 gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 sm:px-8"
                asChild
              >
                <Link to="/login">
                  Get started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="h-12 rounded-full px-7 text-base font-semibold text-foreground hover:bg-muted sm:px-8"
                asChild
              >
                <a href="#faq">Help / FAQ</a>
              </Button>
            </div>

            {/* Steps */}
            <div className="mt-12 flex items-center gap-0">
              {STEPS.map((step, i) => (
                <div key={step.num} className="flex items-center">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-secondary/40 text-[10px] font-bold text-secondary">
                      {step.num}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{step.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <span className="mx-3 h-px w-8 bg-border sm:w-12" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: visual panel ── */}
          <div className="relative flex shrink-0 items-center justify-center pb-12 lg:w-[42%] lg:py-24">

            {/* Main card */}
            <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-[0_24px_64px_-12px_hsl(204_82%_20%/0.18)]">

              {/* Card accent bar */}
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-primary via-secondary to-primary/60" />

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                  <img src="/unikl-rcmp.png" alt="RCMP" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">HCD Portal</p>
                  <p className="text-xs text-muted-foreground">CPD Management System</p>
                </div>
              </div>

              {/* Stat rows */}
              <div className="grid gap-3">
                {STATS.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/15">
                        <stat.icon className="h-4 w-4 text-secondary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{stat.label}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Progress bar decoration */}
              <div className="mt-6 rounded-xl bg-muted p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">CPD Completion</span>
                  <span className="text-xs font-bold text-secondary">78%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-secondary to-secondary/70" />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">Academic Year 2025/2026</p>
              </div>
            </div>

            {/* Floating chip — top right */}
            <div className="absolute -right-2 top-16 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-md lg:-right-6 lg:top-28">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-semibold text-foreground">Live tracking</span>
            </div>

            {/* Floating chip — bottom left */}
            <div className="absolute -left-2 bottom-20 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-md lg:-left-6">
              <Award className="h-3.5 w-3.5 text-secondary" />
              <span className="text-xs font-semibold text-foreground">Accredited CPD</span>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-border/70 py-5">
          <p className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Royal College of Medicine Perak · UniKL · Human Capital Department
          </p>
        </div>
      </div>
    </section>
  );
};

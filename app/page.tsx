"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck2,
  ChevronDown,
  CircleCheck,
  Compass,
  Info,
  Menu,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";

const navItems = [
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Student Orgs", href: "#student-orgs" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const companyTickerNames = [
  "Campbell's Company",
  "KPMG",
  "LEK Consulting",
  "McKinsey & Company",
  "Five Below",
  "CVS/Aetna",
];

const processSteps = [
  {
    title: "Book a free intro call",
    description:
      "Pick a quick 15-minute slot so we can learn your goals and timelines.",
    icon: CalendarCheck2,
  },
  {
    title: "Get a tailored plan",
    description:
      "Receive specific support for your resume, LinkedIn, and mentorship needs.",
    icon: Compass,
  },
  {
    title: "Apply with confidence",
    description:
      "Use polished materials and clear strategy to submit stronger applications.",
    icon: CircleCheck,
  },
];

type ServiceTier = {
  title: string;
  standardPrice: string;
  studentPrice: string;
  summary: string;
  features: string[];
  popular: boolean;
};

const servicePricing: ServiceTier[] = [
  {
    title: "Free Intro Call",
    standardPrice: "$0",
    studentPrice: "$0",
    summary: "15-min, no pressure. See if we're a fit.",
    features: ["Career goals review", "Quick resume diagnosis", "Suggested next step"],
    popular: false,
  },
  {
    title: "Resume Refresh",
    standardPrice: "$190",
    studentPrice: "$95",
    summary: "Full rewrite + ATS check + 1 revision round",
    features: [
      "Bullet-by-bullet rewrite",
      "ATS formatting scan",
      "One revision round included",
    ],
    popular: false,
  },
  {
    title: "LinkedIn Optimization",
    standardPrice: "$170",
    studentPrice: "$85",
    summary: "Headline, About, experience, keywords",
    features: [
      "Headline + About rewrite",
      "Experience positioning",
      "Keyword optimization pass",
    ],
    popular: false,
  },
  {
    title: "Resume + LinkedIn Bundle",
    standardPrice: "$350",
    studentPrice: "$175",
    summary: "Most popular package for internship and full-time recruiting.",
    features: [
      "Complete resume rewrite",
      "Full LinkedIn profile optimization",
      "Consistent personal brand messaging",
    ],
    popular: true,
  },
  {
    title: "Career Mentorship (Single Session)",
    standardPrice: "$130",
    studentPrice: "$65",
    summary: "45-min 1:1 call",
    features: [
      "Interview prep strategy",
      "Application game plan",
      "Q&A on internships and recruiting",
    ],
    popular: false,
  },
  {
    title: "Career Mentorship (Monthly)",
    standardPrice: "$360/mo",
    studentPrice: "$180/mo",
    summary: "2 sessions/month + async Q&A",
    features: [
      "Twice-monthly accountability calls",
      "Direct async support between sessions",
      "Goal tracking and progress check-ins",
    ],
    popular: false,
  },
  {
    title: "Student Org Workshop",
    standardPrice: "Starting at $700",
    studentPrice: "Starting at $350",
    summary:
      "Group session for your chapter/club, plus free 1:1 follow-ups for attendees",
    features: [
      "45-60 minute live workshop",
      "Resume and LinkedIn fundamentals",
      "Built for chapters and campus clubs",
    ],
    popular: false,
  },
];

const testimonials = [
  {
    name: "Jordan M.",
    detail: "Finance Club, Junior",
    quote:
      "I finally understood what recruiters actually want to see. My resume reads way stronger now.",
    result: "→ Landed an interview at [Company]",
  },
  {
    name: "Priya S.",
    detail: "Alpha Delta Pi, Sophomore",
    quote:
      "The workshop made everything feel practical and doable. Our chapter loved how actionable it was.",
    result: "→ Landed an interview at [Company]",
  },
  {
    name: "Marcus T.",
    detail: "Engineering, Senior",
    quote:
      "The LinkedIn edits alone made a huge difference in how I present my projects and internships.",
    result: "→ Landed an interview at [Company]",
  },
];

const founderImpactPoints = [
  "Final-round interviews at McKinsey & Company and LEK Consulting, plus an offer from Lockheed Martin.",
  "Current Sales Finance Analyst at The Campbell's Company, overseeing $211M projected FY27 gross sales and driving $4.2M in projected savings through trade-event remediation.",
  "Built an automation workflow in Excel and VBA to improve reporting accuracy, cut manual work, and support faster decision-making.",
  "Temple University Fox Honors graduate (BBA Finance, MIS minor, 3.85 GPA) with leadership across consulting, finance, and campus organizations.",
];

const founderProofCards = [
  {
    title: "Real recruiting outcomes",
    description:
      "I coach from firsthand experience navigating competitive recruiting pipelines and converting interviews into offers.",
  },
  {
    title: "Operator + analyst mindset",
    description:
      "From financial modeling to executive-ready storytelling, I help students communicate impact with clarity and confidence.",
  },
  {
    title: "Leadership under pressure",
    description:
      "As chapter president and project lead, I learned how to guide teams, solve problems fast, and execute with accountability.",
  },
];

const faqs = [
  {
    question: "How fast is turnaround?",
    answer:
      "Most resume and LinkedIn projects are completed within 3-5 business days depending on revision needs.",
  },
  {
    question: "Do you work with any major?",
    answer:
      "Yes. We support students across business, STEM, liberal arts, and health-related tracks.",
  },
  {
    question: "What if I'm not happy with the resume?",
    answer:
      "Every package includes a revision window so we can align on tone, accomplishments, and target role fit.",
  },
  {
    question: "Can student organizations book custom workshops?",
    answer:
      "Absolutely. We tailor examples, pacing, and talking points to your chapter or club's members.",
  },
  {
    question: "Do you only work with local schools?",
    answer:
      "No. Sessions can be run virtually for organizations and students across the country.",
  },
];

const BUSINESS_EMAIL = "hello@zachscareerstudio.com";
const defaultContactInterest = servicePricing[1]?.title ?? "Resume Refresh";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [founderImageMissing, setFounderImageMissing] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    interest: defaultContactInterest,
    message: "",
  });
  const [requestStudentDiscount, setRequestStudentDiscount] = useState(true);
  const [contactError, setContactError] = useState("");

  const updateContactField = (
    field: "name" | "email" | "interest" | "message",
    value: string
  ) => {
    setContactForm((current) => ({ ...current, [field]: value }));
    if (contactError) {
      setContactError("");
    }
  };

  const openPrefilledEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.interest) {
      setContactError("Please complete your name, email, and what you're looking for.");
      return;
    }

    const isEduEmail = contactForm.email.toLowerCase().endsWith(".edu");
    if (requestStudentDiscount && !isEduEmail) {
      setContactError(
        "Student discount verification requires a valid .edu email address."
      );
      return;
    }

    const subject = encodeURIComponent(`Career Services Inquiry: ${contactForm.interest}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in ${contactForm.interest}.\n\nName: ${contactForm.name}\nEmail: ${contactForm.email}\nStudent discount requested: ${
        requestStudentDiscount ? "Yes" : "No"
      }\n\nAdditional details:\n${
        contactForm.message.trim() || "[Add any goals, deadlines, or context here.]"
      }\n`
    );

    window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
  };

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -12% 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-stone-50/95 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
          <a href="#" className="text-lg font-semibold tracking-tight text-[#12233f]">
            Zach&apos;s Career Studio
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-700 transition hover:text-[#12233f]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center md:flex">
            <a
              href="#contact"
              className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Book Free Call
            </a>
          </div>

          <button
            type="button"
            className="rounded-full border border-slate-300 p-2.5 text-slate-700 md:hidden"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-stone-50 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-2 py-1.5 text-sm font-medium text-slate-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#contact"
                className="mt-2 inline-flex w-fit items-center justify-center rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Free Call
              </a>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#e2ebff_0%,_#f7f8f4_48%,_#f7f8f4_100%)]" />
          <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-16 sm:pb-20 sm:pt-24">
            <div data-reveal className="scroll-reveal max-w-3xl space-y-7">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#12233f]/15 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#12233f]">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Career support built by a recent grad
              </p>
              <h1 className="text-balance text-4xl font-semibold leading-tight text-[#12233f] sm:text-5xl lg:text-6xl">
                Land the interview. We&apos;ll help you look the part.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
                Resume rewrites, LinkedIn optimization, and practical mentorship
                for students who want a real recruiting edge.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full bg-[#12233f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1a2f]"
                >
                  Book a Free 15-Min Call
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-[#12233f]/35 hover:text-[#12233f]"
                >
                  See Services
                </a>
              </div>
            </div>

            <div data-reveal className="scroll-reveal mt-14">
              <CompanyTicker companies={companyTickerNames} />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div data-reveal className="scroll-reveal">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[#12233f] sm:text-4xl">
              Simple process. Stronger outcomes.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {processSteps.map(({ title, description, icon: Icon }, index) => (
              <article
                key={title}
                data-reveal
                className="scroll-reveal rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#12233f] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[#12233f]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="services" className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div data-reveal className="scroll-reveal max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
                Services & Pricing
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[#12233f] sm:text-4xl">
                Pick the support level that fits your goals.
              </h2>
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Verified students get <span className="font-semibold">50% off</span>.
                To receive discounted pricing, contact through your{" "}
                <span className="font-semibold">.edu email</span> for verification.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {servicePricing.map((tier) => (
                <article
                  key={tier.title}
                  data-reveal
                  className={`scroll-reveal flex h-full flex-col rounded-2xl border p-6 shadow-sm transition ${
                    tier.popular
                      ? "border-amber-300 bg-amber-50/60 shadow-amber-200/60"
                      : "border-slate-200 bg-stone-50 shadow-slate-200/70"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-[#12233f]">{tier.title}</h3>
                    {tier.popular && (
                      <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-semibold text-slate-950">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-semibold text-slate-900">
                    {tier.studentPrice}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Student verified rate (50% off)
                  </p>
                  {tier.standardPrice !== tier.studentPrice && (
                    <p className="mt-1 text-sm text-slate-500">
                      Standard:{" "}
                      <span className="line-through">{tier.standardPrice}</span>
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {tier.summary}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-slate-700">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#12233f]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className={`mt-6 inline-flex w-fit items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      tier.popular
                        ? "bg-[#12233f] text-white hover:bg-[#0d1a2f]"
                        : "bg-white text-[#12233f] ring-1 ring-slate-300 hover:ring-[#12233f]/40"
                    }`}
                  >
                    Book This
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="student-orgs"
          className="mx-auto grid max-w-6xl gap-8 px-6 py-20 sm:py-24 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div data-reveal className="scroll-reveal">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
              For Student Organizations
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[#12233f] sm:text-4xl">
              Bring career readiness to your entire chapter.
            </h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-slate-700">
              Workshops are designed for fraternity and sorority leadership,
              professional clubs, and student org exec boards that want to give
              members practical recruiting support right now.
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-slate-700">
              Typical format is 45-60 minutes for up to around 30 students,
              covering resume and LinkedIn fundamentals with live examples and a
              direct Q&A segment. First partner organizations can book one
              workshop free.
            </p>
            <a
              href="#contact"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Book a Workshop
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div
            data-reveal
            className="scroll-reveal rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70"
          >
            <h3 className="text-lg font-semibold text-[#12233f]">Workshop Snapshot</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <UsersRound className="mt-0.5 h-4 w-4 shrink-0 text-[#12233f]" />
                <span>Audience: up to ~30 members per session</span>
              </li>
              <li className="flex gap-3">
                <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-[#12233f]" />
                <span>Topics: resume fundamentals + LinkedIn positioning</span>
              </li>
              <li className="flex gap-3">
                <CalendarCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-[#12233f]" />
                <span>Format: 45-60 minutes + optional follow-up 1:1 support</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div data-reveal className="scroll-reveal">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
                Testimonials
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[#12233f] sm:text-4xl">
                Real feedback from students.
              </h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  data-reveal
                  className="scroll-reveal rounded-2xl border border-slate-200 bg-stone-50 p-6 shadow-sm shadow-slate-200/70"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#12233f]/90 text-sm font-semibold text-white">
                      {testimonial.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#12233f]">{testimonial.name}</p>
                      <p className="text-xs text-slate-500">{testimonial.detail}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <p className="mt-4 text-sm font-medium text-[#12233f]">
                    {testimonial.result}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div data-reveal className="scroll-reveal">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
                About the Founder
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[#12233f] sm:text-4xl">
                Meet Zach: experience-backed coaching for ambitious students.
              </h2>
              <p className="mt-5 leading-relaxed text-slate-700">
                I&apos;m a Temple University Fox Honors graduate (BBA Finance,
                MIS minor, 3.85 GPA) who recently went through the same
                recruiting process most students are facing right now. I built
                this studio to give students clear, practical guidance rooted in
                what actually works.
              </p>
              <p className="mt-4 leading-relaxed text-slate-700">
                Along the way, I landed final-round interviews at McKinsey &
                Company and LEK Consulting, plus an offer from Lockheed Martin,
                and I now work in Sales Finance at The Campbell&apos;s Company.
                My goal is to help students present themselves with the same
                clarity and confidence in resumes, LinkedIn, and interviews.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {founderImpactPoints.map((point) => (
                  <li key={point} className="flex gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#12233f]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              data-reveal
              className="scroll-reveal space-y-4"
            >
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
                {!founderImageMissing ? (
                  <Image
                    src="/zach-headshot.jpg"
                    alt="Zach in suit and tie"
                    className="aspect-[4/5] w-full rounded-xl object-cover"
                    width={800}
                    height={1000}
                    onError={() => setFounderImageMissing(true)}
                  />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 p-4 text-center text-sm font-medium text-slate-600">
                    Add your headshot at /public/zach-headshot.jpg to display
                    your founder photo.
                  </div>
                )}
              </div>
              <div className="grid gap-3">
                {founderProofCards.map((card) => (
                  <article
                    key={card.title}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60"
                  >
                    <h3 className="text-sm font-semibold text-[#12233f]">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      {card.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-6">
            <div data-reveal className="scroll-reveal">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
                FAQ
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[#12233f] sm:text-4xl">
                Common questions from students and chapter leaders.
              </h2>
            </div>
            <div className="mt-8 space-y-3">
              {faqs.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <article
                    key={item.question}
                    data-reveal
                    className="scroll-reveal rounded-2xl border border-slate-200 bg-stone-50"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      onClick={() =>
                        setOpenFaqIndex((current) =>
                          current === index ? null : index
                        )
                      }
                      aria-expanded={isOpen}
                    >
                      <span className="font-medium text-[#12233f]">{item.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-slate-500 transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="px-5 pb-5 text-sm leading-relaxed text-slate-700">
                        {item.answer}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div
            data-reveal
            className="scroll-reveal rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8"
          >
            <h2 className="text-2xl font-semibold text-[#12233f] sm:text-3xl">
              Contact to start services
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700">
              Share what you need, and we&apos;ll open a prefilled email draft so
              you can send your request directly to{" "}
              <span className="font-semibold">{BUSINESS_EMAIL}</span>.
            </p>
            <form
              className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-stone-50 p-5 sm:grid-cols-2"
              onSubmit={openPrefilledEmail}
            >
              <label className="space-y-1 text-sm">
                <span className="font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(event) => updateContactField("name", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-[#12233f]/60"
                  placeholder="Your name"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium text-slate-700">
                  Email (use .edu for student discount)
                </span>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(event) => updateContactField("email", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-[#12233f]/60"
                  placeholder="name@school.edu"
                />
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                <span className="font-medium text-slate-700">
                  What are you looking for?
                </span>
                <select
                  value={contactForm.interest}
                  onChange={(event) =>
                    updateContactField("interest", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-[#12233f]/60"
                >
                  {servicePricing.map((tier) => (
                    <option key={tier.title} value={tier.title}>
                      {tier.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                <span className="font-medium text-slate-700">Details (optional)</span>
                <textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(event) => updateContactField("message", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-[#12233f]/60"
                  placeholder="Share your timeline, goals, and any context before sending."
                />
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-700 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={requestStudentDiscount}
                  onChange={(event) => {
                    setRequestStudentDiscount(event.target.checked);
                    if (contactError) {
                      setContactError("");
                    }
                  }}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#12233f]"
                />
                <span>
                  I&apos;m requesting the 50% student discount and understand I must
                  use a valid <span className="font-semibold">.edu email</span> for
                  verification.
                </span>
              </label>
              {contactError && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
                  {contactError}
                </p>
              )}
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#12233f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d1a2f] sm:col-span-2 sm:w-fit"
              >
                Open Prefilled Email
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>

        <section className="bg-amber-400 py-14">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-800">
                Final CTA
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
                Ready to level up your resume?
              </h2>
            </div>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#12233f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1a2f]"
            >
              Contact for Services
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-[#0f1d36] text-slate-100">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 md:grid-cols-[1fr_auto_auto]">
          <div>
            <h2 className="text-lg font-semibold">Zach&apos;s Career Studio</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-300">
              Practical resume, LinkedIn, and mentorship support for students
              and student organizations.
            </p>
            <p className="mt-4 text-xs text-slate-400">
              Company names shown with permission.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-white">Navigate</p>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-slate-300 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-white">Contact</p>
            <a
              href={`mailto:${BUSINESS_EMAIL}`}
              className="block text-slate-300 transition hover:text-white"
            >
              {BUSINESS_EMAIL}
            </a>
            <a href="#" className="block text-slate-300 transition hover:text-white">
              Instagram
            </a>
            <a href="#" className="block text-slate-300 transition hover:text-white">
              LinkedIn
            </a>
          </div>
        </div>
        <div className="border-t border-slate-800/70 py-4 text-center text-xs text-slate-400">
          &copy; {year} Zach&apos;s Career Studio. Company names shown with client
          permission.
        </div>
      </footer>

      <style jsx global>{`
        @keyframes ticker-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .marquee-track {
          animation: ticker-scroll 50s linear infinite;
        }

        .marquee-wrapper:hover .marquee-track {
          animation-play-state: paused;
        }

        .scroll-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.65s ease, transform 0.65s ease;
          will-change: opacity, transform;
        }

        .scroll-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }

          .scroll-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

function CompanyTicker({ companies }: { companies: string[] }) {
  const doubledCompanies = useMemo(
    () => [...companies, ...companies],
    [companies]
  );

  return (
    <div className="marquee-wrapper rounded-2xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm shadow-slate-200/70 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#12233f]">
          Clients have interviewed at:
        </p>
        <p
          className="inline-flex items-center gap-1.5 text-xs text-slate-500"
          title="Company names shown with client permission."
        >
          <Info className="h-3.5 w-3.5" />
          Company names shown with client permission.
        </p>
      </div>
      <div className="overflow-hidden">
        <div className="marquee-track flex w-max min-w-full items-center gap-6 pr-6">
          {doubledCompanies.map((company, index) => (
            <span
              key={`${company}-${index}`}
              className="whitespace-nowrap rounded-full border border-slate-200 bg-stone-50 px-3 py-1 text-sm text-slate-700"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

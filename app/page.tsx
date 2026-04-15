"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calculator,
  CheckCircle2,
  Clock3,
  DollarSign,
  GraduationCap,
  Handshake,
  Link2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";

const individualServices = [
  {
    service: "Resume Review + Written Feedback",
    regularPrice: "$60",
    studentPrice: "$30",
    notes: "Detailed written notes, ATS tips, no rewrite",
  },
  {
    service: "Full Resume Rewrite",
    regularPrice: "$125",
    studentPrice: "$62.50",
    notes: "Complete rewrite, ATS-optimized",
  },
  {
    service: "LinkedIn Optimization",
    regularPrice: "$60",
    studentPrice: "$30",
    notes: "Headline, summary, experience, and skills refresh",
  },
  {
    service: "Cover Letter",
    regularPrice: "$40",
    studentPrice: "$20",
    notes: "Role-targeted add-on to any package",
  },
  {
    service: "Resume + LinkedIn Bundle",
    regularPrice: "$185",
    studentPrice: "$92.50",
    notes: "Best-value combo package",
  },
];

const workshopPackages = [
  {
    packageName: "Virtual Workshop",
    price: "$300",
    groupSize: "Up to 20",
    includes:
      "90-min Zoom session, resume + LinkedIn frameworks, live Q&A, slide deck",
  },
  {
    packageName: "Virtual Workshop + Email Reviews",
    price: "$450",
    groupSize: "Up to 20",
    includes:
      "Workshop plus individual written resume feedback within 72 hours",
  },
  {
    packageName: "In-Person Session",
    price: "$600+",
    groupSize: "Up to 30",
    includes:
      "2-hour on-site workshop, live critiques, LinkedIn demo, customized by industry",
  },
  {
    packageName: "In-Person + Email Reviews",
    price: "$800+",
    groupSize: "Up to 30",
    includes:
      "Full in-person session plus individual email reviews within 72 hours",
  },
];

const whyUsHighlights = [
  {
    title: "Results-Driven Coaching",
    description:
      "Built around outcomes, not generic templates. Clients have landed interviews with McKinsey, KPMG, FTI, Lincoln Financial, Campbell's, 5 Below, and more.",
    icon: BadgeCheck,
  },
  {
    title: "48-72 Hour Turnaround",
    description:
      "Fast, reliable delivery keeps your applications moving while opportunities are still hot.",
    icon: Clock3,
  },
  {
    title: "Personal Relationship",
    description:
      "You work directly with Zachary Fajge every step of the process for feedback tailored to your exact goals.",
    icon: Handshake,
  },
];

const testimonials = [
  {
    quote:
      "ZF Resumes completely transformed how I communicated my internship impact. I landed first-round interviews at two consulting firms within three weeks.",
    name: "Temple University Senior",
    role: "Finance Major",
  },
  {
    quote:
      "The rewrite was sharp, quantified, and recruiter-friendly. I started getting LinkedIn responses almost immediately after updating my profile.",
    name: "Recent Graduate",
    role: "Entry-Level Analyst Candidate",
  },
  {
    quote:
      "Our fraternity workshop was practical and high-energy. Members left with clear resume frameworks and better interview confidence.",
    name: "Fraternity Career Chair",
    role: "Philadelphia Campus Organization",
  },
];

type EstimateTrack = "individual" | "group";

type IndividualEstimateOption = {
  label: string;
  regularPrice: number;
  studentPrice: number;
};

type WorkshopEstimateOption = {
  label: string;
  basePrice: number;
  maxGroupSize: number;
  startsAt: boolean;
};

const individualEstimateOptions: Record<string, IndividualEstimateOption> = {
  review: {
    label: "Resume Review + Written Feedback",
    regularPrice: 60,
    studentPrice: 30,
  },
  rewrite: {
    label: "Full Resume Rewrite",
    regularPrice: 125,
    studentPrice: 62.5,
  },
  linkedin: {
    label: "LinkedIn Optimization",
    regularPrice: 60,
    studentPrice: 30,
  },
  bundle: {
    label: "Resume + LinkedIn Bundle",
    regularPrice: 185,
    studentPrice: 92.5,
  },
};

const workshopEstimateOptions: Record<string, WorkshopEstimateOption> = {
  virtual: {
    label: "Virtual Workshop",
    basePrice: 300,
    maxGroupSize: 20,
    startsAt: false,
  },
  virtualReviews: {
    label: "Virtual Workshop + Email Reviews",
    basePrice: 450,
    maxGroupSize: 20,
    startsAt: false,
  },
  inPerson: {
    label: "In-Person Session",
    basePrice: 600,
    maxGroupSize: 30,
    startsAt: true,
  },
  inPersonReviews: {
    label: "In-Person + Email Reviews",
    basePrice: 800,
    maxGroupSize: 30,
    startsAt: true,
  },
};

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type IntakeData = {
  fullName: string;
  email: string;
  phone: string;
  studentStatus: string;
  school: string;
  graduationYear: string;
  currentStatus: string;
  experienceSummary: string;
  keyAchievements: string;
  targetRoles: string;
  targetIndustries: string;
  selectedService: string;
  timeline: string;
  additionalDetails: string;
};

const initialIntakeData: IntakeData = {
  fullName: "",
  email: "",
  phone: "",
  studentStatus: "",
  school: "",
  graduationYear: "",
  currentStatus: "",
  experienceSummary: "",
  keyAchievements: "",
  targetRoles: "",
  targetIndustries: "",
  selectedService: "",
  timeline: "",
  additionalDetails: "",
};

const steps = [
  "Contact",
  "Background",
  "Career Goals",
  "Review",
] as const;

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [intakeData, setIntakeData] = useState<IntakeData>(initialIntakeData);
  const [estimateTrack, setEstimateTrack] = useState<EstimateTrack>("individual");
  const [isStudentEstimate, setIsStudentEstimate] = useState(true);
  const [individualServiceKey, setIndividualServiceKey] = useState("rewrite");
  const [addCoverLetter, setAddCoverLetter] = useState(false);
  const [workshopPackageKey, setWorkshopPackageKey] = useState("virtual");
  const [workshopGroupSize, setWorkshopGroupSize] = useState("20");

  const companies = useMemo(
    () => [
      "McKinsey & Company",
      "KPMG",
      "FTI Consulting",
      "Lincoln Financial",
      "The Campbell's Company",
      "5 Below",
    ],
    []
  );

  const selectedIndividualEstimate =
    individualEstimateOptions[individualServiceKey] ??
    individualEstimateOptions.rewrite;
  const selectedWorkshopEstimate =
    workshopEstimateOptions[workshopPackageKey] ?? workshopEstimateOptions.virtual;

  const regularBasePrice = selectedIndividualEstimate.regularPrice;
  const studentBasePrice = selectedIndividualEstimate.studentPrice;
  const selectedBasePrice = isStudentEstimate ? studentBasePrice : regularBasePrice;
  const coverLetterPrice = addCoverLetter ? (isStudentEstimate ? 20 : 40) : 0;
  const regularCoverLetterPrice = addCoverLetter ? 40 : 0;
  const individualEstimateTotal = selectedBasePrice + coverLetterPrice;
  const studentSavings =
    regularBasePrice + regularCoverLetterPrice - individualEstimateTotal;

  const parsedGroupSize = Number.parseInt(workshopGroupSize, 10);
  const normalizedGroupSize = Number.isNaN(parsedGroupSize)
    ? 0
    : Math.max(parsedGroupSize, 0);
  const exceedsIncludedGroupSize =
    normalizedGroupSize > selectedWorkshopEstimate.maxGroupSize;
  const groupEstimateText = selectedWorkshopEstimate.startsAt
    ? `Starting at ${usdFormatter.format(selectedWorkshopEstimate.basePrice)}`
    : usdFormatter.format(selectedWorkshopEstimate.basePrice);

  const updateField = (field: keyof IntakeData, value: string) => {
    setIntakeData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const stepValidationRules = [
    () =>
      intakeData.fullName.trim() !== "" &&
      intakeData.email.trim() !== "" &&
      intakeData.studentStatus.trim() !== "",
    () =>
      intakeData.currentStatus.trim() !== "" &&
      intakeData.experienceSummary.trim() !== "",
    () =>
      intakeData.targetRoles.trim() !== "" &&
      intakeData.selectedService.trim() !== "",
    () => true,
  ];

  const goToNextStep = () => {
    if (!stepValidationRules[currentStep]()) {
      setErrorMessage("Please complete the required fields before continuing.");
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goToPreviousStep = () => {
    setErrorMessage("");
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const submitIntake = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stepValidationRules[currentStep]()) {
      setErrorMessage("Please complete the required fields before submitting.");
      return;
    }

    setIsSubmitted(true);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main>
        <section className="relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#020617_50%,#020617_100%)]" />
          <div className="absolute -top-32 right-1/4 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-8 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative mx-auto flex max-w-6xl flex-col gap-14 px-6 py-20 md:py-28">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200">
              <Sparkles className="h-4 w-4" />
              Philadelphia&apos;s student-first career acceleration studio
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div className="space-y-7">
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Land more interviews at elite firms like
                  <span className="text-cyan-300"> McKinsey </span>
                  and
                  <span className="text-cyan-300"> KPMG</span>.
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-slate-200">
                  ZF Resumes helps Philadelphia students and early-career
                  professionals stand out with ATS-optimized resumes, LinkedIn
                  strategy, and coaching built for real hiring outcomes.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="#intake-form"
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Start Your Intake
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#services"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200"
                  >
                    View Services
                  </a>
                  <a
                    href="/ai-creator"
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 px-6 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-100"
                  >
                    Try AI Resume Builder
                  </a>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 backdrop-blur">
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-cyan-300">
                  Trusted Interview Destinations
                </p>
                <ul className="space-y-3 text-sm text-slate-200">
                  {companies.map((company) => (
                    <li key={company} className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-cyan-300" />
                      {company}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Services & Pricing
            </h2>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              <GraduationCap className="h-4 w-4" />
              50% Student Discount with valid .edu email
            </div>
          </div>
          <p className="mb-10 max-w-3xl text-slate-300">
            Built for students, recent graduates, and organizations across
            Philadelphia and Southern New Jersey. Individual services include
            one-on-one strategy and fast turnaround. Group workshops are priced
            separately and do not include student discount rates.
          </p>

          <div className="grid gap-8 lg:grid-cols-2">
            <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
                <Users className="h-5 w-5 text-cyan-300" />
                Individual Services
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-300">
                      <th className="px-3 py-3 font-semibold">Service</th>
                      <th className="px-3 py-3 font-semibold">Regular</th>
                      <th className="px-3 py-3 font-semibold text-emerald-300">
                        Student (50% Off)
                      </th>
                      <th className="px-3 py-3 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {individualServices.map((service) => (
                      <tr key={service.service} className="border-b border-slate-800">
                        <td className="px-3 py-4 text-slate-100">{service.service}</td>
                        <td className="px-3 py-4 text-slate-300">
                          {service.regularPrice}
                        </td>
                        <td className="px-3 py-4 font-semibold text-emerald-300">
                          {service.studentPrice}
                        </td>
                        <td className="px-3 py-4 text-slate-400">{service.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
                <Building2 className="h-5 w-5 text-cyan-300" />
                Group Workshops
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-300">
                      <th className="px-3 py-3 font-semibold">Package</th>
                      <th className="px-3 py-3 font-semibold">Price</th>
                      <th className="px-3 py-3 font-semibold">Group Size</th>
                      <th className="px-3 py-3 font-semibold">Includes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workshopPackages.map((pkg) => (
                      <tr key={pkg.packageName} className="border-b border-slate-800">
                        <td className="px-3 py-4 text-slate-100">{pkg.packageName}</td>
                        <td className="px-3 py-4 font-semibold text-cyan-300">
                          {pkg.price}
                        </td>
                        <td className="px-3 py-4 text-slate-300">{pkg.groupSize}</td>
                        <td className="px-3 py-4 text-slate-400">{pkg.includes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </section>

        <section
          id="cost-estimator"
          className="mx-auto max-w-6xl border-y border-slate-800 px-6 py-20"
        >
          <div className="mb-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <Calculator className="h-4 w-4" />
              Cost Estimate Calculator
            </div>
            <h2 className="mb-3 text-3xl font-semibold text-white sm:text-4xl">
              Get an instant estimate before you book
            </h2>
            <p className="max-w-3xl text-slate-300">
              Answer a few questions and see your estimated investment. Final
              pricing is confirmed after intake review, especially for custom
              workshop requests and larger groups.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-8">
              <div className="mb-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setEstimateTrack("individual")}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    estimateTrack === "individual"
                      ? "bg-cyan-400 text-slate-950"
                      : "border border-slate-600 text-slate-200 hover:border-cyan-300 hover:text-cyan-200"
                  }`}
                >
                  Individual Services
                </button>
                <button
                  type="button"
                  onClick={() => setEstimateTrack("group")}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    estimateTrack === "group"
                      ? "bg-cyan-400 text-slate-950"
                      : "border border-slate-600 text-slate-200 hover:border-cyan-300 hover:text-cyan-200"
                  }`}
                >
                  Group Workshops
                </button>
              </div>

              {estimateTrack === "individual" ? (
                <div className="space-y-5">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-200">
                      Which service are you most interested in?
                    </span>
                    <select
                      value={individualServiceKey}
                      onChange={(event) => setIndividualServiceKey(event.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
                    >
                      <option value="review">
                        {individualEstimateOptions.review.label}
                      </option>
                      <option value="rewrite">
                        {individualEstimateOptions.rewrite.label}
                      </option>
                      <option value="linkedin">
                        {individualEstimateOptions.linkedin.label}
                      </option>
                      <option value="bundle">
                        {individualEstimateOptions.bundle.label}
                      </option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-200">
                      Student discount eligibility
                    </span>
                    <select
                      value={isStudentEstimate ? "student" : "regular"}
                      onChange={(event) =>
                        setIsStudentEstimate(event.target.value === "student")
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
                    >
                      <option value="student">
                        Yes - I have a valid .edu email
                      </option>
                      <option value="regular">No - regular pricing applies</option>
                    </select>
                  </label>

                  <label className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={addCoverLetter}
                      onChange={(event) => setAddCoverLetter(event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-400/40"
                    />
                    <span>
                      Add a role-targeted cover letter
                      <span className="block text-xs text-slate-400">
                        +{isStudentEstimate ? "$20" : "$40"} add-on
                      </span>
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-5">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-200">
                      Workshop package
                    </span>
                    <select
                      value={workshopPackageKey}
                      onChange={(event) => setWorkshopPackageKey(event.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
                    >
                      <option value="virtual">
                        {workshopEstimateOptions.virtual.label}
                      </option>
                      <option value="virtualReviews">
                        {workshopEstimateOptions.virtualReviews.label}
                      </option>
                      <option value="inPerson">
                        {workshopEstimateOptions.inPerson.label}
                      </option>
                      <option value="inPersonReviews">
                        {workshopEstimateOptions.inPersonReviews.label}
                      </option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-200">
                      Estimated group size
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={workshopGroupSize}
                      onChange={(event) => setWorkshopGroupSize(event.target.value)}
                      placeholder="20"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </label>
                  <p className="text-xs text-slate-400">
                    Student discount does not apply to workshop packages.
                  </p>
                </div>
              )}
            </article>

            <aside className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-900 to-blue-950/40 p-6 md:p-7">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                <DollarSign className="h-4 w-4" />
                Estimated Cost
              </p>

              {estimateTrack === "individual" ? (
                <div className="space-y-4">
                  <p className="text-lg font-semibold text-white">
                    {selectedIndividualEstimate.label}
                  </p>
                  <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
                    <div className="flex items-center justify-between">
                      <span>Base service</span>
                      <span>{usdFormatter.format(selectedBasePrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cover letter add-on</span>
                      <span>{usdFormatter.format(coverLetterPrice)}</span>
                    </div>
                    <div className="mt-2 border-t border-slate-700 pt-2" />
                    <div className="flex items-center justify-between text-base font-semibold text-white">
                      <span>Estimated total</span>
                      <span>{usdFormatter.format(individualEstimateTotal)}</span>
                    </div>
                  </div>
                  {isStudentEstimate && studentSavings > 0 && (
                    <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300">
                      You save {usdFormatter.format(studentSavings)} with the 50%
                      student discount.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-lg font-semibold text-white">
                    {selectedWorkshopEstimate.label}
                  </p>
                  <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
                    <div className="flex items-center justify-between">
                      <span>Group size entered</span>
                      <span>{normalizedGroupSize || "Not provided"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Price estimate</span>
                      <span className="font-semibold text-white">{groupEstimateText}</span>
                    </div>
                  </div>
                  {exceedsIncludedGroupSize ? (
                    <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                      Groups above {selectedWorkshopEstimate.maxGroupSize} require
                      custom pricing.
                    </p>
                  ) : (
                    <p className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
                      This estimate includes the base package for up to{" "}
                      {selectedWorkshopEstimate.maxGroupSize} attendees.
                    </p>
                  )}
                </div>
              )}

              <a
                href="#intake-form"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Continue to Intake
                <ArrowRight className="h-4 w-4" />
              </a>
            </aside>
          </div>
        </section>

        <section className="border-y border-slate-800 bg-slate-900/60">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="mb-10 text-3xl font-semibold text-white sm:text-4xl">
              Why ZF Resumes
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {whyUsHighlights.map(({ title, description, icon: Icon }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-slate-700 bg-slate-900 p-6"
                >
                  <Icon className="mb-4 h-7 w-7 text-cyan-300" />
                  <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Client Testimonials
            </h2>
            <p className="text-sm font-medium text-cyan-300">
              Real outcomes from Philadelphia students and grads
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.quote}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6"
              >
                <p className="mb-5 text-sm leading-relaxed text-slate-200">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-sm font-semibold text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                    {testimonial.role}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="intake-form" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10">
            <h2 className="mb-3 text-3xl font-semibold text-white sm:text-4xl">
              Client Intake Form
            </h2>
            <p className="max-w-3xl text-slate-300">
              Complete this step-by-step intake so we can tailor your resume,
              LinkedIn, or workshop strategy to your target roles.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-8">
            {!isSubmitted ? (
              <form onSubmit={submitIntake} className="space-y-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm font-medium text-slate-300">
                      Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                      ZF Resumes Intake
                    </p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                      style={{
                        width: `${((currentStep + 1) / steps.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {currentStep === 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <LabelledInput
                      label="Full Name *"
                      value={intakeData.fullName}
                      onChange={(value) => updateField("fullName", value)}
                      placeholder="Your full name"
                    />
                    <LabelledInput
                      label="Email *"
                      type="email"
                      value={intakeData.email}
                      onChange={(value) => updateField("email", value)}
                      placeholder="you@university.edu"
                    />
                    <LabelledInput
                      label="Phone Number"
                      value={intakeData.phone}
                      onChange={(value) => updateField("phone", value)}
                      placeholder="(555) 123-4567"
                    />
                    <LabelledSelect
                      label="Are you a current student? *"
                      value={intakeData.studentStatus}
                      onChange={(value) => updateField("studentStatus", value)}
                      options={[
                        "Yes - current student",
                        "Recent graduate",
                        "No - early career professional",
                      ]}
                    />
                    <LabelledInput
                      label="School / University"
                      value={intakeData.school}
                      onChange={(value) => updateField("school", value)}
                      placeholder="Temple University"
                    />
                    <LabelledInput
                      label="Graduation Year"
                      value={intakeData.graduationYear}
                      onChange={(value) => updateField("graduationYear", value)}
                      placeholder="2026"
                    />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <LabelledInput
                      label="Current Status *"
                      value={intakeData.currentStatus}
                      onChange={(value) => updateField("currentStatus", value)}
                      placeholder="Junior studying Finance, currently interning..."
                    />
                    <LabelledTextArea
                      label="Experience Summary *"
                      value={intakeData.experienceSummary}
                      onChange={(value) =>
                        updateField("experienceSummary", value)
                      }
                      placeholder="Summarize internships, clubs, projects, and responsibilities."
                    />
                    <LabelledTextArea
                      label="Key Achievements"
                      value={intakeData.keyAchievements}
                      onChange={(value) => updateField("keyAchievements", value)}
                      placeholder="Include metrics, outcomes, leadership wins, or awards."
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <LabelledTextArea
                      label="Target Roles *"
                      value={intakeData.targetRoles}
                      onChange={(value) => updateField("targetRoles", value)}
                      placeholder="Example: Consulting Analyst, Corporate Finance Analyst, Big 4 Advisory"
                    />
                    <LabelledInput
                      label="Target Industries"
                      value={intakeData.targetIndustries}
                      onChange={(value) => updateField("targetIndustries", value)}
                      placeholder="Consulting, Financial Services, CPG"
                    />
                    <LabelledSelect
                      label="Service of Interest *"
                      value={intakeData.selectedService}
                      onChange={(value) => updateField("selectedService", value)}
                      options={[
                        "Resume Review + Written Feedback",
                        "Full Resume Rewrite",
                        "LinkedIn Optimization",
                        "Cover Letter",
                        "Resume + LinkedIn Bundle",
                        "Group Workshop (Virtual)",
                        "Group Workshop (In-Person)",
                      ]}
                    />
                    <LabelledSelect
                      label="Desired Timeline"
                      value={intakeData.timeline}
                      onChange={(value) => updateField("timeline", value)}
                      options={[
                        "As soon as possible",
                        "Within 1 week",
                        "Within 2 weeks",
                        "Flexible timeline",
                      ]}
                    />
                    <LabelledTextArea
                      label="Anything Else We Should Know?"
                      value={intakeData.additionalDetails}
                      onChange={(value) => updateField("additionalDetails", value)}
                      placeholder="Share target companies, deadlines, or special requests."
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-semibold text-white">
                      Review Your Intake
                    </h3>
                    <div className="grid gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 p-5 text-sm text-slate-300 md:grid-cols-2">
                      <ReviewItem label="Name" value={intakeData.fullName} />
                      <ReviewItem label="Email" value={intakeData.email} />
                      <ReviewItem label="Phone" value={intakeData.phone} />
                      <ReviewItem
                        label="Student Status"
                        value={intakeData.studentStatus}
                      />
                      <ReviewItem label="School" value={intakeData.school} />
                      <ReviewItem
                        label="Graduation Year"
                        value={intakeData.graduationYear}
                      />
                      <ReviewItem
                        label="Current Status"
                        value={intakeData.currentStatus}
                      />
                      <ReviewItem
                        label="Target Roles"
                        value={intakeData.targetRoles}
                      />
                      <ReviewItem
                        label="Target Industries"
                        value={intakeData.targetIndustries}
                      />
                      <ReviewItem
                        label="Selected Service"
                        value={intakeData.selectedService}
                      />
                      <ReviewItem label="Timeline" value={intakeData.timeline} />
                      <ReviewItem
                        label="Additional Details"
                        value={intakeData.additionalDetails}
                      />
                    </div>
                    <p className="text-sm text-slate-400">
                      Submitting this form creates your intake request. Zachary
                      will follow up within 24 hours.
                    </p>
                  </div>
                )}

                {errorMessage && (
                  <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {errorMessage}
                  </p>
                )}

                <div className="flex flex-wrap justify-between gap-3">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    disabled={currentStep === 0}
                    className="rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Back
                  </button>

                  <div className="flex gap-3">
                    {currentStep < steps.length - 1 ? (
                      <button
                        type="button"
                        onClick={goToNextStep}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                      >
                        Submit Intake
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-8 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-emerald-300" />
                <h3 className="mb-2 text-2xl font-semibold text-white">
                  Intake Submitted
                </h3>
                <p className="mx-auto max-w-xl text-slate-200">
                  Thanks for sharing your details. ZF Resumes will follow up
                  with next steps, timeline confirmation, and payment details
                  within 24 hours.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">ZF Resumes</h2>
            <p className="max-w-md text-sm text-slate-300">
              Resume, LinkedIn, and career services for Philadelphia students,
              graduates, and early-career professionals.
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-200 transition hover:text-cyan-300"
            >
              <Link2 className="h-4 w-4" />
              LinkedIn
            </a>
            <a
              href="mailto:hello@zfresumes.com"
              className="flex items-center gap-2 text-slate-200 transition hover:text-cyan-300"
            >
              <Mail className="h-4 w-4" />
              hello@zfresumes.com
            </a>
            <a
              href="tel:+12155550141"
              className="flex items-center gap-2 text-slate-200 transition hover:text-cyan-300"
            >
              <Phone className="h-4 w-4" />
              (215) 555-0141
            </a>
            <p className="flex items-center gap-2 text-slate-400">
              <MapPin className="h-4 w-4" />
              Philadelphia, PA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LabelledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "email";
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
      />
    </label>
  );
}

function LabelledTextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-slate-200">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
      />
    </label>
  );
}

function LabelledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-slate-200">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-medium text-slate-200">{label}:</span>{" "}
      {value.trim() === "" ? "Not provided" : value}
    </p>
  );
}

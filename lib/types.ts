export type IntakeData = {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
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

export type TrainingExample = {
  id: string;
  filename: string;
  uploadedAt: string;
  extractedText: string;
  sections: ResumeSection[];
};

export type ResumeSection = {
  heading: string;
  content: string;
  bulletPoints: string[];
};

export type ResumeStatus = "pending" | "approved" | "denied" | "edited";

export type GeneratedResume = {
  id: string;
  intakeData: IntakeData;
  status: ResumeStatus;
  createdAt: string;
  updatedAt: string;
  adminNotes: string;
  content: ResumeContent;
  docxPath: string | null;
};

export type ResumeContent = {
  fullName: string;
  contactLine: string;
  email: string;
  linkedinUrl: string;
  summary: string;
  sections: ResumeContentSection[];
};

export type ResumeContentSection = {
  heading: string;
  entries: ResumeEntry[];
};

export type ResumeEntry = {
  title: string;
  subtitle: string;
  location: string;
  dateRange: string;
  bullets: string[];
};

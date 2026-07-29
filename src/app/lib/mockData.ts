import { PRP, IND, PRPL } from "@/app/lib/constants";

// ─── Mock data ────────────────────────────────────────────────────────────────

export const weeklyHoursData = [
  { day: "Mon", hours: 3.5 }, { day: "Tue", hours: 5.2 },
  { day: "Wed", hours: 2.8 }, { day: "Thu", hours: 6.1 },
  { day: "Fri", hours: 4.3 }, { day: "Sat", hours: 7.5 },
  { day: "Sun", hours: 1.8 },
];

export const quizTrendData = [
  { week: "Wk 1", score: 64 }, { week: "Wk 2", score: 71 },
  { week: "Wk 3", score: 68 }, { week: "Wk 4", score: 79 },
  { week: "Wk 5", score: 84 }, { week: "Wk 6", score: 89 },
  { week: "Wk 7", score: 92 },
];

export const sessionBarData = [
  { month: "Jan", sessions: 38 }, { month: "Feb", sessions: 44 },
  { month: "Mar", sessions: 52 }, { month: "Apr", sessions: 48 },
  { month: "May", sessions: 61 }, { month: "Jun", sessions: 57 },
];

export const resourceUsageData = [
  { name: "PDFs", value: 45 }, { name: "DOCX", value: 20 },
  { name: "PPTX", value: 18 }, { name: "AI Chat", value: 17 },
];
export const PIE_COLORS = [PRP, IND, "#2563EB", "#14B8A6"];

export const skillLabels = [
  "Academic Writing", "Research Skills", "Referencing",
  "Critical Thinking", "Communication", "Presentation",
  "Time Management", "Problem Solving", "Digital Literacy",
];

export const mockDocuments = [
  { id: 1, name: "Research Methods Lecture 4.pdf", size: "2.4 MB", type: "PDF", date: "20 Jun 2026", pages: 32, category: "Lectures" },
  { id: 2, name: "Literature Review Guidelines.docx", size: "1.1 MB", type: "DOCX", date: "18 Jun 2026", pages: 15, category: "Guides" },
  { id: 3, name: "Quantitative Analysis Slides.pptx", size: "8.7 MB", type: "PPTX", date: "15 Jun 2026", pages: 64, category: "Slides" },
  { id: 4, name: "Critical Thinking Framework.pdf", size: "3.2 MB", type: "PDF", date: "12 Jun 2026", pages: 28, category: "Reading" },
  { id: 5, name: "Academic Writing Handbook.pdf", size: "5.6 MB", type: "PDF", date: "10 Jun 2026", pages: 120, category: "Handbooks" },
];

export const coursesData = [
  { id: 1, title: "Research Methods", code: "SOC301", instructor: "Dr. Sarah Chen", progress: 72, sessions: 14, color: PRP, bg: PRPL },
  { id: 2, title: "Academic Writing", code: "ENG201", instructor: "Prof. James Miller", progress: 58, sessions: 9, color: IND, bg: "#EEF2FF" },
  { id: 3, title: "Data Analysis", code: "STA401", instructor: "Dr. Yuki Tanaka", progress: 85, sessions: 21, color: "#2563EB", bg: "#EFF6FF" },
  { id: 4, title: "Critical Theory", code: "PHI302", instructor: "Prof. Amara Diallo", progress: 40, sessions: 6, color: "#EC4899", bg: "#FDF2F8" },
  { id: 5, title: "Dissertation Module", code: "DIS501", instructor: "Dr. Robert Walsh", progress: 23, sessions: 5, color: "#F59E0B", bg: "#FFFBEB" },
];

export const studyPlanData = [
  { id: 1, title: "Complete Literature Review Draft", course: "Research Methods", date: "25 Jun", time: "09:00–11:00", priority: "High", done: false },
  { id: 2, title: "Practice APA 7th Edition Citations", course: "Academic Writing", date: "25 Jun", time: "11:30–12:30", priority: "Medium", done: true },
  { id: 3, title: "Revise T-tests and ANOVA", course: "Data Analysis", date: "26 Jun", time: "14:00–16:00", priority: "High", done: false },
  { id: 4, title: "Read Foucault — Discipline & Punish Ch.3", course: "Critical Theory", date: "26 Jun", time: "10:00–11:00", priority: "Low", done: false },
  { id: 5, title: "Outline Dissertation Introduction", course: "Dissertation Module", date: "27 Jun", time: "09:00–12:00", priority: "High", done: false },
  { id: 6, title: "Peer Review Exchange Session", course: "Academic Writing", date: "28 Jun", time: "13:00–14:00", priority: "Medium", done: false },
];

export const chapterResources = [
  { id: 1, title: "Chapter 1: Introduction to Research", open: true,
    resources: [{ id: 1, name: "Lecture Notes W1.pdf", type: "PDF" }, { id: 2, name: "Seminar Slides.pptx", type: "PPTX" }] },
  { id: 2, title: "Chapter 2: Literature Review", open: true,
    resources: [{ id: 3, name: "Literature Review Guide.pdf", type: "PDF" }, { id: 4, name: "Sample Review.docx", type: "DOCX" }, { id: 5, name: "Workshop Slides.pptx", type: "PPTX" }] },
  { id: 3, title: "Chapter 3: Research Design", open: false,
    resources: [{ id: 6, name: "Research Design Framework.pdf", type: "PDF" }, { id: 7, name: "Methodology Checklist.docx", type: "DOCX" }] },
  { id: 4, title: "Chapter 4: Data Collection", open: false,
    resources: [{ id: 8, name: "Survey Design Guide.pdf", type: "PDF" }] },
];

export const quizQuestions = [
  { question: "What is the primary purpose of a literature review?",
    options: ["To display breadth of reading", "To establish context and justify the research gap", "To summarise every publication", "To critique methodologies"],
    correct: 1, explanation: "A literature review establishes theoretical context, identifies gaps, and justifies why the research is needed." },
  { question: "Which citation style uses author-date parenthetical citations?",
    options: ["Chicago (Notes-Bibliography)", "MLA", "APA", "Vancouver"],
    correct: 2, explanation: "APA uses the author-date format, e.g. (Smith, 2023). Common in social sciences." },
  { question: "In quantitative research, what does a p-value < 0.05 indicate?",
    options: ["The study has a 5% chance of being correct", "There is a statistically significant result", "The sample size is too small", "The null hypothesis is accepted"],
    correct: 1, explanation: "A p-value < 0.05 means less than 5% probability the result occurred by chance — statistically significant." },
  { question: "What does RAG stand for in AI?",
    options: ["Random Access Generation", "Retrieval-Augmented Generation", "Recursive Algorithm Graph", "Ranked Answer Generation"],
    correct: 1, explanation: "RAG (Retrieval-Augmented Generation) combines document retrieval with language model generation for grounded answers." },
  { question: "Which best describes inductive reasoning?",
    options: ["Moving from general principles to specific conclusions", "Testing hypotheses against theory", "Drawing general conclusions from specific observations", "Applying proofs to data"],
    correct: 2, explanation: "Inductive reasoning moves from specific observations to broader generalizations." },
];

export const aiSuggestions = [
  "Summarise Chapter 2: Literature Review",
  "Explain qualitative vs quantitative research",
  "Generate quiz questions from my notes",
  "What are the key referencing guidelines?",
];

export const heatmapData = Array.from({ length: 12 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => ({
    week: w, day: d,
    level: Math.random() > 0.35 ? Math.floor(Math.random() * 4) + 1 : 0,
  }))
).flat();

export const adminUsers = [
  { id: "STU001", name: "Emma Thompson", email: "e.thompson@uni.ac.uk", role: "Student", status: "Active", joined: "12 Sep 2025", activity: "2h ago" },
  { id: "STU002", name: "James Okafor", email: "j.okafor@uni.ac.uk", role: "Student", status: "Active", joined: "12 Sep 2025", activity: "4h ago" },
  { id: "LEC001", name: "Dr. Sarah Chen", email: "s.chen@uni.ac.uk", role: "Lecturer", status: "Active", joined: "01 Sep 2025", activity: "1h ago" },
  { id: "STU003", name: "Aisha Patel", email: "a.patel@uni.ac.uk", role: "Student", status: "Active", joined: "13 Sep 2025", activity: "Yesterday" },
  { id: "STU004", name: "Marcus Webb", email: "m.webb@uni.ac.uk", role: "Student", status: "Inactive", joined: "14 Sep 2025", activity: "5d ago" },
  { id: "ADM001", name: "Prof. David Harris", email: "d.harris@uni.ac.uk", role: "Admin", status: "Active", joined: "01 Aug 2025", activity: "30m ago" },
];

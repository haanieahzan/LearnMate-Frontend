import jsPDF from "jspdf";

export function exportSkillsAndProgressPdf(opts: {
  studentName: string;
  totalCourses: number;
  quizzesTaken: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  fields: { fieldName: string; averageScore: number; skills: { skillArea: string; averageScore: number; attemptCount: number }[] }[];
  recentAttempts: { quizTitle: string; score: number; attemptedAt: string }[];
}) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("LearnMate — Progress Report", 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`${opts.studentName} · Generated ${new Date().toLocaleDateString()}`, 14, y);
  y += 12;

  doc.setTextColor(0);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Overview", 14, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const overview = [
    `Courses: ${opts.totalCourses}`,
    `Quizzes Taken: ${opts.quizzesTaken}`,
    `Average Score: ${opts.averageScore}%`,
    `Current Streak: ${opts.currentStreak} days (Longest: ${opts.longestStreak})`,
  ];
  overview.forEach((line) => {
    doc.text(line, 14, y);
    y += 6;
  });
  y += 6;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Skills by Field", 14, y);
  y += 8;

  opts.fields.forEach((field) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${field.fieldName} — ${field.averageScore}%`, 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    field.skills.forEach((skill) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`   • ${skill.skillArea}: ${skill.averageScore}% (${skill.attemptCount} attempt${skill.attemptCount !== 1 ? "s" : ""})`, 14, y);
      y += 5.5;
    });
    y += 3;
  });

  y += 4;
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Recent Quiz Attempts", 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  opts.recentAttempts.forEach((a) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(`${new Date(a.attemptedAt).toLocaleDateString()} — ${a.quizTitle}: ${a.score}%`, 14, y);
    y += 5.5;
  });

  doc.save(`LearnMate-Progress-${new Date().toISOString().slice(0, 10)}.pdf`);
}
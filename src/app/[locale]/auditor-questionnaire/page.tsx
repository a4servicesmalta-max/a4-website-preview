import type { Metadata } from "next";
import QuestionnaireLayout from "@/components/AuditorQuestionnaire/QuestionnaireLayout";

export const metadata: Metadata = {
  title: "Auditor Dashboard — A4 Services",
  description: "Auditor questionnaire and dashboard experience for structured review.",
};

export default function AuditorQuestionnairePage() {
  return <QuestionnaireLayout />;

  // --- Previous implementation (commented out) ---
  // export default function AuditorQuestionnairePage() {
  //   return <QuestionnaireLayout />;
  // }
}

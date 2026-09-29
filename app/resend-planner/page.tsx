import type { Metadata } from "next";
import ResendPlannerForm from "@/components/ResendPlannerForm";

export const metadata: Metadata = {
  title: "Resend My Planner",
  description:
    "Lost your Ventariq download link? Enter the email you used at checkout and we’ll resend your planner link.",
  robots: { index: true, follow: true },
};

export default function ResendPlannerPage() {
  return <ResendPlannerForm />;
}
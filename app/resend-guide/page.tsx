import { permanentRedirect } from "next/navigation";

export default function LegacyResendGuidePage() {
  permanentRedirect("/resend-planner");
}

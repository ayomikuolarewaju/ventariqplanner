// app/events/[slug]/[planSku]/page.tsx

import { notFound } from "next/navigation";
import PlanDetailLayout from "@/components/PlanDetailLayout";
import { getEvent } from "@/lib/events";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ slug: string; planSku: string }>;
}) {
  const { slug, planSku } = await params;
  const event = await getEvent(slug);
  const plan = event?.plans.find((p) => p.sku === planSku);

  if (!event || !plan) {
    notFound();
  }

  return (
    <PlanDetailLayout
      eyebrow={event.eyebrow}
      title={plan.name}
      description={plan.description}
      sku={plan.sku}
      features={plan.features}
    />
  );
}

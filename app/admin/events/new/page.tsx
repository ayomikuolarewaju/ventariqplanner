// app/admin/events/new/page.tsx

import EventForm from "@/components/EventForm";

export default function NewEventPage() {
  return (
    <main className="container py-10">
      <h1 className="text-4xl font-bold mb-8">New Event</h1>
      <EventForm />
    </main>
  );
}

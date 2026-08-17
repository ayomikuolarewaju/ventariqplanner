"use client";

import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // NOTE: no backend wired yet -- see message below the code.
    setStatus("sent");
  }

  return (
    <main>
      <section className="bg-[#0D1420] py-20 text-white">
        <div className="container">
          <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
            Get In Touch
          </p>
          <h1 className="max-w-xl font-serif text-5xl font-bold leading-[1.07] text-white">
            Questions before you book?
          </h1>
          <p className="mt-5 max-w-xl text-[17px] text-[#C9C2A8]">
            Whether it&apos;s about a specific edition, a group trip, or
            something the guide didn&apos;t cover — we read every
            message.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid gap-10 md:grid-cols-[3fr_2fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[11px] border border-[#D8D2C2] bg-white p-8"
          >
            {status === "sent" ? (
              <div className="py-10 text-center">
                <p className="font-serif text-2xl text-[#8C6423]">
                  Message received.
                </p>
                <p className="mt-3 text-[#5A6472]">
                  We typically reply within one business day.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-[#5A6472]">
                    Name
                  </label>
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-[5px] border border-[#D8D2C2] px-4 py-3 text-[#152238] outline-none focus:border-[#B8863B]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-[#5A6472]">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-[5px] border border-[#D8D2C2] px-4 py-3 text-[#152238] outline-none focus:border-[#B8863B]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-[#5A6472]">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className="w-full rounded-[5px] border border-[#D8D2C2] px-4 py-3 text-[#152238] outline-none focus:border-[#B8863B]"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-[5px] bg-[#B8863B] px-6 py-3 text-[15px] font-bold text-[#0D1420] transition-colors hover:bg-[#c99a4d]"
                >
                  Send Message
                </button>
              </div>
            )}
          </form>

          <div className="h-fit rounded-[11px] border border-[#D8D2C2] bg-[#F4F1EA] p-8">
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-[#8C6423]">
              Reach Us Directly
            </p>

            <div className="space-y-5">
              <div>
                <p className="font-bold text-[#152238]">Email</p>
                <a
                  href="mailto:info@stratxct.com"
                  className="text-[14px] text-[#5A6472] hover:text-[#152238] block"
                >
                   info@stratxct.com 
                </a>
                 <a
                  href="mailto:support@stratxct.com"
                  className="text-[14px] text-[#5A6472] hover:text-[#152238] block"
                >
                   support@stratxct.com 
                </a>
              </div>

              <div>
                <p className="font-bold text-[#152238]">Response Time</p>
                <p className="text-[14px] text-[#5A6472]">
                  Within 1 business day
                </p>
              </div>

              <div>
                <p className="font-bold text-[#152238]">Company</p>
                <a
                  href="https://stratxct.com"
                  className="text-[14px] text-[#5A6472] hover:text-[#152238]"
                  target="_blank"
                  rel="noreferrer"
                >
                  StratX Solutions LLC
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

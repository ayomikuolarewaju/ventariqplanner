// lib/resend.ts
//
// npm install resend
// Add to .env: RESEND_API_KEY=re_...

import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

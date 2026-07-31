import { ConsoleSender } from "./console-sender";
import { ResendSender } from "./resend-sender";
import type { EmailSender } from "./types";

export type { EmailMessage, EmailSender } from "./types";

let sender: EmailSender | undefined;

/** Resend when RESEND_API_KEY is configured, otherwise logs to the console so local dev never needs real credentials. */
export function getEmailSender(): EmailSender {
  if (!sender) {
    sender = process.env.RESEND_API_KEY
      ? new ResendSender(process.env.RESEND_API_KEY)
      : new ConsoleSender();
  }
  return sender;
}

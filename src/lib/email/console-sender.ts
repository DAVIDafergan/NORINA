import type { EmailMessage, EmailSender } from "./types";

/** Dev/local fallback used whenever RESEND_API_KEY isn't set, so auth flows stay testable without real credentials. */
export class ConsoleSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    console.log(
      `[email:console] to=${message.to} subject="${message.subject}"\n${message.html}`,
    );
  }
}

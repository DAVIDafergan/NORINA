import { Resend } from "resend";
import type { EmailMessage, EmailSender } from "./types";

const FROM_ADDRESS = "NORINA <noreply@norina.example>"; // TODO: replace with the real verified sending domain once available

export class ResendSender implements EmailSender {
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(message: EmailMessage): Promise<void> {
    await this.client.emails.send({
      from: FROM_ADDRESS,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  }
}

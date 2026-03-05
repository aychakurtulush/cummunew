import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendFeedbackEmail(toEmail: string, eventTitle: string, eventId: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping feedback email.');
        return;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const feedbackUrl = `${appUrl}/events/${eventId}/feedback`;

    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>', // Replace with your verified domain
            to: toEmail,
            subject: `How was "${eventTitle}"?`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #44403c;">We hope you enjoyed "${eventTitle}"!</h2>
                    <p style="color: #57534e; font-size: 16px;">
                        The event has ended, and we would love to hear your thoughts. 
                        Your feedback helps hosts improve and helps other guests discover great experiences.
                    </p>
                    <div style="margin: 30px 0;">
                        <a href="${feedbackUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Leave Feedback
                        </a>
                    </div>
                    <p style="color: #78716c; font-size: 14px;">
                        Thanks for being part of the Communew community!<br/>
                        - The Communew Team
                    </p>
                </div>
            `
        });
    } catch (error) {
        console.error('Failed to send feedback email via Resend:', error);
    }
}

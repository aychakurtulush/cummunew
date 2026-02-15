import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingNotification(
    userEmail: string,
    eventTitle: string,
    eventId: string
) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("[Email] Resend API Key missing. Skipping email.");
        return;
    }

    try {
        console.log(`[Email] Sending notification to ${userEmail} for event ${eventTitle}`);
        await resend.emails.send({
            from: 'Communew <onboarding@resend.dev>', // Default sender for testing
            to: userEmail, // Sending to the booker (current user) to bypass Free Tier verify limits
            subject: `Request Sent: ${eventTitle}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #4a5d23;">Booking Request Sent! 🌿</h1>
                    <p>You have successfully requested to join <strong>${eventTitle}</strong>.</p>
                    <p>The host has been notified (simulated) and will review your request shortly.</p>
                    <hr style="border: 1px solid #e7e5e4; margin: 20px 0;" />
                    <p style="color: #78716c; font-size: 12px;">
                        <strong>Note for Demo:</strong> This email was sent to <em>you</em> (${userEmail}) because the Resend Free Tier only allows sending to the registered account email.
                        In a production app, this email would go to the Host, and you would receive a separate confirmation.
                    </p>
                    <p>
                        <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/events/${eventId}" style="color: #4a5d23;">View Event</a>
                    </p>
                </div>
            `
        });
        console.log(`[Email] Successfully sent to ${userEmail}`);
    } catch (error) {
        console.error("[Email] Failed to send:", error);
    }
}

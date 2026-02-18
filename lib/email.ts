import { Resend } from 'resend';

// Initialize safely to prevent build crashes if env var is missing
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export async function sendBookingNotification(
    userEmail: string,
    eventTitle: string,
    eventId: string
) {
    if (!resend) {
        console.warn("[Email] Resend API Key missing. Skipping email.");
        return;
    }

    try {
        console.log(`[Email] Sending notification to ${userEmail} for event ${eventTitle}`);
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
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

export async function sendInquiryReceivedEmail(
    userEmail: string,
    requesterName: string,
    studioName: string,
    inquiryId: string
) {
    if (!resend) return;

    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: `New Request: ${studioName} 📅`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #4a5d23;">New Studio Request!</h1>
                    <p><strong>${requesterName}</strong> has requested to book <strong>${studioName}</strong>.</p>
                    <p>Please log in to your dashboard to review and approve/reject this request.</p>
                    <p>
                        <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/host/inquiries" style="color: #4a5d23; font-weight: bold;">Review Request</a>
                    </p>
                </div>
            `
        });
    } catch (error) {
        console.error("[Email] Failed to send inquiry notification:", error);
    }
}

export async function sendInquiryStatusEmail(
    userEmail: string,
    studioName: string,
    status: string
) {
    if (!resend) return;

    const subject = status === 'approved' ? `Request Approved: ${studioName} ✅` : `Request Declined: ${studioName} ❌`;
    const color = status === 'approved' ? '#4a5d23' : '#b91c1c';

    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: subject,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: ${color};">Request ${status.charAt(0).toUpperCase() + status.slice(1)}</h1>
                    <p>Your request to book <strong>${studioName}</strong> has been <strong>${status}</strong>.</p>
                    ${status === 'approved' ? '<p>The host will be in touch shortly with more details.</p>' : '<p>You can try booking another time or contact the host for more info.</p>'}
                    <p>
                        <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/bookings" style="color: #4a5d23;">View Bookings</a>
                    </p>
                </div>
            `
        });
    } catch (error) {
        console.error("[Email] Failed to send status notification:", error);
    }
}

export async function sendMessageReceivedEmail(
    userEmail: string,
    senderName: string,
    messagePreview: string,
    conversationId: string
) {
    if (!resend) return;

    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: `New Message from ${senderName} 💬`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a5d23;">New Message</h2>
                    <p><strong>${senderName}</strong> sent you a message:</p>
                    <blockquote style="border-left: 4px solid #e7e5e4; padding-left: 10px; color: #57534e; font-style: italic;">
                        "${messagePreview.length > 50 ? messagePreview.slice(0, 50) + '...' : messagePreview}"
                    </blockquote>
                    <p>
                        <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/messages/${conversationId}" style="color: #4a5d23; font-weight: bold;">Reply Now</a>
                    </p>
                </div>
            `
        });
    } catch (error) {
        console.error("[Email] Failed to send message notification:", error);
    }
}

export async function sendBookingStatusEmail(
    userEmail: string,
    eventTitle: string,
    status: string
) {
    if (!resend) return;

    const subject = status === 'confirmed' ? `Booking Confirmed: ${eventTitle} ✅` : `Booking Declined: ${eventTitle} ❌`;
    const color = status === 'confirmed' ? '#4a5d23' : '#b91c1c';

    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: subject,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: ${color};">Booking ${status.charAt(0).toUpperCase() + status.slice(1)}</h1>
                    <p>Your request to join <strong>${eventTitle}</strong> has been <strong>${status}</strong>.</p>
                    ${status === 'confirmed' ? '<p>We look forward to seeing you there!</p>' : '<p>You can check out other events on our platform.</p>'}
                    <p>
                        <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/bookings" style="color: #4a5d23;">View Bookings</a>
                    </p>
                </div>
            `
        });
    } catch (error) {
        console.error("[Email] Failed to send booking status notification:", error);
    }
}

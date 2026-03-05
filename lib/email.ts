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
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1c1917; margin-bottom: 24px;">Request Sent!</h2>
                    <p style="color: #44403c; line-height: 1.6;">
                        You have requested to join <strong>${eventTitle}</strong>.
                    </p>
                    <p style="color: #44403c; line-height: 1.6;">
                        The host has been notified and will review your request shortly.
                    </p>
                    <div style="margin-top: 32px;">
                        <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/bookings" 
                           style="background-color: #4a5d23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                           View My Bookings
                        </a>
                    </div>
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


export async function sendBookingCancelledEmail(
    userEmail: string,
    eventTitle: string
) {
    if (!resend) return;

    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: `Booking Cancelled: ${eventTitle}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1c1917; margin-bottom: 24px;">Booking Cancelled</h2>
                    <p style="color: #44403c; line-height: 1.6;">
                        Your booking for <strong>${eventTitle}</strong> has been cancelled.
                    </p>
                    <p style="color: #44403c; line-height: 1.6;">
                        We hope to see you at another event soon!
                    </p>
                    <div style="margin-top: 32px;">
                        <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/" 
                           style="background-color: #4a5d23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                           Browse Events
                        </a>
                    </div>
                </div>
            `
        });
    } catch (error) {
        console.error("[Email] Failed to send cancellation email:", error);
    }
}

export async function sendBookingStatusEmail(
    userEmail: string,
    eventData: any,
    status: string
) {
    if (!resend) return;

    const eventTitle = eventData.title || 'your event';
    const subject = status === 'confirmed' ? `Booking Confirmed: ${eventTitle} ✅` : `Booking Declined: ${eventTitle} ❌`;
    const title = status === 'confirmed' ? 'Booking Confirmed! 🎉' : 'Booking Declined';

    let message = status === 'confirmed'
        ? `You're all set for <strong>${eventTitle}</strong>. We can't wait to see you there!`
        : `Your request for <strong>${eventTitle}</strong> was declined.`;

    if (status === 'confirmed' && eventData.payment_instructions) {
        message += `
            <div style="margin-top: 24px; padding: 16px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px;">
                <h3 style="color: #854d0e; margin-top: 0; margin-bottom: 12px; font-size: 16px;">Payment Instructions</h3>
                <p style="color: #713f12; margin: 0; font-size: 14px; white-space: pre-wrap;">${eventData.payment_instructions}</p>
                <p style="color: #713f12; margin-top: 12px; margin-bottom: 0; font-size: 13px;"><em>Please follow these instructions to secure your spot with the host.</em></p>
            </div>
        `;
    }

    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: subject,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1c1917; margin-bottom: 24px;">${title}</h2>
                    <p style="color: #44403c; line-height: 1.6;">${message}</p>
                    <div style="margin-top: 32px;">
                        <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/bookings" 
                           style="background-color: #4a5d23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                           View My Bookings
                        </a>
                    </div>
                </div>
            `
        });
    } catch (error) {
        console.error("[Email] Failed to send booking status notification:", error);
    }
}

export async function sendWaitlistOpeningEmail(
    userEmail: string,
    eventTitle: string,
    eventId: string
) {
    if (!resend) return;

    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: `Spot Opened: ${eventTitle} 🎉`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1c1917; margin-bottom: 24px;">A spot opened up!</h2>
                    <p style="color: #44403c; line-height: 1.6;">
                        Good news! A spot has just become available for <strong>${eventTitle}</strong>.
                    </p>
                    <p style="color: #44403c; line-height: 1.6;">
                        Since you were on the waitlist, we're letting you know first. Click the button below to claim your spot before someone else does!
                    </p>
                    <div style="margin-top: 32px;">
                        <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/events/${eventId}" 
                           style="background-color: #4a5d23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                           View Event & Book
                        </a>
                    </div>
                </div>
            `
        });
    } catch (error) {
        console.error("[Email] Failed to send waitlist opening email:", error);
    }
}

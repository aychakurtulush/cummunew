import { Resend } from 'resend';

// Initialize safely to prevent build crashes if env var is missing
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

if (!resend && process.env.NODE_ENV === 'production') {
    console.error("[Email] CRITICAL: RESEND_API_KEY is missing in production environment.");
}

// ─── Bilingual string tables ───────────────────────────────────────────────────
type Locale = 'en' | 'de';

const strings = {
    en: {
        requestSent: 'Request Sent',
        requestSentBody: (title: string) =>
            `You have requested to join <strong>${title}</strong>. The host has been notified and will review your request shortly.`,
        viewMyBookings: 'View My Bookings',
        newBookingRequest: 'New Booking Request!',
        newBookingRequestBody: (name: string, title: string) =>
            `<strong>${name}</strong> has requested to join your event: <strong>${title}</strong>. Please log in to your host dashboard to review and approve this request.`,
        reviewRequests: 'Review Requests',
        newStudioRequest: 'New Studio Request!',
        newStudioRequestBody: (name: string, studio: string) =>
            `<strong>${name}</strong> has requested to book <strong>${studio}</strong>. Please log in to your dashboard to review and approve/reject this request.`,
        reviewRequest: 'Review Request',
        studioRequestApproved: (studio: string) => `Request Approved: ${studio} ✅`,
        studioRequestDeclined: (studio: string) => `Request Declined: ${studio} ❌`,
        studioRequestStatus: (status: string, studio: string) =>
            `Your request to book <strong>${studio}</strong> has been <strong>${status}</strong>.`,
        studioApprovedNote: 'The host will be in touch shortly with more details.',
        studioDeclinedNote: 'You can try booking another time or contact the host for more info.',
        viewBookings: 'View Bookings',
        newMessage: 'New Message',
        newMessageFrom: (name: string) => `${name} sent you a message:`,
        replyNow: 'Reply Now',
        bookingCancelled: 'Booking Cancelled',
        bookingCancelledBody: (title: string) =>
            `Your booking for <strong>${title}</strong> has been cancelled. We hope to see you at another event soon!`,
        browseEvents: 'Browse Events',
        bookingConfirmed: 'Booking Confirmed! 🎉',
        bookingDeclined: 'Booking Declined',
        bookingConfirmedBody: (title: string) =>
            `You're all set for <strong>${title}</strong>. We can't wait to see you there!`,
        bookingDeclinedBody: (title: string) =>
            `Your request for <strong>${title}</strong> was declined.`,
        paymentInstructions: 'Payment Instructions',
        paymentNote: 'Please follow these instructions to secure your spot with the host.',
        spotOpened: 'A spot opened up!',
        spotOpenedBody: (title: string) =>
            `Good news! A spot has just become available for <strong>${title}</strong>. Since you were on the waitlist, we're letting you know first. Click the button below to claim your spot before someone else does!`,
        viewEventBook: 'View Event & Book',
        seeYouSoon: 'See you soon! 👋',
        reminderBody: (title: string) =>
            `This is a friendly reminder that <strong>${title}</strong> is happening in about 48 hours.`,
        eventDetails: 'Event Details',
        time: 'Time',
        location: 'Location',
        hostPaymentInstructions: 'Host Payment Instructions',
        alreadyPaidNote: "Note: If you've already paid, please ignore this.",
        cancellationPolicy: 'Cancellation policy: You can cancel up to 24 hours before the event for a full refund.',
        messageFromHost: 'Message from your Host',
        broadcastBody: (title: string) => `A host for <strong>${title}</strong> sent a message to all attendees:`,
        viewMoreEvents: 'View More Events',
        reviewRequestTitle: 'Hope you had a great time! 👋',
        reviewRequestBody: (title: string, host: string) =>
            `You recently attended <strong>${title}</strong> hosted by <strong>${host}</strong>. We'd love to hear about your experience to help keep the Communew community high-quality.`,
        rateExperience: 'Rate Your Experience',
        reviewThanks: (host: string) => `It only takes 30 seconds and helps hosts like ${host} grow!`,
        reminderSubject: (title: string) => `Reminder: ${title} is coming up! 📅`,
        bookingSubjectConfirmed: (title: string) => `Booking Confirmed: ${title} ✅`,
        bookingSubjectDeclined: (title: string) => `Booking Declined: ${title} ❌`,
        reviewSubject: (title: string) => `How was ${title}? ⭐`,
        waitlistSubject: (title: string) => `Spot Opened: ${title} 🎉`,
        cancelSubject: (title: string) => `Booking Cancelled: ${title}`,
        requestSubject: (title: string) => `Request Sent: ${title}`,
        hostRequestSubject: (title: string) => `New Request: ${title} 📅`,
        messageSubject: (name: string) => `New Message from ${name} 💬`,
        broadcastSubject: (title: string) => `Update from your host for: ${title}`,
        studioApprovedSubjectWord: 'Approved',
        studioDeclinedSubjectWord: 'Declined',
    },
    de: {
        requestSent: 'Anfrage gesendet',
        requestSentBody: (title: string) =>
            `Du hast eine Anfrage für <strong>${title}</strong> gestellt. Der Gastgeber wurde benachrichtigt und wird deine Anfrage in Kürze prüfen.`,
        viewMyBookings: 'Meine Buchungen ansehen',
        newBookingRequest: 'Neue Buchungsanfrage!',
        newBookingRequestBody: (name: string, title: string) =>
            `<strong>${name}</strong> hat eine Anfrage für dein Event gestellt: <strong>${title}</strong>. Bitte melde dich in deinem Gastgeber-Dashboard an, um die Anfrage zu bearbeiten.`,
        reviewRequests: 'Anfragen prüfen',
        newStudioRequest: 'Neue Studio-Anfrage!',
        newStudioRequestBody: (name: string, studio: string) =>
            `<strong>${name}</strong> hat eine Anfrage für <strong>${studio}</strong> gestellt. Bitte melde dich in deinem Dashboard an, um die Anfrage zu genehmigen oder abzulehnen.`,
        reviewRequest: 'Anfrage prüfen',
        studioRequestApproved: (studio: string) => `Anfrage genehmigt: ${studio} ✅`,
        studioRequestDeclined: (studio: string) => `Anfrage abgelehnt: ${studio} ❌`,
        studioRequestStatus: (status: string, studio: string) =>
            `Deine Anfrage für <strong>${studio}</strong> wurde <strong>${status === 'approved' ? 'genehmigt' : 'abgelehnt'}</strong>.`,
        studioApprovedNote: 'Der Gastgeber wird sich in Kürze mit weiteren Details bei dir melden.',
        studioDeclinedNote: 'Du kannst eine andere Zeit buchen oder den Gastgeber direkt kontaktieren.',
        viewBookings: 'Buchungen ansehen',
        newMessage: 'Neue Nachricht',
        newMessageFrom: (name: string) => `${name} hat dir eine Nachricht geschickt:`,
        replyNow: 'Jetzt antworten',
        bookingCancelled: 'Buchung storniert',
        bookingCancelledBody: (title: string) =>
            `Deine Buchung für <strong>${title}</strong> wurde storniert. Wir hoffen, dich bald bei einem anderen Event zu sehen!`,
        browseEvents: 'Events entdecken',
        bookingConfirmed: 'Buchung bestätigt! 🎉',
        bookingDeclined: 'Buchung abgelehnt',
        bookingConfirmedBody: (title: string) =>
            `Du bist für <strong>${title}</strong> angemeldet. Wir freuen uns auf dich!`,
        bookingDeclinedBody: (title: string) =>
            `Deine Anfrage für <strong>${title}</strong> wurde leider abgelehnt.`,
        paymentInstructions: 'Zahlungsanweisungen',
        paymentNote: 'Bitte folge diesen Anweisungen, um deinen Platz beim Gastgeber zu sichern.',
        spotOpened: 'Ein Platz ist frei geworden!',
        spotOpenedBody: (title: string) =>
            `Gute Neuigkeiten! Ein Platz ist für <strong>${title}</strong> verfügbar geworden. Da du auf der Warteliste warst, informieren wir dich zuerst. Klicke unten, um deinen Platz zu sichern!`,
        viewEventBook: 'Event ansehen & buchen',
        seeYouSoon: 'Bis bald! 👋',
        reminderBody: (title: string) =>
            `Dies ist eine freundliche Erinnerung, dass <strong>${title}</strong> in etwa 48 Stunden stattfindet.`,
        eventDetails: 'Event-Details',
        time: 'Uhrzeit',
        location: 'Ort',
        hostPaymentInstructions: 'Zahlungsanweisungen des Gastgebers',
        alreadyPaidNote: 'Hinweis: Wenn du bereits bezahlt hast, ignoriere diese Nachricht.',
        cancellationPolicy: 'Stornierungsbedingungen: Du kannst bis 24 Stunden vor dem Event kostenlos stornieren.',
        messageFromHost: 'Nachricht von deinem Gastgeber',
        broadcastBody: (title: string) => `Ein Gastgeber für <strong>${title}</strong> hat allen Teilnehmern eine Nachricht geschickt:`,
        viewMoreEvents: 'Weitere Events entdecken',
        reviewRequestTitle: 'Hoffentlich hat es dir gefallen! 👋',
        reviewRequestBody: (title: string, host: string) =>
            `Du hast kürzlich <strong>${title}</strong> besucht, organisiert von <strong>${host}</strong>. Wir würden uns über dein Feedback freuen!`,
        rateExperience: 'Erfahrung bewerten',
        reviewThanks: (host: string) => `Es dauert nur 30 Sekunden und hilft Gastgebern wie ${host}!`,
        reminderSubject: (title: string) => `Erinnerung: ${title} steht bevor! 📅`,
        bookingSubjectConfirmed: (title: string) => `Buchung bestätigt: ${title} ✅`,
        bookingSubjectDeclined: (title: string) => `Buchung abgelehnt: ${title} ❌`,
        reviewSubject: (title: string) => `Wie war ${title}? ⭐`,
        waitlistSubject: (title: string) => `Platz frei: ${title} 🎉`,
        cancelSubject: (title: string) => `Buchung storniert: ${title}`,
        requestSubject: (title: string) => `Anfrage gesendet: ${title}`,
        hostRequestSubject: (title: string) => `Neue Anfrage: ${title} 📅`,
        messageSubject: (name: string) => `Neue Nachricht von ${name} 💬`,
        broadcastSubject: (title: string) => `Update von deinem Gastgeber für: ${title}`,
        studioApprovedSubjectWord: 'genehmigt',
        studioDeclinedSubjectWord: 'abgelehnt',
    },
} as const;

// ─── Shared email wrapper ──────────────────────────────────────────────────────
function emailWrapper(content: string) {
    return `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">${content}</div>`;
}

function ctaButton(href: string, label: string) {
    return `<div style="margin-top: 32px;"><a href="${href}" style="background-color: #4a5d23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">${label}</a></div>`;
}

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

// ─── Email functions ───────────────────────────────────────────────────────────

export async function sendBookingNotification(
    userEmail: string,
    eventTitle: string,
    eventId: string,
    locale: Locale = 'en'
) {
    if (!resend) { console.warn("[Email] Resend API Key missing."); return; }
    const s = strings[locale];
    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: s.requestSubject(eventTitle),
            html: emailWrapper(`
                <h2 style="color:#1c1917;margin-bottom:24px;">${s.requestSent}!</h2>
                <p style="color:#44403c;line-height:1.6;">${s.requestSentBody(eventTitle)}</p>
                ${ctaButton(`${BASE_URL}/bookings`, s.viewMyBookings)}
            `),
        });
    } catch (e) { console.error("[Email] sendBookingNotification failed:", e); }
}

export async function sendBookingRequestToHostEmail(
    hostEmail: string,
    requesterName: string,
    eventTitle: string,
    eventId: string,
    locale: Locale = 'en'
) {
    if (!resend) return;
    const s = strings[locale];
    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: hostEmail,
            subject: s.hostRequestSubject(eventTitle),
            html: emailWrapper(`
                <h2 style="color:#4a5d23;margin-bottom:24px;">${s.newBookingRequest}</h2>
                <p style="color:#44403c;line-height:1.6;">${s.newBookingRequestBody(requesterName, eventTitle)}</p>
                ${ctaButton(`${BASE_URL}/host/events`, s.reviewRequests)}
            `),
        });
    } catch (e) { console.error("[Email] sendBookingRequestToHostEmail failed:", e); }
}

export async function sendInquiryReceivedEmail(
    userEmail: string,
    requesterName: string,
    studioName: string,
    inquiryId: string,
    locale: Locale = 'en'
) {
    if (!resend) return;
    const s = strings[locale];
    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: s.hostRequestSubject(studioName),
            html: emailWrapper(`
                <h1 style="color:#4a5d23;">${s.newStudioRequest}</h1>
                <p>${s.newStudioRequestBody(requesterName, studioName)}</p>
                <p><a href="${BASE_URL}/host/inquiries" style="color:#4a5d23;font-weight:bold;">${s.reviewRequest}</a></p>
            `),
        });
    } catch (e) { console.error("[Email] sendInquiryReceivedEmail failed:", e); }
}

export async function sendInquiryStatusEmail(
    userEmail: string,
    studioName: string,
    status: string,
    locale: Locale = 'en'
) {
    if (!resend) return;
    const s = strings[locale];
    const approved = status === 'approved';
    const color = approved ? '#4a5d23' : '#b91c1c';
    const subject = approved ? s.studioRequestApproved(studioName) : s.studioRequestDeclined(studioName);
    const note = approved ? s.studioApprovedNote : s.studioDeclinedNote;
    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject,
            html: emailWrapper(`
                <h1 style="color:${color};">Request ${approved ? s.studioApprovedSubjectWord : s.studioDeclinedSubjectWord}</h1>
                <p>${s.studioRequestStatus(status, studioName)}</p>
                <p>${note}</p>
                <p><a href="${BASE_URL}/bookings" style="color:#4a5d23;">${s.viewBookings}</a></p>
            `),
        });
    } catch (e) { console.error("[Email] sendInquiryStatusEmail failed:", e); }
}

export async function sendMessageReceivedEmail(
    userEmail: string,
    senderName: string,
    messagePreview: string,
    conversationId: string,
    locale: Locale = 'en'
) {
    if (!resend) return;
    const s = strings[locale];
    const preview = messagePreview.length > 50 ? messagePreview.slice(0, 50) + '...' : messagePreview;
    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: s.messageSubject(senderName),
            html: emailWrapper(`
                <h2 style="color:#4a5d23;">${s.newMessage}</h2>
                <p>${s.newMessageFrom(senderName)}</p>
                <blockquote style="border-left:4px solid #e7e5e4;padding-left:10px;color:#57534e;font-style:italic;">"${preview}"</blockquote>
                <p><a href="${BASE_URL}/messages/${conversationId}" style="color:#4a5d23;font-weight:bold;">${s.replyNow}</a></p>
            `),
        });
    } catch (e) { console.error("[Email] sendMessageReceivedEmail failed:", e); }
}

export async function sendBookingCancelledEmail(
    userEmail: string,
    eventTitle: string,
    locale: Locale = 'en'
) {
    if (!resend) return;
    const s = strings[locale];
    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: s.cancelSubject(eventTitle),
            html: emailWrapper(`
                <h2 style="color:#1c1917;margin-bottom:24px;">${s.bookingCancelled}</h2>
                <p style="color:#44403c;line-height:1.6;">${s.bookingCancelledBody(eventTitle)}</p>
                ${ctaButton(`${BASE_URL}/`, s.browseEvents)}
            `),
        });
    } catch (e) { console.error("[Email] sendBookingCancelledEmail failed:", e); }
}

export async function sendBookingStatusEmail(
    userEmail: string,
    eventData: any,
    status: string,
    locale: Locale = 'en'
) {
    if (!resend) return;
    const s = strings[locale];
    const eventTitle = eventData.title || 'your event';
    const isConfirmed = status === 'confirmed';
    const subject = isConfirmed ? s.bookingSubjectConfirmed(eventTitle) : s.bookingSubjectDeclined(eventTitle);
    const title = isConfirmed ? s.bookingConfirmed : s.bookingDeclined;
    let message = isConfirmed ? s.bookingConfirmedBody(eventTitle) : s.bookingDeclinedBody(eventTitle);

    let paymentBlock = '';
    if (isConfirmed && eventData.payment_instructions) {
        paymentBlock = `
            <div style="margin-top:24px;padding:16px;background-color:#fefce8;border:1px solid #fef08a;border-radius:8px;">
                <h3 style="color:#854d0e;margin-top:0;margin-bottom:12px;font-size:16px;">${s.paymentInstructions}</h3>
                <p style="color:#713f12;margin:0;font-size:14px;white-space:pre-wrap;">${eventData.payment_instructions}</p>
                <p style="color:#713f12;margin-top:12px;margin-bottom:0;font-size:13px;"><em>${s.paymentNote}</em></p>
            </div>`;
    }

    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject,
            html: emailWrapper(`
                <h2 style="color:#1c1917;margin-bottom:24px;">${title}</h2>
                <p style="color:#44403c;line-height:1.6;">${message}</p>
                ${paymentBlock}
                ${ctaButton(`${BASE_URL}/bookings`, s.viewMyBookings)}
            `),
        });
    } catch (e) { console.error("[Email] sendBookingStatusEmail failed:", e); }
}

export async function sendWaitlistOpeningEmail(
    userEmail: string,
    eventTitle: string,
    eventId: string,
    locale: Locale = 'en'
) {
    if (!resend) return;
    const s = strings[locale];
    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: s.waitlistSubject(eventTitle),
            html: emailWrapper(`
                <h2 style="color:#1c1917;margin-bottom:24px;">${s.spotOpened}</h2>
                <p style="color:#44403c;line-height:1.6;">${s.spotOpenedBody(eventTitle)}</p>
                ${ctaButton(`${BASE_URL}/events/${eventId}`, s.viewEventBook)}
            `),
        });
    } catch (e) { console.error("[Email] sendWaitlistOpeningEmail failed:", e); }
}

export async function sendEventReminderEmail(
    userEmail: string,
    eventData: {
        title: string;
        start_time: string;
        city: string;
        payment_instructions?: string;
    },
    locale: Locale = 'en'
) {
    if (!resend) return;
    const s = strings[locale];
    const dateLocale = locale === 'de' ? 'de-DE' : 'en-GB';
    const formattedDate = new Intl.DateTimeFormat(dateLocale, {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    }).format(new Date(eventData.start_time));

    const paymentBlock = eventData.payment_instructions ? `
        <div style="border-left:4px solid #4a5d23;padding-left:16px;margin:24px 0;">
            <h3 style="color:#4a5d23;margin:0 0 8px 0;font-size:16px;">${s.hostPaymentInstructions}</h3>
            <p style="color:#44403c;margin:0;font-size:14px;white-space:pre-wrap;">${eventData.payment_instructions}</p>
            <p style="color:#78716c;margin-top:8px;font-size:12px;font-style:italic;">${s.alreadyPaidNote}</p>
        </div>` : '';

    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: s.reminderSubject(eventData.title),
            html: emailWrapper(`
                <h2 style="color:#1c1917;margin-bottom:24px;">${s.seeYouSoon}</h2>
                <p style="color:#44403c;line-height:1.6;">${s.reminderBody(eventData.title)}</p>
                <div style="background-color:#f5f5f4;border-radius:8px;padding:20px;margin:24px 0;">
                    <p style="margin:0 0 10px 0;color:#57534e;font-size:14px;text-transform:uppercase;font-weight:bold;letter-spacing:0.05em;">${s.eventDetails}</p>
                    <p style="margin:0 0 5px 0;color:#1c1917;font-size:16px;"><strong>${s.time}:</strong> ${formattedDate}</p>
                    <p style="margin:0;color:#1c1917;font-size:16px;"><strong>${s.location}:</strong> ${eventData.city}</p>
                </div>
                ${paymentBlock}
                ${ctaButton(`${BASE_URL}/bookings`, s.viewMyBookings)}
                <p style="color:#78716c;font-size:12px;margin-top:40px;border-top:1px solid #e7e5e4;padding-top:20px;">${s.cancellationPolicy}</p>
            `),
        });
    } catch (e) { console.error("[Email] sendEventReminderEmail failed:", e); }
}

export async function sendBroadcastEmail(
    userEmails: string[],
    eventTitle: string,
    message: string,
    locale: Locale = 'en'
) {
    if (!resend || userEmails.length === 0) return;
    const s = strings[locale];
    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: 'noreply@communew.com',
            bcc: userEmails,
            subject: s.broadcastSubject(eventTitle),
            html: emailWrapper(`
                <h2 style="color:#1c1917;margin-bottom:24px;">${s.messageFromHost}</h2>
                <p style="color:#44403c;line-height:1.6;font-size:16px;">${s.broadcastBody(eventTitle)}</p>
                <div style="background-color:#f5f5f4;border-radius:8px;padding:24px;margin:24px 0;border:1px solid #e7e5e4;">
                    <p style="margin:0;color:#1c1917;line-height:1.8;white-space:pre-wrap;">${message}</p>
                </div>
                ${ctaButton(`${BASE_URL}/events`, s.viewMoreEvents)}
            `),
        });
    } catch (e) { console.error("[Email] sendBroadcastEmail failed:", e); }
}

export async function sendReviewRequestEmail(
    userEmail: string,
    eventTitle: string,
    hostName: string,
    bookingId: string,
    locale: Locale = 'en'
) {
    if (!resend) return;
    const s = strings[locale];
    try {
        await resend.emails.send({
            from: 'Communew <noreply@communew.com>',
            to: userEmail,
            subject: s.reviewSubject(eventTitle),
            html: emailWrapper(`
                <h2 style="color:#1c1917;margin-bottom:24px;">${s.reviewRequestTitle}</h2>
                <p style="color:#44403c;line-height:1.6;">${s.reviewRequestBody(eventTitle, hostName)}</p>
                <div style="margin-top:32px;text-align:center;">
                    <a href="${BASE_URL}/reviews/${bookingId}" style="background-color:#4a5d23;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">${s.rateExperience}</a>
                </div>
                <p style="color:#78716c;font-size:14px;margin-top:40px;text-align:center;">${s.reviewThanks(hostName)}</p>
            `),
        });
    } catch (e) { console.error("[Email] sendReviewRequestEmail failed:", e); }
}

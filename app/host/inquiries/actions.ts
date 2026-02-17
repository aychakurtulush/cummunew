'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { startConversation, sendMessage } from "@/app/messages/actions";

export async function createInquiry(data: {
    studioId: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    message: string;
}) {
    const supabase = await createClient();
    if (!supabase) return { error: "Database unavailable" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Basic Validation
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (start >= end) {
        return { error: "End time must be after start time" };
    }
    if (start < new Date()) {
        return { error: "Cannot book in the past" };
    }

    // Insert Inquiry
    const { error } = await supabase
        .from('studio_inquiries')
        .insert({
            studio_id: data.studioId,
            requester_id: user.id,
            start_time: data.startTime,
            end_time: data.endTime,
            message: data.message,
            status: 'pending'
        });

    if (error) {
        console.error("Create Inquiry Error:", error);
        return { error: error.message };
    }

    // Notification Logic
    try {
        const { data: studio } = await supabase
            .from('studios')
            .select('owner_user_id, name')
            .eq('id', data.studioId)
            .single();

        if (studio) {
            // Check for self-booking
            if (studio.owner_user_id === user.id) {
                console.log("Skipping notification for self-booking");
            } else {
                // 1. Ensure conversation exists
                const convResult = await startConversation(studio.owner_user_id);

                if (convResult.error) {
                    console.error("Failed to start conversation for notification:", convResult.error);
                } else if (convResult.conversationId) {
                    // 2. Send formatted message
                    const notificationText = `📅 New Booking Request\n\nI've requested to book ${studio.name || 'your studio'}.\n\nTime: ${new Date(data.startTime).toLocaleString()} - ${new Date(data.endTime).toLocaleTimeString()}\n\nMessage: "${data.message}"\n\nPlease check your Host Dashboard to approve or decline.`;

                    const msgResult = await sendMessage(convResult.conversationId, notificationText);
                    if (msgResult.error) {
                        console.error("Failed to send notification message:", msgResult.error);
                    }
                }
            }
        }
    } catch (notifyError) {
        console.error("Unexpected error in notification logic:", notifyError);
    }

    revalidatePath(`/studios/${data.studioId}`);
    return { success: true };
}

export async function getInquiriesForHost() {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    console.log("[getInquiriesForHost] User:", user.id);

    // 1. Get IDs of studios owned by user
    const { data: studios, error: studioError } = await supabase
        .from('studios')
        .select('id, name, owner_user_id')
        .eq('owner_user_id', user.id);

    if (studioError) {
        console.error("[getInquiriesForHost] Studio fetch error:", studioError);
        return [];
    }

    console.log("[getInquiriesForHost] Studios found:", studios?.length, studios);

    if (!studios || studios.length === 0) return [];

    const studioIds = studios.map(s => s.id);

    // 2. Fetch inquiries for these studios
    const { data: inquiries, error } = await supabase
        .from('studio_inquiries')
        .select(`
            id,
            start_time,
            end_time,
            message,
            status,
            created_at,
            studio_id,
            requester_id,
            studio:studios(name)
        `)
        .in('studio_id', studioIds)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("[getInquiriesForHost] Inquiries Error:", error);
        return [];
    }

    console.log("[getInquiriesForHost] Inquiries found:", inquiries?.length);

    // 3. Manually fetch profiles for requesters
    const requesterIds = Array.from(new Set(inquiries.map((i: any) => i.requester_id)));

    // START MANUAL PROFILE FETCH
    const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, role')
        .in('user_id', requesterIds);

    const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);

    return inquiries.map((i: any) => ({
        ...i,
        requester: {
            id: i.requester_id,
            name: profileMap.get(i.requester_id)?.full_name || 'Guest User'
        }
    }));
}


export async function updateInquiryStatus(inquiryId: string, newStatus: 'approved' | 'rejected') {
    const supabase = await createClient();
    if (!supabase) return { error: "Database unavailable" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Update
    const { error } = await supabase
        .from('studio_inquiries')
        .update({ status: newStatus })
        .eq('id', inquiryId);

    if (error) return { error: error.message };

    revalidatePath('/host/inquiries');
    return { success: true };
}

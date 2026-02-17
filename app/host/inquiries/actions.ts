'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

    // TODO: Send notification (email/chat) here

    revalidatePath(`/studios/${data.studioId}`);
    return { success: true };
}

export async function getInquiriesForHost() {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Get IDs of studios owned by user
    const { data: studios } = await supabase
        .from('studios')
        .select('id')
        .eq('owner_user_id', user.id);

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
            studio:studios(name),
            requester:requester_id(id) 
        `)
        .in('studio_id', studioIds)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Get Inquiries Error:", error);
        return [];
    }

    // 3. Manually fetch profiles for requesters (to avoid auth.users join issues)
    const requesterIds = Array.from(new Set(inquiries.map((i: any) => i.requester.id)));
    const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, role') // assuming role or avatar_url exists
        .in('user_id', requesterIds);

    const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);

    return inquiries.map((i: any) => ({
        ...i,
        requester: {
            ...i.requester,
            name: profileMap.get(i.requester.id)?.full_name || 'Guest User'
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

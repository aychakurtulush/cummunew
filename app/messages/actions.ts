'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function startConversation(otherUserId: string) {
    const supabase = await createClient();
    if (!supabase) return { error: "Database unavailable" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    if (user.id === otherUserId) {
        return { error: "Cannot message yourself" };
    }

    // Sort IDs to ensure uniqueness constraint works
    const participant1 = user.id < otherUserId ? user.id : otherUserId;
    const participant2 = user.id < otherUserId ? otherUserId : user.id;

    // Check if exists
    const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('participant1_id', participant1)
        .eq('participant2_id', participant2)
        .single();

    if (existing) {
        return { conversationId: existing.id };
    }

    // Create new
    const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
            participant1_id: participant1,
            participant2_id: participant2
        })
        .select('id')
        .single();

    if (error) {
        console.error("Error creating conversation:", error);
        return { error: error.message };
    }

    return { conversationId: newConv.id };
}

export async function sendMessage(conversationId: string, content: string) {
    const supabase = await createClient();
    if (!supabase) return { error: "Database unavailable" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_user_id: user.id,
            content: content
        });

    if (error) {
        return { error: error.message };
    }

    // Update conversation updated_at (optional, for sorting)
    await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    // Notification Logic (Email)
    try {
        // 1. Get Conversation to find recipient
        const { data: conversation } = await supabase
            .from('conversations')
            .select('participant1_id, participant2_id')
            .eq('id', conversationId)
            .single();

        if (conversation) {
            const recipientId = conversation.participant1_id === user.id
                ? conversation.participant2_id
                : conversation.participant1_id;

            // 2. Fetch Recipient Email (via Service Role)
            const { createServiceRoleClient } = await import('@/lib/supabase/service');
            const adminSupabase = createServiceRoleClient();

            const { data: recipientUser } = await adminSupabase.auth.admin.getUserById(recipientId);

            if (recipientUser?.user?.email) {
                const { sendMessageReceivedEmail } = await import('@/lib/email');
                const senderName = user.user_metadata?.full_name || 'A User';

                await sendMessageReceivedEmail(
                    recipientUser.user.email,
                    senderName,
                    content,
                    conversationId
                );
            }
        }
    } catch (notifyErr) {
        console.error("Failed to send message notification:", notifyErr);
    }

    revalidatePath(`/messages/${conversationId}`);
    revalidatePath('/messages');
    return { success: true };
}

export async function getConversations() {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Fetch conversations (raw)
    const { data: conversationsRaw, error } = await supabase
        .from('conversations')
        .select('id, updated_at, participant1_id, participant2_id')
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

    if (error || !conversationsRaw || conversationsRaw.length === 0) {
        if (error) console.error("Error fetching conversations:", error);
        return [];
    }

    // 2. Collect User IDs to fetch profiles
    const userIds = new Set<string>();
    conversationsRaw.forEach((c: any) => {
        if (c.participant1_id !== user.id) userIds.add(c.participant1_id);
        if (c.participant2_id !== user.id) userIds.add(c.participant2_id);
    });

    // 3. Fetch Profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url') // Use avatar_url if that's the column name
        .in('user_id', Array.from(userIds));

    const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);

    // 4. Map back to detailed objects
    const conversationsWithDetails = await Promise.all(conversationsRaw.map(async (conv: any) => {
        const otherUserId = conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id;
        const otherProfile = profileMap.get(otherUserId);

        const otherUser = {
            id: otherUserId,
            name: otherProfile?.full_name || 'User', // Fallback
            avatar: otherProfile?.avatar_url, // Or whatever column
            initial: (otherProfile?.full_name?.[0] || 'U').toUpperCase()
        };

        // Get last message
        const { data: messages } = await supabase
            .from('messages')
            .select('content, created_at, sender_user_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

        const lastMessage = messages?.[0];

        return {
            id: conv.id,
            otherUser,
            lastMessage: lastMessage?.content || 'No messages yet',
            lastMessageTime: lastMessage?.created_at,
            isUnread: false
        };
    }));

    return conversationsWithDetails;
}

export async function getMessages(conversationId: string) {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data: messages } = await supabase
        .from('messages')
        .select(`
            id,
            content,
            created_at,
            sender_user_id
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    return messages || [];
}

export async function requestToHost(ownerId: string, studioName: string) {
    const supabase = await createClient();
    if (!supabase) return { error: "Database unavailable" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 1. Start/Get Conversation
    const convResult = await startConversation(ownerId);
    if (convResult.error) return { error: convResult.error };

    const conversationId = convResult.conversationId;

    if (!conversationId) return { error: "Failed to start conversation" };

    // 2. Check if specific request message already exists to avoid spam
    const { data: existingMessages } = await supabase
        .from('messages')
        .select('id, content, created_at')
        .eq('conversation_id', conversationId)
        .eq('sender_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

    const lastMsg = existingMessages?.[0];
    const messageContent = `Hi, I'm interested in hosting an event at ${studioName}. Is it available?`;

    // Only send if the last message wasn't identical (basic idempotency)
    // or if it's been a while (e.g., allow re-sending after some time if needed, but for now strict check is safer)
    if (lastMsg && lastMsg.content === messageContent) {
        // Already sent, just return success
        return { conversationId };
    }

    // 3. Send Request Message
    const msgResult = await sendMessage(conversationId, messageContent);
    if (msgResult.error) return { error: msgResult.error };

    return { conversationId };
}

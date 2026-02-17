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

    revalidatePath(`/messages/${conversationId}`);
    revalidatePath('/messages');
    return { success: true };
}

export async function getConversations() {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Fetch conversations
    const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
            id,
            updated_at,
            participant1:participant1_id(id, full_name, avatar_url),
            participant2:participant2_id(id, full_name, avatar_url)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

    if (error || !conversations) return [];

    // Fetch last message for each
    const conversationsWithDetails = await Promise.all(conversations.map(async (conv: any) => {
        const otherUser = conv.participant1.id === user.id ? conv.participant2 : conv.participant1;

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
            otherUser: {
                id: otherUser?.id,
                name: otherUser?.full_name || 'User',
                avatar: otherUser?.avatar_url,
                initial: (otherUser?.full_name?.[0] || 'U').toUpperCase()
            },
            lastMessage: lastMessage?.content || 'No messages yet',
            lastMessageTime: lastMessage?.created_at,
            isUnread: false // TODO: Implement read status
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

    // 2. Check if specific request message already exists recently to avoid spam
    // (Skipping for now for simplicity, but good to have in mind)

    // 3. Send Request Message
    const messageContent = `Hi, I'm interested in hosting an event at ${studioName}. Is it available?`;

    const msgResult = await sendMessage(conversationId, messageContent);
    if (msgResult.error) return { error: msgResult.error };

    return { conversationId };
}

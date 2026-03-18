'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { parseBerlinInput } from '@/lib/date-utils';
import { geocodeAddress } from '@/lib/geocoding';
import { getTranslations } from 'next-intl/server';

export async function createEvent(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const t = await getTranslations('actions.host');
    const commonT = await getTranslations('common');

    if (!supabase) {
        return { message: commonT('error') }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { message: t('authRequired') }
    }

    // Trust & Safety: Check for suspension/ban
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned, is_suspended_until')
        .eq('user_id', user.id)
        .single();

    if (profile?.is_banned) {
        return { message: t('banned') }
    }
    if (profile?.is_suspended_until && new Date(profile.is_suspended_until) > new Date()) {
        return { message: t('suspended', { date: new Date(profile.is_suspended_until).toLocaleDateString() }) }
    }

    const startInput = formData.get('start_time') as string;
    const endInput = formData.get('end_time') as string;

    // Convert input (Berlin Time) -> UTC
    const startTimeString = parseBerlinInput(startInput);
    const endTimeString = endInput ? parseBerlinInput(endInput) : null;

    if (!startTimeString) {
        return { message: t('invalidStart') };
    }

    const startTime = new Date(startTimeString);
    const endTime = endTimeString ? new Date(endTimeString) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    // Validation: End time must be after start time
    if (endTime <= startTime) {
        return { message: t('futureEnd') };
    }

    // Handle Image Upload if provided
    let imageUrl = null;
    const imageFile = formData.get('image') as File;

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('event-images')
            .upload(filePath, imageFile);

        if (uploadError) {
            console.error('STORAGE ERROR uploading image:', uploadError);
            return { message: t('uploadFailed', { error: uploadError.message }) };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(filePath);

        imageUrl = publicUrl;
    }

    // Basic validation could go here
    const location_type = formData.get('location_type') as 'home' | 'studio' | 'partner_venue';
    let city = formData.get('city') as string;
    const studio_id = formData.get('studio_id') as string || null;

    // If studio_id is present but city is missing (likely hidden in form), fetch studio location
    if (studio_id && !city) {
        try {
            const { data: studio } = await supabase
                .from('studios')
                .select('location')
                .eq('id', studio_id)
                .single();

            if (studio && studio.location) {
                // Extract city from location if possible, or just use the whole location string
                // For MVP, assuming location string acts as city or contains it
                city = studio.location.split(',')[0].trim(); // Simple heuristic: take first part before comma
            }
        } catch (error) {
            console.error('Error fetching studio location:', error);
        }
    }

    const location_name = formData.get('location_name') as string || null;
    const location_address = formData.get('location_address') as string || null;

    let latitude = null;
    let longitude = null;

    if (location_type === 'studio' && studio_id) {
        // Overbooking protection
        const { data: overlappingEvents } = await supabase
            .from('events')
            .select('id')
            .eq('studio_id', studio_id)
            .lt('start_time', endTime.toISOString())
            .gt('end_time', startTime.toISOString());

        if (overlappingEvents && overlappingEvents.length > 0) {
            return { message: t('overbooked') };
        }

        // 1. Fetch studio location and coordinates
        const { data: studio } = await supabase.from('studios').select('location, latitude, longitude').eq('id', studio_id).single();
        city = studio?.location?.split(',')[0].trim() || "Berlin";
        latitude = studio?.latitude;
        longitude = studio?.longitude;
    } else if (location_address) {
        // Geocode custom address
        const geoResult = await geocodeAddress(location_address);
        if (geoResult) {
            latitude = geoResult.latitude;
            longitude = geoResult.longitude;
        }
    }

    const rawData = {
        creator_user_id: user.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        capacity: parseInt(formData.get('capacity') as string),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        location_type: formData.get('location_type') as 'home' | 'studio' | 'partner_venue',
        city: city || 'Berlin',
        category: formData.get('category') as string,
        image_url: imageUrl,
        studio_id: studio_id,
        status: 'pending',
        seating_type: formData.get('seating_type') || 'mixed',
        materials_provided: formData.get('materials_provided') === 'true',
        is_guided: formData.get('is_guided') === 'true',
        payment_instructions: formData.get('payment_instructions') as string || null,
        location_name,
        location_address,
        latitude,
        longitude,
        difficulty_level: formData.get('difficulty_level') as string || null,
        languages: (formData.get('languages') as string)?.split(',').map(s => s.trim()).filter(s => s.length > 0) || [],
        age_range: formData.get('age_range') as string || null
    }

    // For MVP, auto-approve
    // @ts-ignore
    rawData.status = 'approved'

    const { error } = await supabase
        .from('events')
        .insert(rawData)

    if (error) {
        console.error('SERVER ERROR creating event:', JSON.stringify(error, null, 2))
        return { message: `Failed to create event: ${error.message} (${error.code})` }
    }

    revalidatePath('/host');
    revalidatePath('/'); // Update public explore page
    redirect('/host')
}

export async function updateEvent(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const t = await getTranslations('actions.host');
    const commonT = await getTranslations('common');

    if (!supabase) return { message: commonT('error') }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { message: t('authRequired') }

    // Trust & Safety: Check for suspension/ban
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned, is_suspended_until')
        .eq('user_id', user.id)
        .single();

    if (profile?.is_banned) return { message: t('banned') }
    if (profile?.is_suspended_until && new Date(profile.is_suspended_until) > new Date()) return { message: t('suspended', { date: new Date(profile.is_suspended_until).toLocaleDateString() }) }

    const eventId = formData.get('id') as string;
    if (!eventId) return { message: t('invalidEventId') || "Event ID missing" };

    const startInput = formData.get('start_time') as string;
    const endInput = formData.get('end_time') as string;

    // Convert input (Berlin Time) -> UTC
    const startTimeString = parseBerlinInput(startInput);
    const endTimeString = endInput ? parseBerlinInput(endInput) : null;

    if (!startTimeString) {
        return { message: t('invalidStart') };
    }

    const startTime = new Date(startTimeString);
    const endTime = endTimeString ? new Date(endTimeString) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    if (endTime <= startTime) {
        return { message: t('futureEnd') };
    }

    const location_type = formData.get('location_type') as 'home' | 'studio' | 'partner_venue';
    const rawData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        capacity: parseInt(formData.get('capacity') as string),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        location_type: location_type,
        city: formData.get('city') as string,
        category: formData.get('category') as string,
        studio_id: formData.get('studio_id') as string || null,
        seating_type: formData.get('seating_type') || 'mixed',
        materials_provided: formData.get('materials_provided') === 'true',
        is_guided: formData.get('is_guided') === 'true',
        payment_instructions: formData.get('payment_instructions') as string || null,
        difficulty_level: formData.get('difficulty_level') as string || null,
        languages: (formData.get('languages') as string)?.split(',').map(s => s.trim()).filter(s => s.length > 0) || [],
        age_range: formData.get('age_range') as string || null
    };

    const location_name = formData.get('location_name') as string || null;
    const location_address = formData.get('location_address') as string || null;

    let latitude = null;
    let longitude = null;

    if (location_type === 'studio' && rawData.studio_id) {
        // Overbooking protection
        const { data: overlappingEvents } = await supabase
            .from('events')
            .select('id')
            .eq('studio_id', rawData.studio_id)
            .neq('id', eventId)
            .lt('start_time', endTime.toISOString())
            .gt('end_time', startTime.toISOString());

        if (overlappingEvents && overlappingEvents.length > 0) {
            return { message: t('overbooked') };
        }

        const { data: studio } = await supabase.from('studios').select('latitude, longitude, location').eq('id', rawData.studio_id).single();
        latitude = studio?.latitude;
        longitude = studio?.longitude;
        if (studio?.location) {
            rawData.city = studio.location.split(',')[0].trim();
        } else if (!rawData.city) {
            rawData.city = "Berlin";
        }
    } else if (location_address) {
        const geoResult = await geocodeAddress(location_address);
        if (geoResult) {
            latitude = geoResult.latitude;
            longitude = geoResult.longitude;
        }
    }

    const updateData: any = {
        ...rawData,
        location_name,
        location_address,
        latitude,
        longitude
    };

    const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .eq('creator_user_id', user.id); // Security check

    if (error) {
        console.error('SERVER ERROR updating event:', error)
        return { message: `Failed to update event: ${error.message}` }
    }

    revalidatePath('/host');
    revalidatePath(`/events/${eventId}`);
    revalidatePath(`/host/events/${eventId}/edit`);

    return { message: 'Success' }
}

export async function createStudio(prevState: any, formData: FormData) {

    const supabase = await createClient()
    const t = await getTranslations('actions.host');
    const commonT = await getTranslations('common');

    if (!supabase) {
        console.error('[createStudio] No supabase client');
        return { message: commonT('error'), success: false }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.error('[createStudio] No user');
        return { message: t('authRequired'), success: false }
    }

    // Trust & Safety: Check for suspension/ban
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned, is_suspended_until')
        .eq('user_id', user.id)
        .single();

    if (profile?.is_banned) return { message: t('banned') }
    if (profile?.is_suspended_until && new Date(profile.is_suspended_until) > new Date()) {
        return { message: t('suspended', { date: new Date(profile.is_suspended_until).toLocaleDateString() }) }
    }


    try {
        // Handle Image Upload
        let imageUrls: string[] = [];
        const imageFiles = formData.getAll('images') as File[];

        if (imageFiles && imageFiles.length > 0) {

            // Limit to 5 max directly on the backend as secondary validation
            const filesToProcess = imageFiles.slice(0, 5);

            const uploadPromises = filesToProcess.map(async (imageFile, index) => {
                if (imageFile.size === 0) return null;

                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('studio-images')
                    .upload(filePath, imageFile);

                if (uploadError) {
                    console.error('[createStudio] STORAGE ERROR:', uploadError);
                    throw new Error(`Failed to upload ${imageFile.name}: ${uploadError.message}`);
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('studio-images')
                    .getPublicUrl(filePath);

                return publicUrl;
            });

            try {
                const results = await Promise.all(uploadPromises);
                imageUrls = results.filter((url): url is string => url !== null);
            } catch (uploadError: any) {
                return { message: uploadError.message, success: false };
            }
        }

        // Parse Amenities
        const amenitiesString = formData.get('amenities') as string;
        const amenities = amenitiesString
            ? amenitiesString.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : [];

        const location = formData.get('location') as string;
        let latitude = null;
        let longitude = null;

        if (location) {
            const geoResult = await geocodeAddress(location);
            if (geoResult) {
                latitude = geoResult.latitude;
                longitude = geoResult.longitude;
            }
        }

        const rawData = {
            owner_user_id: user.id,
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            location: location,
            latitude: latitude,
            longitude: longitude,
            price_per_hour: parseFloat(formData.get('price_per_hour') as string) || 0,
            capacity: parseInt(formData.get('capacity') as string) || 0,
            amenities: amenities,
            features: formData.getAll('features') as string[],
            images: imageUrls,
            status: 'active',
            space_rules: formData.get('space_rules') as string || null
        }


        const { error } = await supabase
            .from('studios')
            .insert(rawData)

        if (error) {
            console.error('[createStudio] DB INSERT ERROR:', error)

            // Fallback: Try with Service Role if PERMISSION DENIED (42501)
            // This handles cases where RLS policies (Migration 015) haven't been applied yet
            if (error.code === '42501') {
                console.warn('[createStudio] RLS Permission Denied. Attempting fallback to Service Role...');
                try {
                    const { createServiceRoleClient } = await import('@/lib/supabase/service');
                    const adminSupabase = createServiceRoleClient();

                    const { error: adminError } = await adminSupabase
                        .from('studios')
                        .insert(rawData);

                    if (adminError) {
                        console.error('[createStudio] Admin Fallback Failed:', adminError);
                        return { message: `Failed to create studio (Admin): ${adminError.message}`, success: false }
                    }


                    // Success - fall through to return
                } catch (adminErr: any) {
                    console.error('[createStudio] Service Role init failed:', adminErr);
                    return { message: `Failed to create studio: ${error.message}`, success: false }
                }
            } else {
                return { message: `Failed to create studio: ${error.message}`, success: false }
            }
        }


        // revalidatePath('/host/studios');
        // revalidatePath('/'); // Commenting out to isolate issues

        return {
            message: 'Success',
            success: true
        };

    } catch (e: any) {
        console.error('[createStudio] UNEXPECTED FATAL ERROR:', e);
        return { message: `An unexpected error occurred: ${e.message}`, success: false }
    }
}

export async function updateStudio(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const t = await getTranslations('actions.host');
    const commonT = await getTranslations('common');

    if (!supabase) return { message: commonT('error'), success: false }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { message: t('authRequired'), success: false }
    }

    // Trust & Safety: Check for suspension/ban
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned, is_suspended_until')
        .eq('user_id', user.id)
        .single();

    if (profile?.is_banned || (profile?.is_suspended_until && new Date(profile.is_suspended_until) > new Date())) {
        return { message: "Account restricted.", success: false }
    }

    const studioId = formData.get('id') as string;
    if (!studioId) return { message: "Studio ID missing", success: false };

    try {
        // Handle Image Upload if provided (Optional update)
        let imageUrls: string[] | undefined = undefined;
        const imageFiles = formData.getAll('images') as File[];

        if (imageFiles && imageFiles.length > 0) {

            const validFiles = imageFiles.filter(f => f.size > 0);

            if (validFiles.length > 0) {
                const filesToProcess = validFiles.slice(0, 5);
                const uploadPromises = filesToProcess.map(async (imageFile, index) => {
                    const fileExt = imageFile.name.split('.').pop();
                    const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('studio-images')
                        .upload(filePath, imageFile);

                    if (uploadError) {
                        console.error('[updateStudio] STORAGE ERROR:', uploadError);
                        throw new Error(`Failed to upload ${imageFile.name}: ${uploadError.message}`);
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('studio-images')
                        .getPublicUrl(filePath);

                    return publicUrl;
                });

                try {
                    const results = await Promise.all(uploadPromises);
                    imageUrls = results.filter((url): url is string => url !== null);
                } catch (uploadError: any) {
                    return { message: uploadError.message, success: false };
                }
            }
        }

        // Parse Amenities
        const amenitiesString = formData.get('amenities') as string;
        const amenities = amenitiesString
            ? amenitiesString.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : undefined; // undefined means don't update if not present? Form likely has it.

        const location = formData.get('location') as string;
        let latitude = undefined;
        let longitude = undefined;

        if (location) {
            const geoResult = await geocodeAddress(location);
            if (geoResult) {
                latitude = geoResult.latitude;
                longitude = geoResult.longitude;
            }
        }

        const rawData: any = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            location: location,
            price_per_hour: parseFloat(formData.get('price_per_hour') as string) || 0,
            capacity: parseInt(formData.get('capacity') as string) || 0,
            space_rules: formData.get('space_rules') as string || null,
        };

        if (latitude !== undefined) rawData.latitude = latitude;
        if (longitude !== undefined) rawData.longitude = longitude;

        if (amenities !== undefined) rawData.amenities = amenities;

        const features = formData.getAll('features');
        if (features.length > 0) rawData.features = features as string[];

        if (imageUrls !== undefined) rawData.images = imageUrls;

        const { error } = await supabase
            .from('studios')
            .update(rawData)
            .eq('id', studioId)
            .eq('owner_user_id', user.id); // RLS handles this too, but good double check

        if (error) {
            console.error('[updateStudio] UPDATE ERROR:', error);
            return { message: `Failed to update studio: ${error.message}`, success: false };
        }

        revalidatePath('/host/studios');
        revalidatePath(`/studios/${studioId}`);
        return { message: 'Success', success: true };

    } catch (e: any) {
        console.error('[updateStudio] ERROR:', e);
        return { message: `Error: ${e.message}`, success: false };
    }
}

export async function deleteStudio(studioId: string) {
    const supabase = await createClient()
    const t = await getTranslations('actions.host');
    const commonT = await getTranslations('common');

    if (!supabase) return { error: commonT('error') }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: t('unauthorized') }

    const { error } = await supabase
        .from('studios')
        .delete()
        .eq('id', studioId)
        .eq('owner_user_id', user.id);

    if (error) {
        console.error('[deleteStudio] ERROR:', error);
        return { error: `Failed to delete studio: ${error.message}` };
    }

    revalidatePath('/host/studios');
    revalidatePath('/');
    return { success: true };
}

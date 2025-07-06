import { supabase } from './client';
import type { Database } from './types';

export type Attendee = Database['public']['Tables']['attendees']['Row'];
export type SurveyResponse = Database['public']['Tables']['survey_responses']['Row'];
export type PeakPerformanceDefinition = Database['public']['Tables']['peak_performance_definitions']['Row'];
export type Moderation = Database['public']['Tables']['moderation']['Row'];

export async function createAttendee(data: {
  first_name: string;
  last_name?: string;
  email?: string;
  is_anonymous?: boolean;
}) {
  // If email is provided and not anonymous, check if attendee exists
  if (data.email && !data.is_anonymous) {
    const { data: existingAttendee, error: findError } = await supabase
      .from('attendees')
      .select('*')
      .eq('email', data.email);

    // If no error and we found an existing attendee, update it
    if (!findError && existingAttendee && existingAttendee.length > 0) {
      const { data: updatedAttendee, error } = await supabase
        .from('attendees')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          is_anonymous: data.is_anonymous,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAttendee[0].id)
        .select()
        .single();

      if (error) throw error;
      return updatedAttendee;
    }
  }

  // Create new attendee
  const { data: attendee, error } = await supabase
    .from('attendees')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return attendee;
}

export async function createSurveyResponse(data: {
  attendee_id: string;
  years_at_medtronic?: number;
  learning_style?: Database['public']['Tables']['survey_responses']['Row']['learning_style'];
  shaped_by?: Database['public']['Tables']['survey_responses']['Row']['shaped_by'];
  peak_performance?: Database['public']['Tables']['survey_responses']['Row']['peak_performance'];
  motivation?: Database['public']['Tables']['survey_responses']['Row']['motivation'];
  unique_quality?: string;
}) {
  const { data: response, error } = await supabase
    .from('survey_responses')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return response;
}

export async function getPeakPerformanceDefinitions() {
  const { data: definitions, error } = await supabase
    .from('peak_performance_definitions')
    .select('*')
    .order('type');

  if (error) throw error;
  return definitions;
}

export async function getModerationQueue() {
  console.log('Executing getModerationQueue...');
  
  // Get all responses with unique_quality first
  const { data: queue, error } = await supabase
    .from('survey_responses')
    .select(`
      *,
      attendees (
        first_name,
        last_name,
        is_anonymous
      ),
      moderation (
        status,
        notes
      )
    `)
    .not('unique_quality', 'is', null)
    .not('unique_quality', 'eq', '')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error in getModerationQueue:', error);
    throw error;
  }
  
  console.log('Queue data received:', queue);
  
  // Filter responses that need moderation: either no moderation record or pending status
  const filteredQueue = queue?.filter(response => {
    console.log('Checking response:', response.id, 'Moderation:', response.moderation);
    
    // Include if no moderation record exists
    if (!response.moderation || response.moderation.length === 0) {
      return true;
    }
    
    // Include if moderation status is pending
    return response.moderation[0]?.status === 'pending';
  });
  
  console.log('Final filtered queue:', filteredQueue);
  return filteredQueue;
}

export async function updateModerationStatus(
  responseId: string,
  data: {
    status: Database['public']['Tables']['moderation']['Row']['status'];
    moderator_id: string;
    notes?: string;
  }
) {
  // First update the moderation table
  const { data: moderation, error: moderationError } = await supabase
    .from('moderation')
    .upsert({
      response_id: responseId,
      field_name: 'unique_quality',
      ...data,
    }, {
      onConflict: 'response_id,field_name'
    })
    .select()
    .single();

  if (moderationError) throw moderationError;

  // Then update the survey_responses table
  const { error: responseError } = await supabase
    .from('survey_responses')
    .update({
      status: data.status,
      moderated_at: new Date().toISOString()
    })
    .eq('id', responseId);

  if (responseError) throw responseError;

  return moderation;
}

export async function getVisualizationData(showTestData: boolean = false) {
  let query = supabase
    .from('survey_responses')
    .select(`
      *,
      attendee:attendees (
        first_name,
        last_name,
        is_anonymous
      ),
      moderation (
        status
      )
    `)
    .order('created_at', { ascending: false });

  if (showTestData) {
    query = query.eq('test_data', true);
  } else {
    query = query.or('test_data.is.null,test_data.eq.false');
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getApprovedUniqueQualities() {
  const { data, error } = await supabase
    .from('survey_responses')
    .select(`
      unique_quality,
      attendee:attendees (
        first_name,
        last_name,
        is_anonymous
      ),
      moderation!inner (
        status
      )
    `)
    .eq('moderation.status', 'approved')
    .eq('moderation.field_name', 'unique_quality')
    .not('unique_quality', 'is', null)
    .order('moderation.created_at', { ascending: false });

  if (error) throw error;
  
  // Filter and format the data
  return data
    ?.filter(item => item.unique_quality && item.unique_quality.trim() !== '')
    .map(item => ({
      unique_quality: item.unique_quality,
      attendee: item.attendee
    })) || [];
}

export async function debugSurveyResponses() {
  console.log('Debugging survey responses...');
  
  // Check all survey responses
  const { data: allResponses, error: allError } = await supabase
    .from('survey_responses')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (allError) {
    console.error('Error fetching all responses:', allError);
    return;
  }
  
  console.log('All survey responses:', allResponses);
  console.log('Total responses:', allResponses?.length || 0);
  
  // Check responses with unique_quality
  const { data: withQuality, error: qualityError } = await supabase
    .from('survey_responses')
    .select('*')
    .not('unique_quality', 'is', null)
    .not('unique_quality', 'eq', '')
    .order('created_at', { ascending: false });
    
  if (qualityError) {
    console.error('Error fetching responses with quality:', qualityError);
    return;
  }
  
  console.log('Responses with unique_quality:', withQuality);
  console.log('Responses with quality count:', withQuality?.length || 0);
  
  // Check moderation records
  const { data: moderationRecords, error: modError } = await supabase
    .from('moderation')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (modError) {
    console.error('Error fetching moderation records:', modError);
    return;
  }
  
  console.log('Moderation records:', moderationRecords);
  console.log('Moderation records count:', moderationRecords?.length || 0);
  
  return {
    allResponses,
    withQuality,
    moderationRecords
  };
} 
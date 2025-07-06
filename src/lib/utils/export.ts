import { supabase } from '../supabase/client';

export async function exportSurveyData() {
  try {
    const { data: responses, error } = await supabase
      .from('responses')
      .select(`
        *,
        attendee:attendees(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data for export
    const exportData = responses.map(response => ({
      'First Name': response.attendee.first_name,
      'Last Name': response.attendee.last_name,
      'Email': response.attendee.email,
      'Question ID': response.question_id,
      'Answer': response.answer,
      'Created At': new Date(response.created_at).toLocaleString(),
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => 
          JSON.stringify(row[header])
        ).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `survey-data-${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

export async function exportVisualizationData() {
  try {
    const { data: responses, error } = await supabase
      .from('responses')
      .select(`
        *,
        attendee:attendees(first_name, last_name),
        moderation:moderation(status)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data for visualization
    const visualizationData = responses.map(response => ({
      id: response.id,
      attendee: `${response.attendee.first_name} ${response.attendee.last_name}`,
      questionId: response.question_id,
      answer: response.answer,
      status: response.moderation?.status || 'pending',
      timestamp: new Date(response.created_at).getTime(),
    }));

    return visualizationData;
  } catch (error) {
    console.error('Error preparing visualization data:', error);
    throw error;
  }
} 
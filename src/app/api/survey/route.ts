import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, answers } = body;

    // Create attendee record
    const { data: attendee, error: attendeeError } = await supabase
      .from('attendees')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
      })
      .select()
      .single();

    if (attendeeError) throw attendeeError;

    // Create response records
    const responseRecords = answers.map((answer: any) => ({
      attendee_id: attendee.id,
      question_id: answer.questionId,
      answer: answer.answer,
    }));

    const { error: responsesError } = await supabase
      .from('responses')
      .insert(responseRecords);

    if (responsesError) throw responsesError;

    return NextResponse.json({ 
      success: true, 
      message: 'Survey submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting survey:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error submitting survey' 
      },
      { status: 500 }
    );
  }
} 
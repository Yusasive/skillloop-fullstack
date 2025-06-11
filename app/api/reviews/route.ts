import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getReviews, createReview, getSessionById } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');
    const targetId = searchParams.get('targetId');
    
    let filter: any = {};
    if (targetId) filter.targetId = targetId;
    
    const reviews = await getReviews(filter, limit, skip);
    
    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, reviewerId, targetId, rating, comment } = body;
    
    if (!sessionId || !reviewerId || !targetId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Validate session exists and is completed
    const session = await getSessionById(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    if (session.status !== 'completed') {
      return NextResponse.json(
        { error: 'Cannot review incomplete session' },
        { status: 400 }
      );
    }
    
    // Validate reviewer is part of the session
    if (session.tutorId !== reviewerId && session.learnerId !== reviewerId) {
      return NextResponse.json(
        { error: 'Only participants can review the session' },
        { status: 403 }
      );
    }
    
    // Validate target is the other participant
    if (session.tutorId !== targetId && session.learnerId !== targetId) {
      return NextResponse.json(
        { error: 'Target must be a session participant' },
        { status: 403 }
      );
    }
    
    // Create review
    const newReview = await createReview({
      id: uuidv4(),
      sessionId,
      reviewerId,
      targetId,
      rating,
      comment: comment || ''
    });
    
    return NextResponse.json({ review: newReview }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}
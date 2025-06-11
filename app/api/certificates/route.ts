import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCertificates, createCertificate, getSessionById } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');
    const recipientId = searchParams.get('recipientId');
    const issuerId = searchParams.get('issuerId');
    
    let filter: any = {};
    if (recipientId) filter.recipientId = recipientId;
    if (issuerId) filter.issuerId = issuerId;
    
    const certificates = await getCertificates(filter, limit, skip);
    
    return NextResponse.json({ certificates });
  } catch (error: any) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      sessionId, 
      recipientId, 
      issuerId, 
      skillName,
      tokenId,
      txHash, 
      metadataUri 
    } = body;
    
    if (!sessionId || !recipientId || !issuerId || !skillName || !tokenId || !txHash || !metadataUri) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
        { error: 'Cannot issue certificate for incomplete session' },
        { status: 400 }
      );
    }
    
    // Create certificate
    const newCertificate = await createCertificate({
      id: uuidv4(),
      sessionId,
      recipientId,
      issuerId,
      skillName,
      tokenId,
      txHash,
      metadataUri
    });
    
    return NextResponse.json({ certificate: newCertificate }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating certificate:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create certificate' },
      { status: 500 }
    );
  }
}
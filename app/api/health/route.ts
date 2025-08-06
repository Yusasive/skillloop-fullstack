import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: db ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
    };
    
    return NextResponse.json(health);
  } catch (error: any) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
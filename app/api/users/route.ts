import { NextRequest, NextResponse } from 'next/server';
import { getUsers, createUser, getUserByAddress } from '@/lib/db';
import { validateRequest, createUserSchema } from '@/lib/validation';
import { handleApiError } from '@/lib/error-handler';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');
    const skill = searchParams.get('skill');
    
    // Validate pagination parameters
    if (limit > 100) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 100' },
        { status: 400 }
      );
    }
    
    let filter = {};
    if (skill) {
      filter = { 'skills.name': skill };
    }
    
    const users = await getUsers(filter, limit, skip);
    
    return NextResponse.json({ users });
  } catch (error: any) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = validateRequest(createUserSchema, body);
    const { address, username, bio, avatar, skills, learning } = validatedData;
    
    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await getUserByAddress(address);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this wallet address already exists' },
        { status: 400 }
      );
    }
    
    const newUser = await createUser({
      address,
      username,
      bio,
      avatar,
      skills: skills || [],
      learning: learning || [],
    });
    
    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: any) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
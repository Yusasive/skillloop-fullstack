import { NextRequest, NextResponse } from 'next/server';
import { getUsers, createUser, getUserByAddress } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');
    const skill = searchParams.get('skill');
    
    let filter = {};
    if (skill) {
      filter = { 'skills.name': skill };
    }
    
    const users = await getUsers(filter, limit, skip);
    
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, username, bio, avatar, skills, learning } = body;
    
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
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
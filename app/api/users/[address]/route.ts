import { NextRequest, NextResponse } from 'next/server';
import { getUserByAddress, updateUser } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: any
) {
  try {
    const address = params.address;
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }
    
    const user = await getUserByAddress(address);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: any
) {
  try {
    const address = params.address;
    const body = await req.json();
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const existingUser = await getUserByAddress(address);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user
    const { username, bio, avatar, skills, learning } = body;
    const updates = {
      ...(username !== undefined && { username }),
      ...(bio !== undefined && { bio }),
      ...(avatar !== undefined && { avatar }),
      ...(skills !== undefined && { skills }),
      ...(learning !== undefined && { learning }),
    };
    
    const updatedUser = await updateUser(address, updates);
    
    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
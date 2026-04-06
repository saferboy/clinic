import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Decode the token (in production, verify JWT properly)
    const token = authHeader.substring(7);
    const decoded = JSON.parse(
      Buffer.from(token, 'base64').toString('utf-8')
    );

    return NextResponse.json(
      {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Get current user error:', error);
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
}

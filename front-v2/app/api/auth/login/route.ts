import { NextRequest, NextResponse } from 'next/server';

// Mock users database
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@clinic.com',
    password: 'admin123', // In production, use bcrypt
    role: 'admin',
  },
  {
    id: '2',
    name: 'Dr. Ahmed Hassan',
    email: 'doctor@clinic.com',
    password: 'doctor123',
    role: 'doctor',
  },
  {
    id: '3',
    name: 'Nurse Fatima',
    email: 'nurse@clinic.com',
    password: 'nurse123',
    role: 'nurse',
  },
  {
    id: '4',
    name: 'Receptionist Omar',
    email: 'receptionist@clinic.com',
    password: 'receptionist123',
    role: 'receptionist',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create a mock JWT token (in production, use a real JWT library)
    const token = Buffer.from(
      JSON.stringify({ userId: user.id, email: user.email, role: user.role })
    ).toString('base64');

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

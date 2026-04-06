import { NextRequest, NextResponse } from 'next/server';

// Mock services database
const mockServices = [
  {
    id: '1',
    name: 'Consultation',
    description: 'General medical consultation',
    price: 250,
    duration: 30,
    category: 'General',
  },
  {
    id: '2',
    name: 'Vaccination',
    description: 'Vaccination services',
    price: 150,
    duration: 15,
    category: 'Prevention',
  },
  {
    id: '3',
    name: 'Lab Tests',
    description: 'Laboratory tests and analysis',
    price: 500,
    duration: 60,
    category: 'Diagnostic',
  },
  {
    id: '4',
    name: 'Dental Checkup',
    description: 'Dental examination and cleaning',
    price: 200,
    duration: 45,
    category: 'Dental',
  },
  {
    id: '5',
    name: 'Physical Therapy',
    description: 'Physical therapy sessions',
    price: 300,
    duration: 60,
    category: 'Therapy',
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      { services: mockServices, total: mockServices.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Get services error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newService = {
      id: String(mockServices.length + 1),
      ...body,
    };

    mockServices.push(newService);

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('[API] Create service error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

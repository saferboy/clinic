import { NextRequest, NextResponse } from 'next/server';

// Mock clients database
const mockClients = [
  {
    id: '1',
    name: 'Ahmed Khan',
    email: 'ahmed@example.com',
    phone: '+974-4432-1234',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    bloodType: 'O+',
    address: 'Doha, Qatar',
    emergencyContact: 'Aisha Khan',
    emergencyPhone: '+974-4432-5678',
    medicalHistory: 'Diabetes',
    allergies: 'Penicillin',
    registrationDate: '2023-01-10',
  },
  {
    id: '2',
    name: 'Fatima Ali',
    email: 'fatima@example.com',
    phone: '+974-4432-2345',
    dateOfBirth: '1988-08-22',
    gender: 'female',
    bloodType: 'A+',
    address: 'Doha, Qatar',
    emergencyContact: 'Mohammed Ali',
    emergencyPhone: '+974-4432-6789',
    medicalHistory: 'Hypertension',
    allergies: 'None',
    registrationDate: '2023-02-15',
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    let filtered = [...mockClients];

    if (search) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(search.toLowerCase()) ||
          client.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json(
      { clients: filtered, total: filtered.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Get clients error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newClient = {
      id: String(mockClients.length + 1),
      ...body,
      registrationDate: new Date().toISOString().split('T')[0],
    };

    mockClients.push(newClient);

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('[API] Create client error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

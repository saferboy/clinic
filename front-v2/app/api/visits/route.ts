import { NextRequest, NextResponse } from 'next/server';

// Mock visits database
const mockVisits = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Ahmed Khan',
    doctorId: '2',
    doctorName: 'Dr. Ahmed Hassan',
    serviceId: '1',
    serviceName: 'Consultation',
    roomId: '1',
    roomName: 'Room 101',
    date: '2024-04-03',
    startTime: '09:30',
    endTime: '10:00',
    status: 'completed',
    notes: 'Patient presented with hypertension symptoms',
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Fatima Ali',
    doctorId: '2',
    doctorName: 'Dr. Ahmed Hassan',
    serviceId: '2',
    serviceName: 'Vaccination',
    roomId: '2',
    roomName: 'Room 102',
    date: '2024-04-03',
    startTime: '10:30',
    endTime: '11:00',
    status: 'confirmed',
    notes: 'Scheduled vaccination appointment',
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    let filtered = [...mockVisits];

    if (date) {
      filtered = filtered.filter((visit) => visit.date === date);
    }

    return NextResponse.json(
      { visits: filtered, total: filtered.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Get visits error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newVisit = {
      id: String(mockVisits.length + 1),
      ...body,
      status: 'confirmed',
    };

    mockVisits.push(newVisit);

    return NextResponse.json(newVisit, { status: 201 });
  } catch (error) {
    console.error('[API] Create visit error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

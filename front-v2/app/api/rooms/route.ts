import { NextRequest, NextResponse } from 'next/server';

// Mock rooms database
const mockRooms = [
  {
    id: '1',
    name: 'Room 101',
    type: 'consultation',
    capacity: 2,
    equipment: 'BP Monitor, Thermometer, Stethoscope',
    status: 'available',
    floor: 1,
  },
  {
    id: '2',
    name: 'Room 102',
    type: 'vaccination',
    capacity: 1,
    equipment: 'Medical Trolley, Vaccine Storage',
    status: 'available',
    floor: 1,
  },
  {
    id: '3',
    name: 'Lab 201',
    type: 'laboratory',
    capacity: 3,
    equipment: 'Blood Analyzer, Centrifuge, Microscope',
    status: 'available',
    floor: 2,
  },
  {
    id: '4',
    name: 'Dental Chair 1',
    type: 'dental',
    capacity: 1,
    equipment: 'Dental Chair, X-ray Machine, Suction',
    status: 'occupied',
    floor: 2,
  },
  {
    id: '5',
    name: 'Therapy Room',
    type: 'therapy',
    capacity: 2,
    equipment: 'Therapy Bed, Heat Lamp, Exercise Equipment',
    status: 'available',
    floor: 3,
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      { rooms: mockRooms, total: mockRooms.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Get rooms error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newRoom = {
      id: String(mockRooms.length + 1),
      ...body,
    };

    mockRooms.push(newRoom);

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('[API] Create room error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

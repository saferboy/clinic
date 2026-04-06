import { NextRequest, NextResponse } from 'next/server';

// Mock payments database
const mockPayments = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Ahmed Khan',
    amount: 250,
    method: 'card',
    status: 'completed',
    invoiceNumber: 'INV-2024-001',
    date: '2024-04-01',
    description: 'Consultation fee',
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Fatima Ali',
    amount: 150,
    method: 'cash',
    status: 'completed',
    invoiceNumber: 'INV-2024-002',
    date: '2024-04-02',
    description: 'Vaccination fee',
  },
  {
    id: '3',
    clientId: '1',
    clientName: 'Ahmed Khan',
    amount: 500,
    method: 'bank_transfer',
    status: 'pending',
    invoiceNumber: 'INV-2024-003',
    date: '2024-04-03',
    description: 'Lab tests',
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    let filtered = [...mockPayments];

    if (search) {
      filtered = filtered.filter(
        (payment) =>
          payment.clientName.toLowerCase().includes(search.toLowerCase()) ||
          payment.invoiceNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json(
      { payments: filtered, total: filtered.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Get payments error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newPayment = {
      id: String(mockPayments.length + 1),
      ...body,
      date: new Date().toISOString().split('T')[0],
    };

    mockPayments.push(newPayment);

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error('[API] Create payment error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

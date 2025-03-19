import { NextResponse } from 'next/server';
import { WhatsAppService } from '@/utils/whatsappService';

const whatsappService = new WhatsAppService();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerPhone, customerName, serviceDate, serviceTime } = body;

    // Send booking confirmation via WhatsApp
    await whatsappService.sendBookingConfirmation(
      customerPhone,
      customerName,
      serviceDate,
      serviceTime
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing booking:', error);
    return NextResponse.json(
      { error: 'Failed to process booking' },
      { status: 500 }
    );
  }
} 
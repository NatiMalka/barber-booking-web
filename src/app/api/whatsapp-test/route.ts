import { NextResponse } from 'next/server';
import { testWhatsAppConnection } from '@/utils/whatsappTest';

// Configure dynamic behavior for the API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('Starting WhatsApp test...');
    
    // Check environment variables
    const phoneNumberId = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN;
    
    console.log('Environment check:', {
      hasPhoneNumberId: !!phoneNumberId,
      hasAccessToken: !!accessToken
    });

    const result = await testWhatsAppConnection();
    console.log('Test completed:', result);
    
    if (!result.hasAccessToken || !result.phoneNumberId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Missing WhatsApp configuration',
          details: {
            hasAccessToken: result.hasAccessToken,
            hasPhoneNumberId: !!result.phoneNumberId
          }
        }
      }, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in WhatsApp test API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 
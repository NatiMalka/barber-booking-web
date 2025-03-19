import { WhatsAppService } from './whatsappService';

export async function testWhatsAppConnection() {
  const whatsappService = new WhatsAppService();
  let phoneNumberId: string | undefined;
  let hasAccessToken: boolean;
  
  try {
    // Log environment variables status
    phoneNumberId = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID;
    hasAccessToken = !!process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN;
    
    console.log('Testing WhatsApp connection with:', {
      phoneNumberId,
      hasAccessToken
    });

    // Send a test message using a simple text message
    // Note: The phone number should be in international format with country code
    const testPhoneNumber = '972549105131';
    
    // First try a simple text message
    const result = await whatsappService.sendMessage({
      to: testPhoneNumber,
      text: 'Test message from your barbershop booking system'
    });
    
    console.log('WhatsApp test successful:', result);
    return { 
      success: true, 
      result,
      phoneNumberId: phoneNumberId || '',
      hasAccessToken
    };
  } catch (error: any) {
    console.error('WhatsApp test failed:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message
    });
    
    // Convert error to a plain object for JSON serialization
    const errorObj = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name,
      response: {
        status: error?.response?.status,
        data: error?.response?.data
      }
    };
    
    return { 
      success: false, 
      error: errorObj,
      phoneNumberId: phoneNumberId || '',
      hasAccessToken: !!process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN
    };
  }
} 
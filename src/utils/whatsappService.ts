import axios from 'axios';

interface WhatsAppMessage {
  to: string;
  template_name?: string;
  language?: string;
  components?: any[];
  text?: string;
}

export class WhatsAppService {
  private readonly apiUrl: string;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  constructor() {
    this.apiUrl = 'https://graph.facebook.com/v19.0';
    this.accessToken = process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || '';
  }

  async sendMessage(message: WhatsAppMessage) {
    try {
      console.log('Sending WhatsApp message:', {
        to: message.to,
        hasTemplate: !!message.template_name,
        hasText: !!message.text
      });

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: message.to,
        type: message.template_name ? 'template' : 'text',
        ...(message.template_name
          ? {
              template: {
                name: message.template_name,
                language: {
                  code: message.language || 'en',
                },
                components: message.components,
              },
            }
          : {
              text: {
                preview_url: false,
                body: message.text,
              },
            }),
      };

      console.log('Request payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('WhatsApp API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      throw error;
    }
  }

  async sendBookingConfirmation(
    phoneNumber: string,
    customerName: string,
    serviceDate: string,
    serviceTime: string
  ) {
    return this.sendMessage({
      to: phoneNumber,
      template_name: 'booking_confirmation',
      language: 'he',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName },
            { type: 'text', text: serviceDate },
            { type: 'text', text: serviceTime },
          ],
        },
      ],
    });
  }

  async sendBookingReminder(
    phoneNumber: string,
    customerName: string,
    serviceDate: string,
    serviceTime: string
  ) {
    return this.sendMessage({
      to: phoneNumber,
      template_name: 'booking_reminder',
      language: 'he',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName },
            { type: 'text', text: serviceDate },
            { type: 'text', text: serviceTime },
          ],
        },
      ],
    });
  }
} 
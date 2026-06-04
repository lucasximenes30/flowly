import * as bizSdk from 'facebook-nodejs-business-sdk';

export class FacebookService {
  private static isInitialized = false;

  private static initialize() {
    if (this.isInitialized) return;

    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (!accessToken) {
      console.warn('FACEBOOK_ACCESS_TOKEN is not defined in environment variables.');
      return;
    }

    bizSdk.FacebookAdsApi.init(accessToken);
    this.isInitialized = true;
  }

  /**
   * Sends a standard or custom event to the Facebook Conversions API
   * @param eventName Name of the event (e.g., 'PageView', 'Lead', 'CompleteRegistration')
   * @param eventData Additional data for the event (e.g., email, phone, IP)
   * @param sourceUrl The URL where the event occurred
   */
  static async sendEvent(eventName: string, eventData: any = {}, sourceUrl?: string) {
    this.initialize();

    const pixelId = process.env.FACEBOOK_PIXEL_ID;
    if (!pixelId || !this.isInitialized) {
      console.warn('Facebook Pixel ID or Access Token is missing. Event will not be sent.');
      return;
    }

    const { ServerEvent, EventRequest, UserData, CustomData } = bizSdk;

    const userData = new UserData()
      .setEmails([eventData.email])
      .setPhones([eventData.phone])
      // Em um ambiente real, você deve passar o IP e User Agent reais do cliente
      .setClientIpAddress(eventData.clientIpAddress || '127.0.0.1')
      .setClientUserAgent(eventData.clientUserAgent || 'Mozilla/5.0');

    if (eventData.fbp) userData.setFbp(eventData.fbp);
    if (eventData.fbc) userData.setFbc(eventData.fbc);

    const customData = new CustomData()
      .setCurrency(eventData.currency || 'BRL')
      .setValue(eventData.value || 0.0);

    const serverEvent = new ServerEvent()
      .setEventName(eventName)
      .setEventTime(Math.floor(new Date().getTime() / 1000))
      .setUserData(userData)
      .setCustomData(customData)
      .setEventSourceUrl(sourceUrl || 'https://sua-url-padrao.com')
      .setActionSource('website');

    const eventsData = [serverEvent];
    const eventRequest = new EventRequest(pixelId, eventsData);

    try {
      const response = await eventRequest.execute();
      console.log(`Facebook CAPI Event '${eventName}' sent successfully.`, response);
      return response;
    } catch (error) {
      console.error(`Error sending Facebook CAPI Event '${eventName}':`, error);
      throw error;
    }
  }
}

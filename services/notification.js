
const SOLACE_CONFIG = require('../utils/solace_config');
const SmsIntegration = require('../utils/sms_integration');
const Dao = require('./dao');
const Notify = require('../models/notify');

/**
 * A class to handle notification from different channels
 *
 * @class
 */
class Notification {
  /**
   *
   * @param {object} data -- Contains data required to send otp code
   * @returns {object} -- returns object containing message and the status
   */
  async sendOTPCode(data) {
    const {message, phone, event} = data;


    try {
      // const response = {messageId: 'test_id', sent: true};

      const smsIntegration = new SmsIntegration({apiKey: SOLACE_CONFIG.SMS_API_KEY});
      const response = await smsIntegration.send( data); // uncomment this line when you want sms or messages to be sent
      const {messageId, sent} = response;

      console.log(message);

      const messageInfo = {message: message, messageId: messageId, sent: sent};
      const payload = {phone: phone, messageInfo: messageInfo, message_count: message.length, type: 'sms', event: event};
      const logged = await this.logNotification(payload);

      if ( logged ) return {message: 'sms sent', status: true};

      return {message: 'sms message not logged. ', status: false};
    } catch (e) {
      return {message: e.message, status: false};
    }
  }
  /**
   *
   * @param {object} payload -- data to be saved/logged
   * @returns {object} -- returns
   */
  async logNotification(payload) {
    const saved = await Dao.save( Notify, payload );
    return saved;
  }
}

module.exports = Notification;

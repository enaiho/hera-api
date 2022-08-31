
const {useHttpPost} = require('./http_integration');
const SOLACE_CONFIG = require('./solace_config');

/**
 * Class that handles SMS API Integration
 *
 * @class
 */
class SmsIntegration {
  /**
   *
   * @param {object} args -- args
   * @class
   */
  constructor( args ) {
    const {api_key} = args;
    this.api_key = api_key;
  }
  /**
   *
   * @param {object} params -- params
   * @returns {object} -- returns object
   */
  async send( params ) {
    const {message, phone} = params;
    const data = {'to': phone, 'from': 'N-Alert', 'sms': message, 'type': 'plain', 'api_key': `${this.api_key}`, 'channel': 'dnd'};
    const headers = {'headers': {'Content-Type': ['application/json', 'application/json']}};


    try {
      const postParams = {'url': SOLACE_CONFIG.SMS_API, 'data': data, 'headers': headers};
      const response = await useHttpPost( postParams );

      const {code, message_id} = response.data;


      if ( code === 'ok' ) return {messageId: message_id, sent: code};


      return {messageId: null, sent: 'not_ok'};
    } catch (e) {
      console.log(e.message);
      return false;
    }
  }
}


module.exports = SmsIntegration;

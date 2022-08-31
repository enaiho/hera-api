
/**
 * A class representing the activity message
 *
@class
 */
class ActivityMessage {
  /** @class */
  constructor() {
  }

  /**
   * @returns {string} -- Returns the description of the activity message for adding emergency contact
   * @param {string} name -- Represents the name of the user
   */
  static addContactMessageFactory(name) {
    return `${name}  added you to his emergency contact(s) .`;
  }

  /**
   * @returns {string} -- Returns the description of the activity message for deleting emergency contact
   * @param {string} name -- Represents the name of the user
   */
  static deleteContactMessageFactory(name) {
    return `${name} is no longer your dependent. `;
  }
}

module.exports = ActivityMessage;

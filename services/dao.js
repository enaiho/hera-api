/**
 * A class that represents every data related communication
 *
 * @class
 */
class Dao {
  /**
   *
   * @param {object} Model -- Name of the DataModelObject we would using to commit the data
   * @param {object} payload  -- Data to be committed
   * @returns {object} -- Returns the object of the saved document
   */
  static async save( Model, payload ) {
    const daoObject = new Model(payload);
    const saved = await daoObject.save();
    return saved;
  }
  /**
   *
   * @param {object} model -- Name of the DataModelObject we would using to commit the data
   * @param {object} payload -- Data to be commited
   * @returns {object} -- Returns the data
   */
  static async get( model, payload ) {
    if ( payload === null || payload === undefined || payload === '' ) payload = {};
    const data = await model.find(payload).exec();
    return data;
  }
  /**
   *
   * @param {object} model -- Name of the DataModelObject we would using to get the data
   * @param {object} payload -- Data to be committed
   * @param {object} populateParam -- Parameter to populate
   * @returns {object} -- Returns the data
   */
  static async getPopulate( model, payload, populateParam ) {
    const data = await model.find(payload).populate(populateParam);
    return data;
  }
  /**
   *
   * @param {object} model -- Name of the DataModelObject we would using to update the data
   * @param {object} updateCondition -- Object containing the update condition
   * @param {object} updateBody -- Object containing the data to be updated
   * @returns {object} -- Returns the data that was updated
   */
  static async updateOne(model, updateCondition, updateBody) {
    const update = await model.updateOne( updateCondition, updateBody );
    return update;
  }
  /**
   *
   * @param {object} model -- Name of the DataModelObject we would using to find and update the data
   * @param {object} updateCondition -- Object containing the update condition
   * @param {object} updateBody -- Object containing the data to be updated
   * @returns {object} -- Returns the data that was updated
   */
  static async findOneAndUpdate(model, updateCondition, updateBody) {
    const update = await model.findOneAndUpdate( updateCondition, updateBody );
    return update;
  }
}


module.exports = Dao;


/**
 * A class to save incident record
 *
 * @class
 */
class IncidentService {
  /** @class */
  constructor() {
  }
  /**
   *
   * @param {object} incidentParamResources -- Object that contains the parameters required to create incident
   * @returns {boolean} -- Returns boolean based on the creation of the incident
   */
  static async createIncident(incidentParamResources) {
    const {requestBody, models, dependencies} = incidentParamResources;
    const [IncidentOptions] = models;
    const [Dao] = dependencies;

    const saved = await Dao.save(IncidentOptions, requestBody);
    if ( saved ) return true;

    return false;
  }
  /**
   *
   * @param {object} incidentParamResources -- Object that contains the parameters required to get incidents
   * @returns {object} -- Returns the incidents  based on the parameters passed
   */
  static async getIncidents(incidentParamResources) {
    const {models, dependencies} = incidentParamResources;
    const [IncidentOptions] = models;
    const [Dao] = dependencies;

    return await Dao.get(IncidentOptions);
  }
}

module.exports = IncidentService;

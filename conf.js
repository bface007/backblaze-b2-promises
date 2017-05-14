const API_VERSION_URL = '/b2api/v1',
      API_URL = 'https://api.backblazeb2.com' + API_VERSION_URL,
      API_AUTHENTICATION_URL = API_URL + '/b2_authorize_account';

module.exports = {
  API_VERSION_URL: API_VERSION_URL,
  API_URL: API_URL,
  API_AUTHENTICATION_URL: API_AUTHENTICATION_URL,
  MAX_INFO_HEADERS: 10    // maximum number of custom x-bz-info-* headers
};
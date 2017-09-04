const API_VERSION_URL = '/b2api/v1',
      API_URL = 'https://api.backblazeb2.com' + API_VERSION_URL,
      API_AUTHENTICATION_URL = API_URL + '/b2_authorize_account';

module.exports = {
  API_VERSION_URL:            API_VERSION_URL,
  API_URL:                    API_URL,
  API_AUTHENTICATION_URL:     API_AUTHENTICATION_URL,
  API_CREATE_BUCKET_URL:      '/b2_create_bucket',
  API_DELETE_BUCKET_URL:      '/b2_delete_bucket',
  API_LIST_BUCKETS_URL:       '/b2_list_buckets',
  API_UPDATE_BUCKET_URL:      '/b2_update_bucket',
  API_GET_UPLOAD_URL:         '/b2_get_upload_url',
  API_START_LARGE_FILE:       '/b2_start_large_file',
  API_GET_UPLOAD_PART_URL:    '/b2_get_upload_part_url',
  API_FINISH_LARGE_FILE:      '/b2_finish_large_file',
  API_DOWNLOAD_FILE_BY_ID:    '/b2_download_file_by_id',
  FILE_DEFAULT_CONTENT_TYPE:  'b2/x-auto',
  MAX_INFO_HEADERS:         10    // maximum number of custom x-bz-info-* headers
};
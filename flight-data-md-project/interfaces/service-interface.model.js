class iServiceInterface {
  constructor(service) {
    this.client_id = service.client_id;
    this.client_app_name = service.clien_app_name;
    this.client_description = service.client_description;
    this.client_url = service.client_url;
    this.data_format = service.data_format;
    this.comunication_type = service.comunication_type;
    this.triggers = service.triggers;
    this.data = service.data;
  }
}

module.exports = iServiceInterface;
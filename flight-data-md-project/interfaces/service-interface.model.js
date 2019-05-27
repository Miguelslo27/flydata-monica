class iServiceInterface {
  constructor(service) {
    this.client_id = service.client_id;
    this.clien_app_name = service.clien_app_name;
    this.data_format = service.data_format;
    this.comunication_type = service.comunication_type;
    this.triggers = service.triggers;
    this.data = service.data;
  }
}

module.exports = iServiceInterface;
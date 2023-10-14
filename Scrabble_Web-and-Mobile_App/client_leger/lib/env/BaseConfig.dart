abstract class BaseConfig {
  String get serverURL;
}

class DevConfigEmu implements BaseConfig {

  @override
  String get serverURL => "http://10.0.2.2:3000";
}

class DevConfigTab implements BaseConfig {

  @override
  String get serverURL => "http://10.0.2.2";
}

class StagingConfig implements BaseConfig {

  @override
  String get serverURL => "http://ec2-99-79-50-28.ca-central-1.compute.amazonaws.com:3000";
}

class ProdConfig implements BaseConfig {

  @override
  String get serverURL => "http://ec2-15-222-9-242.ca-central-1.compute.amazonaws.com:3000";
}

import 'BaseConfig.dart';

class Environment {
  static final Environment _singleton = Environment._internal();

  factory Environment() {
    return _singleton;
  }
  Environment._internal();

  static const String DEVEMU = 'DEVEMU';
  static const String DEVTAB = 'DEVTAB';
  static const String STAG = 'STAG';
  static const String PROD = 'PROD';

  BaseConfig? config;

  initConfig(String environment) {
    config = _getConfig(environment);
  }

  BaseConfig _getConfig(String environment) {
    switch (environment) {
      case Environment.PROD:
        return ProdConfig();
      case Environment.STAG:
        return StagingConfig();
      case Environment.DEVTAB:
        return DevConfigTab();
      default:
        return DevConfigEmu();
    }
  }
}

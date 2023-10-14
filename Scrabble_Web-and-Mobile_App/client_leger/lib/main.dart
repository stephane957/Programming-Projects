import 'package:client_leger/screens/create_game_page.dart';
import 'package:client_leger/screens/game_list_page.dart';
import 'package:client_leger/screens/game_page.dart';
import 'package:client_leger/screens/home_page.dart';
import 'package:client_leger/screens/login_page.dart';
import 'package:client_leger/screens/ranked-init_page.dart';
import 'package:client_leger/screens/ranked_matchmaking_page.dart';
import 'package:client_leger/screens/signup_page.dart';
import 'package:client_leger/utils/theme.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'env/environment.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();


  const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: Environment.DEVEMU,
  );

  Environment().initConfig(environment);
  print(Environment().config?.serverURL);
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.landscapeRight,
    DeviceOrientation.landscapeLeft,
  ]);
  await EasyLocalization.ensureInitialized();
  runApp(EasyLocalization(
      supportedLocales: const [Locale('fr'), Locale('en')],
      path: 'assets/translations',
      startLocale: const Locale('fr'),
      useOnlyLangCode: true,
      child: MyApp()
  ),);
}

class MyApp extends StatefulWidget {

  @override
  _MyAppState createState() => _MyAppState();

  static _MyAppState? of(BuildContext context) => context.findAncestorStateOfType<_MyAppState>();
}

class _MyAppState extends State<MyApp> {

  ThemeData _theme = lightAppTheme;

  void changeTheme(String theme) {
    ThemeData newTheme = theme == 'light' ? lightAppTheme : darkAppTheme;
    setState(() {
      _theme = newTheme;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      localizationsDelegates: context.localizationDelegates,
      supportedLocales: context.supportedLocales,
      locale: context.locale,
      title: 'Scrabble',
      theme: _theme,
      routes: <String, WidgetBuilder>{
        '/home': (BuildContext context) => const MyHomePage(),
        '/login': (BuildContext context) => const LoginPage(),
        '/signup': (BuildContext context) => const SignUpPage(),
        '/create-game': (BuildContext context) => const CreateGamePage(),
        '/game': (BuildContext context) => const GamePage(),
        '/game-list': (BuildContext context) => const GameListPage(),
        '/ranked-init': (BuildContext context) => const RankedInitPage(),
        '/ranked-matchmaking': (BuildContext context) => const RankedMatchmakingPage(),
      },
      home: const LoginPage(),
    );
  }
}

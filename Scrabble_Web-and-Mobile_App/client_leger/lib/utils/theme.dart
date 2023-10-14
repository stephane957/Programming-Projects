import 'package:flutter/material.dart';

import 'utils.dart';

final lightAppTheme = ThemeData(
    primarySwatch: createMaterialColor(const Color(0xFF0c483f)),
    colorScheme: ColorScheme.fromSwatch().copyWith(
      primary: createMaterialColor(const Color(0xFF0c483f)),
      secondary: createMaterialColor(const Color(0xFFf5deb3)),
      tertiary: createMaterialColor(const Color(0xFF000000)),
    ),
    textTheme: TextTheme(
      headlineLarge: TextStyle(
        color: createMaterialColor(const Color(0xFF0c483f)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(
            width: 2,
            color: createMaterialColor(const Color(0xFF0c483f)),

          )
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(
            width: 2, color: createMaterialColor(const Color(0xFF0c483f))),
      ),
    ),
  canvasColor: createMaterialColor(const Color(0xFFf5deb3)),
);

final darkAppTheme = ThemeData(
    primarySwatch: createMaterialColor(const Color(0xFFf5deb3)),
    colorScheme: ColorScheme.fromSwatch().copyWith(
      primary: createMaterialColor(const Color(0xFFf5deb3)),
      secondary: createMaterialColor(const Color(0xFF0c483f)),
      tertiary: createMaterialColor(const Color(0xFFFFFFFF)),
    ),
    textTheme: TextTheme(
      headlineLarge: TextStyle(
        color: createMaterialColor(const Color(0xFFf5deb3)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(
            width: 2,
            color: createMaterialColor(const Color(0xFFf5deb3)),

          )
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(
            width: 2, color: createMaterialColor(const Color(0xFFf5deb3))),
      ),
    )
);


import 'package:flutter/material.dart';

ThemeData buildLightTheme() {
  final base = ThemeData(useMaterial3: true, colorSchemeSeed: Colors.indigo);
  return base.copyWith(
    textTheme: base.textTheme.apply(fontFamily: 'Roboto'),
    cardTheme: base.cardTheme.copyWith(
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
    appBarTheme: base.appBarTheme.copyWith(centerTitle: true),
  );
}

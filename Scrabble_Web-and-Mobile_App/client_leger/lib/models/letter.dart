class Letter {
  late String value;
  late num? weight;

  Letter() {
    value = '';
    weight = 0;
  }

  Map<String, dynamic> toJson() => {
    'weight': weight,
    'value': value
  };
}

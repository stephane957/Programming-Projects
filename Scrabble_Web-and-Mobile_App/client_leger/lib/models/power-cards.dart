class PowerCard {
  late String name;
  late bool isActivated;

  PowerCard({required this.name, required this.isActivated});

  PowerCard.fromJson(Map parsed){
    name = parsed["name"];
    isActivated = parsed["isActivated"];
  }
}

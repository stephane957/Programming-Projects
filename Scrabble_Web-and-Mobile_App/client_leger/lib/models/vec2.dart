class Vec2 {
  late num x;
  late num y;

  Vec2() {
    x = 0;
    y = 0;
  }

  Vec2.withParams(this.x, this.y);

  Vec2.fromJson(Map parsed) {
    x = parsed["x"];
    y = parsed["y"];
  }

  Map<String, dynamic> toJson() => {
    'x': x,
    'y': y,
  };
}

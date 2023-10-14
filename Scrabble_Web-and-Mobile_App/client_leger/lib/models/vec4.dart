class Vec4 {
  late num x1;
  late num y1;

  late num width;
  late num height;

  Vec4() {
    x1 = 0;
    y1 = 0;
    width = 0;
    height = 0;
  }

  Map<String, dynamic> toJson() => {
    'x1': x1,
    'y1': y1,
    'width': width,
    'height': height,
  };
}

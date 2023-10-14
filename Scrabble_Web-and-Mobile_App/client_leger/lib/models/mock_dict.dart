class MockDict {
  late String title;
  late String description;

  MockDict(this.title, this.description);

  MockDict.fromJson(dictionary){
    title = dictionary["title"];
    description = dictionary["description"];
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
    };
  }
}

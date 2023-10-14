import 'dart:convert';
import 'dart:ui';
import 'package:client_leger/services/users_controller.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';

import '../env/environment.dart';
import '../utils/utils.dart';

class SignUpPage extends StatelessWidget {
  const SignUpPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage("assets/background.jpg"),
                fit: BoxFit.cover,
              ),
            ),
            padding:
                const EdgeInsets.symmetric(vertical: 50.0, horizontal: 200.0),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.rectangle,
                  color: Theme.of(context).colorScheme.secondary,
                  borderRadius: const BorderRadius.all(Radius.circular(20.0)),
                  border: Border.all(
                      color: Theme.of(context).colorScheme.primary, width: 3),
                ),
                padding: const EdgeInsets.symmetric(
                    vertical: 25.0, horizontal: 250.0),
                child: const Center(
                  child: SignUpForm(),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }
}

class SignUpForm extends StatefulWidget {
  const SignUpForm({Key? key}) : super(key: key);

  @override
  State<SignUpForm> createState() => _SignUpFormState();
}

class _SignUpFormState extends State<SignUpForm> {
  final _formKey = GlobalKey<FormState>();
  String? email = "";
  String? username = "";
  String? password = "";
  String? avatarPath = "";
  Controller controller = Controller();
  late List<dynamic> avatars;
  final String? serverAddress = Environment().config?.serverURL;

  @override
  initState() {
    super.initState();
    http
        .get(
          Uri.parse("$serverAddress/avatar"),
        )
        .then((res) => parseAvatars(res));
  }

  parseAvatars(http.Response res) {
    var parsed = jsonDecode(res.body);
    avatars = parsed["data"] ?? "Failed";
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Text(
            "SIGN_UP_PAGE.SIGN_UP".tr(),
            style: Theme.of(context).textTheme.headlineLarge,
          ),
          const SizedBox(height: 30),
          TextFormField(
            onSaved: (String? value) {
              username = value;
            },
            validator: _usernameValidator,
            decoration: InputDecoration(
              border: const OutlineInputBorder(),
              labelText: "SIGN_UP_PAGE.USERNAME".tr(),
              labelStyle:
                  TextStyle(color: Theme.of(context).colorScheme.primary),
            ),
            style: TextStyle(color: Theme.of(context).colorScheme.primary),
          ),
          const SizedBox(height: 30),
          TextFormField(
            onSaved: (String? value) {
              email = value;
            },
            validator: _emailValidator,
            decoration: InputDecoration(
              border: const OutlineInputBorder(),
              labelText: "SIGN_UP_PAGE.EMAIL".tr(),
              labelStyle:
                  TextStyle(color: Theme.of(context).colorScheme.primary),
            ),
            style: TextStyle(color: Theme.of(context).colorScheme.primary),
          ),
          const SizedBox(height: 30),
          TextFormField(
            onSaved: (String? value) {
              password = value;
            },
            validator: _passwordValidator,
            obscureText: true,
            decoration: InputDecoration(
              border: const OutlineInputBorder(),
              labelText: "SIGN_UP_PAGE.PASSWORD".tr(),
              labelStyle:
                  TextStyle(color: Theme.of(context).colorScheme.primary),
            ),
            style: TextStyle(color: Theme.of(context).colorScheme.primary),
          ),
          TextButton(
            onPressed: () => showDialog<String>(
              context: context,
              builder: (BuildContext context) {
                return StatefulBuilder(
                  builder: (context, setState) {
                    return AlertDialog(
                      title: const Text('Avatar'),
                      content: Text("SIGN_UP_PAGE.SELECT_AVATAR_WANTED".tr()),
                      backgroundColor: Theme.of(context).colorScheme.secondary,
                      actions: <Widget>[
                        Container(
                          child: Column(
                            children: [
                              Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    avatarPicker(0),
                                    avatarPicker(2),
                                    avatarPicker(4),
                                    avatarPicker(6),
                                  ]),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  avatarPicker(1),
                                  avatarPicker(3),
                                  avatarPicker(5),
                                  avatarPicker(7),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    );
                  },
                );
              },
            ),
            child: Text("SIGN_UP_PAGE.SELECT_AVATAR".tr()),
          ),
          const SizedBox(height: 30),
          ElevatedButton(
            style: ButtonStyle(
              padding: MaterialStateProperty.all(
                const EdgeInsets.symmetric(vertical: 18.0, horizontal: 40.0),
              ),
              shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
              ),
            ),
            onPressed: _submit,
            child: Text(
              "SIGN_UP_PAGE.SIGN_UP".tr(),
              style: TextStyle(
                  fontSize: 20, color: Theme.of(context).colorScheme.secondary),
            ),
          ),
          const SizedBox(height: 30),
          GestureDetector(
            onTap: _toLoginPage,
            child: Text(
              "SIGN_UP_PAGE.GO_LOGIN_PAGE".tr(),
              style: TextStyle(color: Theme.of(context).colorScheme.primary),
            ),
          ),
        ],
      ),
    );
  }

  GestureDetector avatarPicker(int index) {
    return (GestureDetector(
        onTap: () {
          avatarPath = 'avatar${index + 1}';
          Navigator.pop(context);
        },
        child: getAvatarFromString(48, avatars[index]['uri'])));
  }

  String? _emailValidator(String? value) {
    if (value == null || value.isEmpty) {
      return "SIGN_UP_PAGE.ENTER_EMAIL".tr();
    } else if (!RegExp(
            r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+")
        .hasMatch(value)) {
      return "SIGN_UP_PAGE.ENTER_VALID_EMAIL".tr();
    } else {
      return null;
    }
  }

  String? _usernameValidator(String? value) {
    if (value == null || value.isEmpty) {
      return "SIGN_UP_PAGE.ENTER_USERNAME".tr();
    } else if (!RegExp(r'^[a-zA-Z0-9]+$').hasMatch(value)) {
      return "SIGN_UP_PAGE.ENTER_VALID_USERNAME".tr();
    } else if(value.length < 4){
      return "SIGN_UP_PAGE.MIN_USERNAME".tr();
    }else if(value.length > 20){
      return "SIGN_UP_PAGE.MAX_USERNAME".tr();
    }else {
      return null;
    }
  }

  String? _passwordValidator(String? value) {
    if (value == null || value.isEmpty) {
      return "SIGN_UP_PAGE.ENTER_PASSWORD".tr();
    } else {
      return null;
    }
  }

  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState?.save();
      try {
        if (avatarPath == '') {
          avatarPath = 'avatar1';
        }
        await controller.signUp(
            username: username,
            email: email,
            password: password,
            avatarPath: avatarPath);
        Navigator.pop(context);
      } on Exception {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text("SIGN_UP_PAGE.UNABLE_TO_CREATE_ACCOUNT".tr()),
          backgroundColor: Colors.red.shade300,
        ));
      }
    }
  }

  void _toLoginPage() {
    Navigator.of(context).pop();
  }
}

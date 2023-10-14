import 'package:flutter/cupertino.dart';

import '../services/timer.dart';

class RankedService extends ChangeNotifier{
  TimerService timerService = TimerService();
  bool isShowModal = false;
  late bool matchAccepted = false;

  static final RankedService _rankedService = RankedService._internal();

  factory RankedService() {
    return _rankedService;
  }

  RankedService._internal();


  matchHasBeenFound() {
    notifyListeners();
    matchAccepted= false;
    const timerTime = 0.25;
    isShowModal = true;
    timerService.startTimer(timerTime);
  }

  closeModal() {
    timerService.clearTimer();
    isShowModal = false;
    notifyListeners();
  }
}

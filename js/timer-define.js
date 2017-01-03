var timestopped;
var firstTime;
function CountDownTimer(seconds, minutes, hours, timerid, granularity) {
  seconds = seconds | 0;
  minutes = minutes | 0;
  hours = hours | 0;

  var duration = seconds + (hours*3600) + (minutes*60);

  this.timerid = timerid;

  this.duration = duration;
  this.granularity = granularity || 1000;
  this.tickFtns = [];
  this.running = false;
}

CountDownTimer.prototype.start = function() {
  if (this.running) {
    return;
  }
  this.running = true;
  var start = Date.now(),
      that = this,
      diff, obj;

  (function timer() {
    if(checkIfStopped(that.timerid) == "paused"){
      if(!firstTime || firstTime == 0){
        timestopped = Date.now();
        firstTime = 1;
      }
    } else if(checkIfStopped(that.timerid) == "start") {
      if(!timestopped){
        diff = that.duration - (((Date.now() - start) / 1000) | 0);
      } else {
        timedifference = (that.duration - (((timestopped - start) / 1000 | 0 )));
        diff = (that.duration - (((timestopped - start) / 1000) | 0)) + timedifference;
        firstTime = 0;
      }
    }
    if (diff > 0) {
      setTimeout(timer, that.granularity);
    } else {
      diff = 0;
      that.running = false;
      CountDownTimer.alarm();
      $('#' + that.timerid).addClass("alarm");
    }

    obj = CountDownTimer.parse(diff);
    that.tickFtns.forEach(function(ftn) {
      ftn.call(this, obj.hours, obj.minutes, obj.seconds);
    }, that);
  }());
};

CountDownTimer.prototype.onTick = function(ftn) {
  if (typeof ftn === 'function') {
    this.tickFtns.push(ftn);
  }
  return this;
};

CountDownTimer.prototype.expired = function() {
  return !this.running;
};

CountDownTimer.parse = function(seconds) {

  var minutes = (seconds / 60) % 60;
  var hours = seconds / 3600;
  return {
    'hours': hours | 0,
    'minutes': minutes | 0,
    'seconds': (seconds % 60) | 0,
  };
};

CountDownTimer.alarm = function(){
  $('#alarmAudio')[0].play();
};

CountDownTimer.prototype.stop = function(seconds, timerid) {
  if(seconds == 0 || seconds == null){
    $('#alarmAudio')[0].pause();
  } else {
  }
}

function checkIfStopped(timerid, timerstatenumber){
  if($('#' + timerid).attr("class") == "input-area running paused"){
    return "paused";
  } else if($('#' + timerid).attr("class") == "input-area running paused"){
    return "stillpaused";
  } else if($('#' + timerid).attr("class") == "input-area running")  {
    return "start";
  }
}

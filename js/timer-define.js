
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
  this.timestopped;
  this.firstTime;
  this.timedifference;
  var start = Date.now(),
      that = this,
      diff, obj;

  (function timer() {
    if(checkIfStopped(that.timerid) == "paused"){
      if(!that.firstTime || that.firstTime == 0){
        that.timestopped = Date.now();
        that.firstTime = 1;
        if(!that.timedifference){
          that.timedifference = 0;
        }
      }
      that.timedifference = that.timedifference + 1;
    } else if(checkIfStopped(that.timerid) == "start") {
      if(!that.timestopped){
        diff = that.duration - (((Date.now() - start) / 1000) | 0);
      } else {
        diff = (that.duration + that.timedifference) - (((Date.now() - start) / 1000) | 0);
        firstTime = 0;
      }
    }
    CountDownTimer.updateprogess(that.timerid, diff, that.duration);
    if (diff > 0) {
      setTimeout(timer, that.granularity);
    } else {
      if(!(that.duration == 0)){
        CountDownTimer.alarm();
        $('#' + that.timerid).addClass("alarm");
      }
      diff = 0;
      that.running = false;
    }

    obj = CountDownTimer.parse(diff);
    that.tickFtns.forEach(function(ftn) {
      ftn.call(this, obj.hours, obj.minutes, obj.seconds);
    }, that);
  }());
};

CountDownTimer.updateprogess = function(timerid, diff, total) {
  var progressbar = $('#' + timerid + ' > .progress > .progress-bar');
  progressbar.attr("aria-valuenow", diff);
  progressbar.attr("aria-valuemax", total);
  var percentage = 100 - (((total - diff) / total) * 100);
  progressbar.attr("style", "width:" + percentage + "%");
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
  if($('#' + timerid).hasClass("running paused")){
    return "paused";
  } else if($('#' + timerid).hasClass("running paused")){
    return "stillpaused";
  } else if($('#' + timerid).hasClass("running") && !($('#' + timerid).hasClass("paused"))){
    return "start";
  }
}

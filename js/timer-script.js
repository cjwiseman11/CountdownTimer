

window.onload = function () {

    $('.createNewTimer').on("click", function(){
      var timercount = getTimerCount();

      createNewTimer(timercount);
    });

    function createNewTimer(timercount){
      $('#' + (timercount)).after('<div id="' + (timercount + 1) + '" class="input-area"><input class="timer1-input" placeholder="Enter time"><button class="start-btn">Start</button><div>Countdown: <span class="timers timer' + (timercount + 1) + '">0</span> minutes!</div></div>');
    }

    function getTimerCount(){
      timerCount = 0;
      $('.timers').each(function(){
        timerCount++;
      });
      return timerCount;
    }

    function format(display) {
        return function (hours, minutes, seconds) {
            hours = hours < 10 ? "0" + hours : hours;
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            display.textContent = hours + ':' + minutes + ':' + seconds;
        };
    }

    $('body').on("click", ".start-btn", function(){
      var timerlength = $(this).parent().find('input').val();
      var timernumber = $(this).parent().attr("id");

      var display = document.querySelector('.timer' + timernumber);
      var timer = new CountDownTimer(timerlength);

      timer.onTick(format(display)).start();
    });
};

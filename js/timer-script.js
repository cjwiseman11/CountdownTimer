

window.onload = function () {

    function createNewTimer(timercount){
      $('#timer-' + (timercount)).after('<div id="timer-' + (timercount + 1) + '" class="input-area"><input name="hours" class="timer1-input" placeholder="Enter Hours"><input name="minutes" class="timer1-input" placeholder="Enter Minutes"><input name="seconds" class="timer1-input" placeholder="Enter Seconds"><button class="start-btn">Start</button><div>Countdown: <span class="timers timer-' + (timercount + 1) + '">00:00:00</span> minutes!</div></div>');
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

    $('.createNewTimer').on("click", function(){
      var timercount = getTimerCount();
      createNewTimer(timercount);
    });

    $('.startAllTimers').on("click", function(){
      $('.input-area > button').each(function(){
        if($(this).text() == "Start"){
          $(this).click();
        }
      });
    });

    $('.stopAllTimers').on("click", function(){
      $('.input-area > button').each(function(){
        if($(this).text() == "Stop"){
          $(this).click();
        }
      });
    });

    $('body').on("click", ".start-btn", function(){
      if($(this).parent().attr("class") == "input-area"){
        var seconds = $(this).parent().find('input[name=seconds]').val();
        var minutes = $(this).parent().find('input[name=minutes]').val();
        var hours = $(this).parent().find('input[name=hours]').val();

        var timernumber = $(this).parent().attr("id");

        $(this).parent().addClass("running");

        var display = document.querySelector('.' + timernumber);
        var timer = new CountDownTimer(seconds, minutes, hours, timernumber);
        timer.onTick(format(display)).start();
      }

      $(this).text("Stop");
      $(this).removeClass("start-btn");
      $(this).addClass("stop-btn");
      $(this).parent().removeClass("paused");
    });

    $('body').on("click", ".stop-btn", function(){
      $(this).text("Start");
      $(this).removeClass("stop-btn");
      $(this).addClass("start-btn");
      $(this).parent().addClass("paused");

      var timeRemaining = $(this).parent().find('.timer-countdown > span').text();
      var splitArray = timeRemaining.split(':');
      var seconds = ((splitArray[0] * 3600) | 0) + ((splitArray[1] * 60) | 0) + ((splitArray[2]) | 0);
      CountDownTimer.prototype.stop(seconds, $(this).parent().attr("id"));
    });

};



window.onload = function () {


    function createNewTimer(timercount){
      if($('#timer-' + (timercount + 1)).length > 0){
        timercount = timercount + 1;
      }
      $('.input-area:last').after('\
      <div id="timer-' + (timercount + 1) + '" class="input-area col-sm-6">\
        <h2>Timer ' + (timercount + 1) + ' <small><span class="glyphicon glyphicon-pencil changelabel"></span></small></h2>\
        <button type="button" class="save-timer">Save</button> <button type="button" class="delete-timer">delete</button>\
        <div class="input-group">\
          <input type="number" name="hours" class="timer' + (timercount + 1) + '-input form-control" placeholder="Hours">\
          <span class="input-group-addon">:</span>\
          <input type="number" name="minutes" class="timer' + (timercount + 1) + '-input form-control" placeholder="Minutes">\
          <span class="input-group-addon">:</span>\
          <input type="number" name="seconds" class="timer' + (timercount + 1) + '-input form-control" placeholder="Seconds">\
          <span class="input-group-btn">\
            <button type="button" class="start-btn btn btn-primary" disabled>Start</button>\
          </span>\
        </div>\
        <div class="super-timer-area text-center">\
          <br>\
          <span class="timers timer-' + (timercount + 1) + ' h3">00:00:00</span>\
        </div>\
        <p></p>\
        <div class="progress">\
          <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="00:30:00" style="width: 100%;">\
            <span class="sr-only">0% Complete</span>\
          </div>\
        </div>\
        <hr>\
      </div>');
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

    function getSavedTimers(){
      Object.keys(localStorage)
      .forEach(function(key){
           if (key.indexOf("savedtimer") >= 0) {
               var json = JSON.parse(localStorage.getItem(key));
               if(!($('#' + json.timerid).length)){
                 var timernumber = json.timerid.replace('timer-', "");
                 createNewTimer(timernumber - 1);
               }
               $('#' + json.timerid).children('.input-group').children('input[name=hours]').val(json.hours).trigger('change');
               $('#' + json.timerid).children('.input-group').children('input[name=minutes]').val(json.minutes).trigger('change');
               $('#' + json.timerid).children('.input-group').children('input[name=seconds]').val(json.seconds).trigger('change');
               $('#' + json.timerid).children('h2').html(json.label + ' <small><span class="glyphicon glyphicon-pencil changelabel"></span></small>');
               if(!(json.time == "notstarted")){
                 var timercontainer = $('#' + json.timerid);
                 timercontainer.addClass("running");
                 var timer = new CountDownTimer(json.seconds, json.minutes, json.hours, json.timerid, json.time);
                 var display = document.querySelector('.' + json.timerid);
                 timer.onTick(format(display)).start();
                 timercontainer.find('input').attr("disabled", "true");
             }
           }
       });
    }
    getSavedTimers();

    $('body').on("click", ".save-timer", function(){
      var json = new Object();
      json.timerid = $(this).parent().attr("id");
      json.hours = $(this).parent().children('.input-group').children('input[name=hours]').val();
      json.minutes = $(this).parent().children('.input-group').children('input[name=minutes]').val();
      json.seconds = $(this).parent().children('.input-group').children('input[name=seconds]').val();
      json.label = $(this).parent().children('h2').text();
      if($(this).parent().hasClass("running")){
        json.time = CountDownTimer.prototype.timestarted;
      } else {
        json.time = "notstarted";
      }
      localStorage.setItem('savedtimer-' + json.timerid, JSON.stringify(json));
    });

    $('body').on("click", ".delete-timer", function(){
      localStorage.removeItem('savedtimer-' + $(this).parent().attr("id"));
      $(this).parent().remove();
    });

    $('.createNewTimer').on("click", function(){
      var timercount = getTimerCount();
      createNewTimer(timercount);
    });

    $('.startAllTimers').on("click", function(){
      $('.input-group-btn > button').each(function(){
        if($(this).text() == "Start"){
          $(this).click();
        }
      });
    });

    $('.stopAllTimers').on("click", function(){
      $('.input-group-btn > button').each(function(){
        if($(this).text() == "Stop"){
          $(this).click();
        }
      });
    });

    $('.stopAlarms').on("click", function(){
      $('#alarmAudio')[0].pause();
    });

    $('body').on("click", ".start-btn", function(){
      var timercontainer = $(this).parent().parent().parent();

      if(!(timercontainer.hasClass("running"))){
        var seconds = timercontainer.find('input[name=seconds]').val();
        var minutes = timercontainer.find('input[name=minutes]').val();
        var hours = timercontainer.find('input[name=hours]').val();

        timercontainer.find('input').attr("disabled", "true");

        var timernumber = timercontainer.attr("id");

        timercontainer.addClass("running");

        var display = document.querySelector('.' + timernumber);
        var timer = new CountDownTimer(seconds, minutes, hours, timernumber, Date.now());
        timer.onTick(format(display)).start();
      }

      $(this).text("Stop");
      $(this).removeClass("start-btn");
      $(this).addClass("stop-btn");
      timercontainer.removeClass("paused");
      if(!(localStorage.getItem("savedtimer-" + timernumber) === null)){
        var json = JSON.parse(localStorage.getItem("savedtimer-" + timernumber));
        json.time = CountDownTimer.prototype.timestarted;
        json.seconds = seconds;
        json.minutes = minutes;
        json.hours = hours;
        json.label = timercontainer.children('h2').text();
        localStorage.setItem('savedtimer-' + json.timerid, JSON.stringify(json));
      }
    });

    $('body').on("click", ".stop-btn", function(){
      var timercontainer = $(this).parent().parent().parent();
      $(this).text("Start");
      $(this).removeClass("stop-btn");
      $(this).addClass("start-btn");
      timercontainer.addClass("paused");

      var timeRemaining = timercontainer.find('.super-timer-area > span').text();
      var splitArray = timeRemaining.split(':');
      var seconds = ((splitArray[0] * 3600) | 0) + ((splitArray[1] * 60) | 0) + ((splitArray[2]) | 0);
      if(seconds == 0 || seconds == null){
        $('#alarmAudio')[0].pause();
        timercontainer.removeClass("alarm");
      }
    });

    $('body').on("paste click change keyup", ".input-area > .input-group > input", function(){
      if($(this).val() != ""){
        $(this).parent().children("span.input-group-btn").children("button").attr("disabled", false);
      } else {
        $(this).parent().children("span.input-group-btn").children("button").attr("disabled", true);
      }
    });

    $('body').on("click", ".changelabel", function(){
      $(this).parent().parent().html("<input name='changelabel'><button class='save-button'>Save</button> ");
    });

    $('body').on("click", ".save-button", function(){
      var newlabel = $(this).parent().children("input").val();
      $(this).parent().html(newlabel + ' <small><span class="glyphicon glyphicon-pencil changelabel"></span></small>');
    });
};

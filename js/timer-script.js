$(function () {
  getLocalTimers() || createNewTimer();
});

$('.create-timer').on('click', function () {
  createNewTimer();
});

$('body').on('click', '.change-label', function () {
  $(this).closest('.timer-label-container').siblings('.change-label-container').show();
  $(this).closest('.timer-label-container').hide();
});

$('body').on('click', '.save-label', function () {
  var timerContainer = $(this).closest('.timer');
  var newlabel = timerContainer.find('.change-label-input').val();
  timerContainer.find('.timer-label-container .timer-label').text(newlabel);
  $(this).parent().hide();
  $(this).parent().siblings('.timer-label-container').show();
  storeTimer(timerContainer.attr('id'), null, null);
});

$('body').on('click', '.delete-timer', function () {
  var timerContainer = $(this).closest('.timer');
  var label = timerContainer.find('.timer-label').text();

  if (window.confirm('Are you sure you want to delete timer: ' + label)) {
    deleteTimer(timerContainer.attr('id'));
  }
});

$('body').on('click', '.start-stop-btn', function () {
  setTimerState($(this).closest('.timer').attr('id'));
});

$('.start-all').on('click', function () {
  $('.glyphicon-play').parent().click();
});

$('.stop-all').on('click', function () {
  $('.glyphicon-pause').parent().click();
});

$('.stop-alarms').on('click', function () {
  stopAllAlarms();
});

$('body').on('input', '.timer-input-section', function () {
  storeTimer($(this).closest('.timer').attr('id'));
});

$('body').on('click', '.reset-timer', function () {
  resetTimer($(this).closest('.timer').attr('id'));
});

function getLocalTimers() {
  var localLength = localStorage.length;

  if (!localLength) {
    return;
  }

  for (i = 0; i < localLength; i++) {
    var id = localStorage.key(i);
    var timerObject = JSON.parse(localStorage.getItem(id));
    createExistingTimer(id, timerObject);
  }
  return 'loaded';
}

function getHighestId() {
  var highest = 0;
  $('.timer').each(function() {
    var id = +$(this).attr('id').replace('timer-', '');
    if(id > highest) {
        highest = id;
    }
  });
  return highest;
}

function createNewTimer() {
  var latestId = $('.timer').length ? getHighestId() + 1 : 1;
  var timerHtml = $('#timer-template')
    .html()
    .replace(/{timer-id}/g, 'timer-' + latestId)
    .replace(/{timer-label}/, 'Timer ' + latestId)
    .replace(/{hours}/, '')
    .replace(/{minutes}/, '')
    .replace(/{seconds}/, '');

  $('.timers-container').append(timerHtml);
}

function createExistingTimer(timerId, timerObject) {
  var timerHtml = $('#timer-template')
    .html()
    .replace(/{timer-id}/g, timerId)
    .replace(/{timer-label}/, timerObject.label)
    .replace(/{hours}/, timerObject.hours)
    .replace(/{minutes}/, timerObject.minutes)
    .replace(/{seconds}/, timerObject.seconds);
  $('.timers-container').append(timerHtml);
  // Check if the timer was running and start accordingly
  if (timerObject.dateStarted && !timerObject.datePaused) {
    $('#' + timerId).attr('data-state', 'existing');
    setTimerState(timerId);
  } else if(timerObject.datePaused) {
    $('#' + timerId).attr('data-state', 'existing-paused');
    setTimerState(timerId); // This pauses the timer
  }
}

function storeTimer(timerId, dateStarted) {
  var thisTimer = '#' + timerId;

  thisTimerStored = {
    hours: $(thisTimer + ' input[name=hours]').val() | 0,
    minutes: $(thisTimer + ' input[name=minutes]').val() | 0,
    seconds: $(thisTimer + ' input[name=seconds]').val() | 0,
    dateStarted: dateStarted,
    label: $(thisTimer + ' .timer-label').text()
  };

  localStorage.setItem(timerId, JSON.stringify(thisTimerStored));
}

function startTimer(timerId, countdownFrom, dateStarted) {
  var duration = countdownFrom.seconds + countdownFrom.hours * 3600 + countdownFrom.minutes * 60;
  var dateNow = Date.now();
  var diff = duration - (((dateNow - dateStarted) / 1000) | 0);
  
  if (diff <= 0) {
    diff = 0;
    timerAlarm(timerId);
  }
  
  setTimeDisplay(timerId, diff, duration);

  if (duration) {
    var timerInterval = setInterval(function () {
      diff = duration - (((Date.now() - dateStarted) / 1000) | 0);

      if (diff <= 0) {
        diff = 0;
        clearInterval(timerInterval);
        timerAlarm(timerId);
      }

      setTimeDisplay(timerId, diff, duration);

    }, 1000);    
  } else {
    // Count up from 0 if no duration is set
    var timerInterval = setInterval(function () {
      duration++;
      setTimeDisplay(timerId, duration);
    }, 1000);
  }
  $('#' + timerId).attr('data-interval', timerInterval);
  storeTimer(timerId, dateStarted);
}

function setTimeDisplay(timerId, diff, duration) {
  var hours = (diff / 3600) | 0;
  hours = hours < 10 ? '0' + hours : hours;

  var minutes = (diff / 60) % 60 | 0;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  var seconds = diff % 60 | 0;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  $('#' + timerId + ' .hours').text(hours);
  $('#' + timerId + ' .minutes').text(minutes);
  $('#' + timerId + ' .seconds').text(seconds);

  $('#' + timerId + ' .progress-bar').attr('aria-valuenow');

  $('#' + timerId + ' .progress-bar').attr('aria-valuenow', duration);

  var percentage = ((diff / duration) * 100).toFixed(2);
  $('#' + timerId + ' .progress-bar').css('width', percentage + '%');
  $('#' + timerId + ' .progress-bar').attr('aria-valuenow', percentage);
}

function setTimerState(timerId) {
  switch($('#' + timerId).attr('data-state')) {
    case 'running': // Pause
      $('#' + timerId).attr('data-state', 'paused');
      $('#' + timerId + ' .start-stop-btn span').removeClass('glyphicon-pause').addClass('glyphicon-play');
      $('#' + timerId + ' .reset-timer').attr('disabled', false);
      clearInterval($('#' + timerId).attr('data-interval'));
      var storedTimer = JSON.parse(localStorage.getItem(timerId));
      storedTimer.datePaused = Date.now();
      localStorage.setItem(timerId, JSON.stringify(storedTimer));
      break;
    case 'paused': // Continue
      $('#' + timerId).attr('data-state', 'running');
      $('#' + timerId + ' .start-stop-btn span').removeClass('glyphicon-play').addClass('glyphicon-pause');
      $('#' + timerId + ' .reset-timer').attr('disabled', 'true');
      var storedTimer = JSON.parse(localStorage.getItem(timerId));
      var newStartedDate = storedTimer.dateStarted + ((Date.now() - storedTimer.datePaused) | 0);
      startTimer(timerId, storedTimer, newStartedDate);
      storedTimer.datePaused = null;
      storedTimer.dateStarted = newStartedDate;
      localStorage.setItem(timerId, JSON.stringify(storedTimer));
      break;
    case 'existing': // rebuild and start timer
      $('#' + timerId).attr('data-state', 'running');
      $('#' + timerId + ' .start-stop-btn span').removeClass('glyphicon-play').addClass('glyphicon-pause');
      $('#' + timerId + ' input:not(.change-label-input)').attr('disabled', 'true');
      var storedTimer = JSON.parse(localStorage.getItem(timerId));
      startTimer(timerId, storedTimer, storedTimer.dateStarted);
      break;
    case 'existing-paused': // rebuild and pause timer
      var storedTimer = JSON.parse(localStorage.getItem(timerId));
      var duration = storedTimer.seconds + storedTimer.hours * 3600 + storedTimer.minutes * 60;
      var diff = duration - (((storedTimer.datePaused - storedTimer.dateStarted) / 1000) | 0);
      
      setTimeDisplay(timerId, diff, duration);
      $('#' + timerId).attr('data-state', 'paused');
      $('#' + timerId + ' input:not(.change-label-input)').attr('disabled', 'true');
      $('#' + timerId + ' .reset-timer').attr('disabled', false);
      break;     
    default: // Start
      $('#' + timerId).attr('data-state', 'running');  
      $('#' + timerId + ' .start-stop-btn span').removeClass('glyphicon-play').addClass('glyphicon-pause');
      $('#' + timerId + ' input:not(.change-label-input)').attr('disabled', 'true');
      var countdownFrom = {
        seconds: $('#' + timerId + ' input[name=seconds]').val() | 0,
        minutes: $('#' + timerId + ' input[name=minutes]').val() | 0,
        hours: $('#' + timerId + ' input[name=hours]').val() | 0
      };
      startTimer(timerId, countdownFrom, Date.now());
  }
}

function resetTimer(timerId) {
  $('#' + timerId).removeClass('alarm').removeClass('paused');
  $('#' + timerId + ' .stop-btn').text('Start').removeClass('stop-btn').addClass('start-btn');
  $('#' + timerId + ' input:not(.change-label-input)').attr('disabled', false);
  $('#' + timerId + ' .reset-btn').remove();
  var storedTimer = JSON.parse(localStorage.getItem(timerId));
  storedTimer.dateStarted = null;
  storedTimer.datePaused = null;
  $('#' + timerId).attr('data-state', '');
  setTimeDisplay(timerId, 0, 0);
  localStorage.setItem(timerId, JSON.stringify(storedTimer));
}

function deleteTimer(timerId) {
  localStorage.removeItem(timerId);
  $('#' + timerId).remove();
}

function timerAlarm(timerId) {
  $('#' + timerId).addClass('alarm').removeClass('running');
  // Add sound
}

function stopAllAlarms() {
  $('.alarm').removeClass('alarm');
}

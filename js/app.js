/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
    var timerUpdateDate = 0,
        flagConsole = false,
        flagDigital = false,
        battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery,
        interval,
        BACKGROUND_URL = "url('./images/bg.jpg')",
        BACKGROUND_URL_NIGHT = "url('./images/bg_night.jpg')",
        arrDay = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
        arrMonth = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"];

    /**
     * Updates the date and sets refresh callback on the next day.
     * @private
     * @param {number} prevDay - date of the previous day
     */
    function updateDate(prevDay) {
        var datetime = tizen.time.getCurrentDateTime(),
            nextInterval,
            strDay = document.getElementById("str-day"),
            strFullDate,
            getDay = datetime.getDay(),
            getDate = datetime.getDate(),
            getMonth = datetime.getMonth();

        // Check the update condition.
        // if prevDate is '0', it will always update the date.
        if (prevDay !== null) {
            if (prevDay === getDay) {
                /**
                 * If the date was not changed (meaning that something went wrong),
                 * call updateDate again after a second.
                 */
                nextInterval = 1000;
            } else {
                /**
                 * If the day was changed,
                 * call updateDate at the beginning of the next day.
                 */
                // Calculate how much time is left until the next day.
                nextInterval =
                    (23 - datetime.getHours()) * 60 * 60 * 1000 +
                    (59 - datetime.getMinutes()) * 60 * 1000 +
                    (59 - datetime.getSeconds()) * 1000 +
                    (1000 - datetime.getMilliseconds()) +
                    1;
            }
        }

        if (getDate < 10) {
            getDate = "0" + getDate;
        }

        strFullDate = arrDay[getDay] + " " + getDate + " " + arrMonth[getMonth];
        strDay.innerHTML = strFullDate;

        // If an updateDate timer already exists, clear the previous timer.
        if (timerUpdateDate) {
            clearTimeout(timerUpdateDate);
        }

        // Set next timeout for date update.
        timerUpdateDate = setTimeout(function() {
            updateDate(getDay);
        }, nextInterval);
    }


    /**
     * Updates the current time.
     * @private
     */
    function updateTime() {
        var strHours = document.getElementById("str-hours"),
            strConsole = document.getElementById("str-console"),
            strMinutes = document.getElementById("str-minutes"),
            datetime = tizen.time.getCurrentDateTime(),
            hour = datetime.getHours(),
            minute = datetime.getMinutes();

        strHours.innerHTML = hour;
        strMinutes.innerHTML = minute;

        if (hour < 10) {
            strHours.innerHTML = "0" + hour;
        }

        if (minute < 10) {
            strMinutes.innerHTML = "0" + minute;
        }

        // Each 0.5 second the visibility of flagConsole is changed.
        if(flagDigital) {
            if (flagConsole) {
                strConsole.style.visibility = "visible";
                flagConsole = false;
            } else {
                strConsole.style.visibility = "hidden";
                flagConsole = true;
            }
        }
        else {
            strConsole.style.visibility = "visible";
            flagConsole = false;
        }
    }

    /**
     * Sets to background image as BACKGROUND_URL,
     * and starts timer for normal digital watch mode.
     * @private
     */
    function initDigitalWatch() {
        flagDigital = true;
        const hours = new Date().getHours();
        document.getElementById("bg").style.backgroundImage = hours > 6 && hours < 21 ? BACKGROUND_URL : BACKGROUND_URL_NIGHT;
        document.getElementById('digital-body').classList = hours > 6 && hours < 21 ? '' : 'night';
        interval = setInterval(updateTime, 500);
    }

    /**
     * Clears timer and sets background image as none for ambient digital watch mode.
     * @private
     */
    function ambientDigitalWatch() {
        flagDigital = false;
        clearInterval(interval);
        document.getElementById("bg").style.backgroundImage = "none";
        updateTime();
    }

    /**
     * Updates watch screen. (time and date)
     * @private
     */
    function updateWatch() {
        updateTime();
        updateDate(0);
    }

    function bindBattery(battery) {
        battery.addEventListener("chargingchange", getBatteryState);
        battery.addEventListener("chargingtimechange", getBatteryState);
        battery.addEventListener("dischargingtimechange", getBatteryState);
        battery.addEventListener("levelchange", getBatteryState);
        
        function getBatteryState() {
            var batteryLevel = Math.floor(battery.level * 10),
                batteryFill = document.getElementById("battery-fill");

            batteryLevel = batteryLevel + 1;
            batteryFill.style.width = batteryLevel + "%";
        }
    }

    /**
     * Binds events.
     * @private
     */
    function bindEvents() {
        
        //battery status for chrome
        if (!battery) {
            navigator.getBattery().then(bindBattery);
        } else {
            bindBattery(battery);
        }
       
        // add eventListener for battery state

        // add eventListener for timetick
        window.addEventListener("timetick", function() {
            ambientDigitalWatch();
        });

        // add eventListener for ambientmodechanged
        window.addEventListener("ambientmodechanged", function(e) {
            if (e.detail.ambientMode === true) {
                // rendering ambient mode case
                ambientDigitalWatch();

            } else {
                // rendering normal digital mode case
                initDigitalWatch();
            }
        });

        // add eventListener to update the screen immediately when the device wakes up.
        document.addEventListener("visibilitychange", function() {
            if (!document.hidden) {
                updateWatch();
            }
        });

        // add event listeners to update watch screen when the time zone is changed.
        // tizen.time.setTimezoneChangeListener(function() {
        //     updateWatch();
        // });
    }

    /**
     * Initializes date and time.
     * Sets to digital mode.
     * @private
     */
    function init() {
        initDigitalWatch();
        updateDate(0);

        bindEvents();
        enableNFC();
    }
    
    window.onload = init();
}());

var circle = document.getElementById("circle-white");
var circle2 = document.getElementById("circle-lightblue");
var circle3 = document.getElementById("circle-blue");
var radius = circle.r.baseVal.value;
var circumference = radius * 2 * Math.PI;
var radius2 = circle2.r.baseVal.value;
var circumference2 = radius2 * 2 * Math.PI;
var radius3 = circle3.r.baseVal.value;
var circumference3 = radius3 * 2 * Math.PI;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = `${circumference}`;
circle2.style.strokeDasharray = `${circumference2} ${circumference2}`;
circle2.style.strokeDashoffset = `${circumference2}`;
circle3.style.strokeDasharray = `${circumference3} ${circumference3}`;
circle3.style.strokeDashoffset = `${circumference3}`;

function setProgress(percent) {
  const offset = circumference - percent / 100 * circumference;
  const offset2 = circumference2 - percent / 100 * circumference2;
  const offset3 = circumference3 - percent / 100 * circumference3;
  circle.style.strokeDashoffset = offset;
  circle2.style.strokeDashoffset = offset2;
  circle3.style.strokeDashoffset = offset3;
}

var currentChrono = false;
function setChrono(goalTime, next) {
    if (!goalTime) {
        clearChrono();
        return;
    }
    setProgress(100);
    createChrono(goalTime, next);
}

var chronohtml = document.getElementById("chrono");
var resphtml = document.getElementById("tram-schedule");
var nexthtml = document.getElementById("tram-schedule-next");
function clearChrono() {
    setProgress(0);
    chronohtml.style.display = 'none';
    resphtml.innerHTML = '';
    nexthtml.innerHTML = '';
    clearInterval(currentChrono);
}

function createChrono(goalTime, nextGoalTime) {
    
    chronohtml.style.display = 'block';
    var dt = new Date();
    var start = dt.getSeconds() + (60 * (dt.getMinutes() + (60 * dt.getHours())));
    var total = goalTime - start;

    currentChrono = setInterval(function() {
        var dt = new Date();
        var current = dt.getSeconds() + (60 * (dt.getMinutes() + (60 * dt.getHours())));
        if (current > goalTime) {
            clearChrono();
            return;
        }

        var elapsedTime = goalTime - current;
        var minutes = Math.floor(elapsedTime / 60);
        var seconds = elapsedTime - minutes * 60;
        resphtml.innerHTML = minutes + ":" + (seconds < 10 ? '0' + seconds : seconds);

        if (nextGoalTime) {
            var elapsedNextTime = nextGoalTime - current;
            var minutesToNext = Math.floor(elapsedNextTime / 60);
            nexthtml.innerHTML =  minutesToNext;
        }

        var progress = 100 - ((total - elapsedTime)) * 100 / total;
        setProgress(progress);
    }, 1000);
}

function getTramSchedule() {
    var button = document.getElementById("get-tram");
    button.style.visibility = 'hidden';
    setTimeout(function() {
        button.style.visibility = 'visible';
    }, 3000);

    setChrono(false);
    fetch('https://data.mobilites-m.fr/api/routers/default/index/stops/SEM:3218/stoptimes/')
      .then(
        function(response) {
            response.json().then(function (json) {
                if (json.length === 0) {
                    var error = document.getElementById("error");
                    error.innerHTML = "Plus de trams";
                    setTimeout(function() {
                        error.innerHTML = "";
                    }, 5000);
                    return;
                }
                setChrono(json[0].times[0].realtimeArrival, json[0].times[1] ? json[0].times[1].realtimeArrival : null);
            });
        }
      );
}

function showQR() {
    var qrcode = document.getElementById("qrcodecontainer");
    qrcode.style.display = "block";
    var tm = setTimeout(function() {
        qrcode.style.display = "none";
    }, 10000)
    qrcode.addEventListener('click', function (event) {
        clearTimeout(tm);
        qrcode.style.display = "none";
    }, false);
}

function enableNFC() {
    // var nfcSwitchAppControl = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/setting/nfc');
    // var adapter = tizen.nfc.getDefaultAdapter();
}
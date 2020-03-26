// counters for coronavirus tracker
// michaelpeterswa

import { CountUp } from '/ext/countUp.min.js'

var webSocket = new WebSocket("ws://localhost:6977");

function onRecieved(){
    webSocket.onmessage = function (event) {
        var rec_data = JSON.parse(event.data);
        
        var countUp1 = new CountUp('king_targeted', rec_data[0]);
        countUp1.start();

        var countUp2 = new CountUp('wa_targeted', rec_data[1]);
        countUp2.start();

        var countUp3 = new CountUp('us_targeted', rec_data[2]);
        countUp3.start();

        var countUp4 = new CountUp('world_targeted', rec_data[3]);
        countUp4.start();
      }
}



window.onload = function() {
    onRecieved()
  };
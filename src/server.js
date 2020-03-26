// coronavirus tracker
// michaelpeterswa

//-----------------------------
//  Definitions
//-----------------------------

const express = require('express')
const cors = require('cors')
var path = require('path')
const axios = require('axios')
const csv2json = require('csvjson-csv2json')
const WebSocket = require('ws')

const app = express()
const wss = new WebSocket.Server({port: 6977})

const port = 6976

var d = new Date()
var day = d.getDate()
var month = d.getMonth()
var year = d.getFullYear()

month = month + 1

day = add0(day)
month = add0(month)

url = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${month}-${day}-${year}.csv`

//-----------------------------
// Helper/Parse Functions
//-----------------------------

function add0(val) {
  if(val < 10){
    val = "0" + String(val)
  }
  return val
}

async function getData() {
  try {
    const response = await axios.get(url)
    var json_data = csv2json(response.data, {parseNumbers: true})
    return json_data
  } catch (error) {
    console.error(error);
  }
}

function getKingTotal(data) {
  var king_total = 0
  for (let index = 0; index < data.length; index++) {
    if(data[index].Admin2 != ""){
      if(data[index].Admin2 == "King"){
        if(data[index].Province_State == "Washington"){
          king_total = data[index].Confirmed
        }
      } 
    }
  }
  return king_total
}

function getWATotal(data) {
  var wa_total = 0
  for (let index = 0; index < data.length; index++) {
    if(data[index].Admin2 != ""){
      if(data[index].Province_State == "Washington"){
        wa_total += data[index].Confirmed
      } 
    }
  }
  return wa_total
}

function getUSTotal(data) {
  var us_total = 0
  for (let index = 0; index < data.length; index++) {
    if(data[index].Country_Region == "US"){
      us_total += data[index].Confirmed
    }
  }
  return us_total
}

function getWorldTotal(data) {
  var world_total = 0
  for (let index = 0; index < data.length; index++) {
    world_total += data[index].Confirmed
  }
  return world_total
}

function Totals(local, state, country, world) {
  this.local = local;
  this.state = state;
  this.country = country;
  this.world = world;
}

function getAllTotals(data){
  var dataUnformatted = new Totals(getKingTotal(data), getWATotal(data), getUSTotal(data), getWorldTotal(data))

  var dataToSend = [dataUnformatted.local, dataUnformatted.state, dataUnformatted.country, dataUnformatted.world]
  wss.on('connection', function connection(ws) {
    ws.send(JSON.stringify(dataToSend));
  })
  
}

//-----------------------------
//  Main Function Call
//-----------------------------

getData().then(function(value){
  getAllTotals(value);
})

//-----------------------------
//  Express Functions
//-----------------------------

app.use(cors());

app.get('/', function(req, res) {
  res.status(200).sendFile(path.join(__dirname + '/../html/index.html'));
});

app.get('/styles/styles.css', function(req, res) {
  res.sendFile(path.join(__dirname + '/../html/styles/styles.css'));
  //console.log("sending css");
});

app.get('/count.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/../html/count.js'));
  //console.log("sending css");
});

app.get('/ext/countUp.min.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/../html/ext/countUp.min.js'));
});

app.use(function (req, res) {
  res.status(404).sendFile(path.join(__dirname + '/../html/404.html'));
  res.status(404).sendFile(path.join(__dirname + '/../html/styles/styles.css'));
})

const server = app.listen(port, () => console.log(`corona app listening on port ${port}!\n`))

module.exports = server

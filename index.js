const express = require('express')
const https = require("https");

const username = "user1";
const password = "password";
const serialNumber = "OSR1522003302";

var authToken = "";


function createOptions() {
    const options = {
        protocol: "https:",
        host: '192.168.15.142',
        port: 8443,
        //path: '/devices',
        //method: 'GET',
        //headers: { "Authorization": authToken },
        rejectUnauthorized: false
    };

    return options;
}


function httpRequest(opts, func, data) {
    const req = https.request(opts, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            if (func != null) {
                func(chunk);
            }
        });
    });

    if (data != null) {
        req.write(data);
    }

    req.end();
}


function processLoginResponse(data) {
    authToken = JSON.parse(data)['securityToken'];
}


//curl -vk 'https://192.168.15.142:8443/session' -d '{"username" : "user1", "password" : "password", "serialNumber" : "OSR1522003302"}' -H 'Content-Type: Application/Json'
function login() {
    const loginOpts = createOptions();
    loginOpts.path = '/session';
    loginOpts.method = 'POST';
    const data = '{"username" : "' + username + '", "password" : "' + password + '", "serialNumber" : "' + serialNumber + '"}';
    loginOpts.headers = {
        'Content-Type': 'Application/Json',
        'Content-Length': data.length
    }

    httpRequest(loginOpts, processLoginResponse, data);
}


// curl -vk 'https://192.168.15.142:8443/devices' -H 'Authorization: 2624593743756043217043494512099'
function statusDevices(func) {
    const statusOpts = createOptions();
    statusOpts.path = '/devices';
    statusOpts.method = 'GET';
    statusOpts.headers = { "Authorization": authToken };

    httpRequest(statusOpts, func);
}


//curl -vk 'https://192.168.15.142:8443/devices/1' -H 'Authorization: 2624593743756043217043494512099'
function statusDevice(index) {
    const statusOpts = createOptions();
    statusOpts.path = '/devices/' + index;
    statusOpts.method = 'GET';
    statusOpts.headers = { "Authorization": authToken };

    httpRequest(statusOpts);
}


//curl -vk 'https://192.168.15.142:8443/device/set?idx=1&onoff=1' -H 'Authorization: 2624593743756043217043494512099'
function turnOnDevice(deviceIndex) {
    const turnOnOpts = createOptions();
    turnOnOpts.path = '/device/set?onoff=1&idx=' + deviceIndex;
    turnOnOpts.method = 'GET';
    turnOnOpts.headers = { "Authorization": authToken };

    httpRequest(turnOnOpts);
}


//curl -vk 'https://192.168.15.142:8443/device/set?idx=1&onoff=0' -H 'Authorization: 2624593743756043217043494512099'
function turnOffDevice(deviceIndex) {
    const turnOffOpts = createOptions();
    turnOffOpts.path = '/device/set?onoff=0&idx=' + deviceIndex;
    turnOffOpts.method = 'GET';
    turnOffOpts.headers = { "Authorization": authToken };

    httpRequest(turnOffOpts);
}


//curl -vk 'https://192.168.15.142:8443/device/all/set?onoff=1' -H 'Authorization: 2624593743756043217043494512099'
function turnOnDevices() {
    const turnOnOpts = createOptions();
    turnOnOpts.path = '/device/all/set?onoff=1';
    turnOnOpts.method = 'GET';
    turnOnOpts.headers = { "Authorization": authToken };

    httpRequest(turnOnOpts);
}


//curl -vk 'https://192.168.15.142:8443/device/all/set?onoff=0' -H 'Authorization: 2624593743756043217043494512099'
function turnOffDevices() {
    const turnOffOpts = createOptions();
    turnOffOpts.path = '/device/all/set?onoff=0';
    turnOffOpts.method = 'GET';
    turnOffOpts.headers = { "Authorization": authToken };

    httpRequest(turnOffOpts);
}


//curl -vk 'https://192.168.15.142:8443/session' -H 'Authorization: 2624593743756043217043494512099' -X DELETE
function logout() {
    const logoutOpts = createOptions();
    logoutOpts.path = '/session';
    logoutOpts.method = 'DELETE';
    logoutOpts.headers = { "Authorization": authToken };

    httpRequest(logoutOpts);
}


function setupExpress() {
    const app = express()

    app.get('/status', function (req, res) {
        statusDevices(function(restResp) {
            res.send(restResp);
        });
    })

    app.post('/on/:index', function(req, res) {
        if (req.params.index == 'all') {
            turnOnDevices();
        } else {
            turnOnDevice(req.params.index);
        }

        res.end();
    })

    app.post('/off/:index', function(req, res) {
        if (req.params.index == 'all') {
            turnOffDevices();
        } else {
            turnOffDevice(req.params.index);
        }

        res.end();
    })

    app.use(express.static('public'))

    app.listen(3000, function () {
      console.log('Smart power adapter controll app listening on port 3000!')
    })
}


setupExpress();
login();

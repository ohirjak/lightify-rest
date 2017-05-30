const https = require("https");

var authToken = "";

const options = {
    protocol: "https:",
    host: '192.168.15.160',
    port: 8443,
    //path: '/devices',
    //method: 'GET',
    //headers: { "Authorization": token },
    rejectUnauthorized: false
};


function httpRequest(opts, func, data) {
    const req = https.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });

      if (func != null) {
        func(res);
      }
    });

    if (data != null) {
        req.write(data);
    }

    req.end();
}


function processLoginResponse(res) {
    res.on('data', function (chunk) {
        authToken = JSON.parse(chunk)['securityToken'];
        triggerStatus();
    });
}


//curl -vk 'https://192.168.15.160:8443/session' -d '{"username" : "user1", "password" : "password", "serialNumber" : "OSR1522003302"}' -H 'Content-Type: Application/Json'
function login() {
    const loginOpts = options;
    loginOpts.path = '/session';
    loginOpts.method = 'POST';
    const data = '{"username" : "user1", "password" : "password", "serialNumber" : "OSR1522003302"}';
    loginOpts.headers = {
        'Content-Type': 'Application/Json',
        'Content-Length': data.length
    }

    httpRequest(loginOpts, processLoginResponse, data);
}


// curl -vk 'https://192.168.15.160:8443/devices' -H 'Authorization: 2624593743756043217043494512099'
function statusDevices() {
    const statusOpts = options;
    statusOpts.path = '/devices';
    statusOpts.method = 'GET';
    statusOpts.headers = { "Authorization": authToken };

    httpRequest(statusOpts);
}


function triggerStatus() {
    statusDevices();
}


login();

/*

// Logout (DELETE):
curl -vk 'https://192.168.15.160:8443/session' -H 'Authorization: 2624593743756043217043494512099' -X DELETE

// Status - Single device (GET):
curl -vk 'https://192.168.15.160:8443/devices/1' -H 'Authorization: 2624593743756043217043494512099'

// On - Single device (GET):
curl -vk 'https://192.168.15.160:8443/device/set?idx=1&onoff=1' -H 'Authorization: 2624593743756043217043494512099'

// Off - Single device (GET):
curl -vk 'https://192.168.15.160:8443/device/set?idx=1&onoff=0' -H 'Authorization: 2624593743756043217043494512099'

// On - All devices (GET):
curl -vk 'https://192.168.15.160:8443/device/all/set?onoff=1' -H 'Authorization: 2624593743756043217043494512099'

// Off - All devices (GET):
curl -vk 'https://192.168.15.160:8443/device/all/set?onoff=0' -H 'Authorization: 2624593743756043217043494512099'
*/
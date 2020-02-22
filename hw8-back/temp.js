var express = require('express')
var app = express();
var cors = require('cors')
// for send request
var request = require('request')
// for encode url
var querystring = require("querystring");
const path = require('path');

app.use(express.static(__dirname + '/dist/hw8-front'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname)));


// app.use(cors());
// app.all('*',function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
//     res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  
//     if (req.method == 'OPTIONS') {
//       res.send(200); 
//     }
//     else {
//       next();
//     }
// });

app.use(function(req, res, next) {
    var allowedOrigins = ['http://127.0.0.1:8020', 'http://localhost:8020', 'http://127.0.0.1:9000', 'http://localhost:9000', 'http://127.0.0.1:4200', 'http://localhost:4200'];
    var origin = req.headers.origin;
    // console.log(req.headers)
    if(allowedOrigins.indexOf(origin) > -1){
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return next();
  });

// http://localhost:3000/weatherSearch?target=address&city=losangeles&street=scraff&time=


// keys
var gkey = 'AIzaSyCnhsRcQmGTOeKYcJx9o7OCcnisWqOd0T0';

// function
function getDataByIP(res, lat, lng, time){
    // https://api.darksky.net/forecast/[key]/[latitude],[longitude]
    // https://api.darksky.net/forecast/[key]/[latitude],[longitude],[time]
    var url = 'https://api.darksky.net/forecast/b3dc96cc464f1cf52c7b34180263696c/' + lat +',' + lng
    if (time !== '') {
        // if there are time request, add it to the url
        url += ',' + time
    }

    request(url, function(error, response, body){
        if (!error && response.statusCode == 200) {
            // if request is finish add a status OK 
                var result = JSON.parse(body);
                result.status = "OK";
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result));
        } else {
            // else return Status NO to show request fail
                sendError(res);
        }   
    })
};

function sendError(res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({"status" : "NO"}))
    res.end();
}


app.get('/weatherSearch', function(req, res) {
    console.log(req.query)
    if (req.query.target === 'address') {
        // request sent by address information
        // first geo get lat and lng according to address       
        var url = encodeURI('https://maps.googleapis.com/maps/api/geocode/json?address=['+req.query.street+','+req.query.city+','+req.query.state+']&key=AIzaSyCnhsRcQmGTOeKYcJx9o7OCcnisWqOd0T0');
        // console.log("address");
        request(url, function(error, response, body){
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
                if (result.status === 'OK') {
                    // console.log(result["results"][0]);
                    getDataByIP(res, result["results"][0]["geometry"]["location"]["lat"], result["results"][0]["geometry"]["location"]["lng"], req.query.time);
                } else {
                    sendError(res);
                }
                
              }
        })
    } else if (req.query.target === 'ip') {
        // request sent by ip information
        getDataByIP(res, req.query.lat, req.query.lng, req.query.time);
    } else if (req.query.target === 'autocomplete') {
        //https://maps.googleapis.com/maps/api/place/autocomplete/json?input=LOS&types=(cities)&language=en&key=AIzaSyABoN18V61bvG0QKOHgImcTOI2esXqXQZw
        var url = encodeURI('https://maps.googleapis.com/maps/api/place/autocomplete/json?input='+req.query.input+'&types=(cities)&language=en&key=AIzaSyABoN18V61bvG0QKOHgImcTOI2esXqXQZw');
        request(url, function(error, response, body){
            if (!error && response.statusCode == 200) {
                res.setHeader('Content-Type', 'application/json');
                res.send(body);
                
              }
        })

    } else if (req.query.target === 'seal') {
        // request state seal
        // console.log("seal");
        var url = encodeURI("https://www.googleapis.com/customsearch/v1?q="+req.query.state+" State Seal&cx=004851244550280467025:e9hxb3lnv2q&imgSize=huge&imgType=news&num=1&searchType=image&key=AIzaSyABoN18V61bvG0QKOHgImcTOI2esXqXQZw");
        request(url, function(error, response, body){
            if (!error && response.statusCode == 200) {
                res.setHeader('Content-Type', 'application/json');
                res.send(body);
              }
        })

        
    } else {
        res.send("helloworld");
        res.end();
    }

    
})


// app.listen(8080, function() {
//     console.log('running');
// })

const server = app.listen(process.env.PORT || 8080, () =>{
    const host = server.address().address;
    const port = server.address().port;
})
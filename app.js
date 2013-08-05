
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , sensors = require('./routes/sensors')
  , http = require('http')
  , path = require('path');

var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var sendPort = 4002;
var app = express();

// all environments
app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/ang', routes.index);
app.get('/sensors/num',sensors.numSensors);
app.get('/sensors', sensors.listAll);
app.get('/sensors/:id', sensors.showOne);
app.get('/:num', sensors.showVal);

// PUT = create, POST = create/update
app.post('/sensors/add', sensors.add);
app.post('/sensors/clear', sensors.clear);
app.post('/sensors/upd', sensors.formUpdate);
app.post('/sensors/:id', sensors.update);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

server.on("message",function(msg,rinfo){
    console.log("Got UDP Message: " + msg);
    var str = msg.toString();
    if(str.indexOf("get")!=-1){
	var num = parseInt(str.substring(4),10);
	sensors.showVal({params: {num : num}},
			{
			    send: function(str){
				    var buf = new Buffer(str);
				    var dest = sensors.getWatcher(num);

				    //console.log("Dest: " + dest + ", rinfo: " + rinfo.address);
				    //console.log("Str: " + str + ", Buf: " + buf.toString());
				    
				    server.send(buf,0,buf.length,sendPort,rinfo.address,function(err,bytes){
						console.log("Sent");
						if(err)
							console.log(err.toString);
						//else if(bytes){
						//	console.log("bytes sent: " + bytes);
						}
				    
				    );
			    }
			}
		       );
    }
    
    else if(str.indexOf("set")===0){
	
    }
});


server.on("listening",function(){
    console.log("UDP Server Listening");
});

server.bind(4001);

/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , sensors = require('./routes/sensors')
  , http = require('http')
  , path = require('path');

var udpServer = true;
  
if(udpServer){
	var dgram = require('dgram');
	var server = dgram.createSocket('udp4');
	var sendPort = 4002;
	var lastSent = new Array();
}
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
app.get('/bs/*',routes.index);
app.get('/:num', sensors.showVal);


// PUT = create, POST = create/update (apparently)
app.post('/sensors/formadd', sensors.formAdd);
app.post('/sensors/add', sensors.add);
app.post('/sensors/clear', sensors.clear);
app.post('/sensors/upd', sensors.formUpdate);
app.post('/sensors/del', sensors.del);
app.post('/sensors/:id', sensors.update);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


if(udpServer){
	server.on("message",function(msg,rinfo){
		//console.log("Got UDP Message: " + msg);
		var str = msg.toString();
		if(str.indexOf("get")!=-1){
			var num = parseInt(str.substring(4),10);
			sensors.showVal({params: {num : num}},
			{
				send: function(str){
					var buf = new Buffer(str);
					if(!lastSent[num] && lastSent[num] != 0)
						lastSent[num] = -1;
					var strint = parseInt(str);
					var dif = strint - lastSent[num];
					if(dif>=2 || dif <=-2){
						var dest = sensors.getWatcher(num);
						server.send(buf,0,buf.length,sendPort,dest);
						lastSent[num] = parseInt(str);
						console.log("Sent update to id " + num);
					}
				}
			}
			);
		}
		
		else if(str.indexOf("set")!=-1){
			var str = msg.toString();
			str = str.substring(4);
			while(str.charAt(0) === ' ')
				str = str.substring(1);
			var id = str.substring(0,str.indexOf(' '));
			str = str.substring(str.indexOf(' ')+1);
			sensors.update({
				params: {
					id:id,
					val:str
				},
				param: function(str){
					if(str.indexOf('id') != -1)
						return id;
					if(str.indexOf('val') != -1)
						return str;
				}
			},{
				send: function(str){}
			}
			);
			console.log("Updated number " + id + " to value " + str);
		}
	});


	server.on("listening",function(){
		console.log("UDP Server Listening");
	});

	server.bind(4001);
}

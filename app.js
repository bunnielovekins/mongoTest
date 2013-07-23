
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , sensors = require('./routes/sensors')
  , http = require('http')
  , path = require('path');

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

app.post('/sensors/:id', sensors.update); // PUT = create, POST = create/update
app.put('/sensors/add', sensors.add);
app.put('/sensors/clear', sensors.clear);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

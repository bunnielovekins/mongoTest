

var mongo = require('mongodb');
var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;
var server = new Server('localhost', mongo.Connection.DEFAULT_PORT, {auto_reconnect: true});
var db = new Db('sensordb', server, {strict:false, safe:false});

db.open(function(err, data) {
	if(err)
		console.log(err.toString());
	else
		db = data;
});

var sens;
db.collection('sensors', {strict:false}, function(err, collection){
	if(err)
		console.log(err.toString());
	else {
		console.log("Connected to database");
		sens = collection;
	}
});


exports.listAll = function(req, res){
	sens.find({},function(err, cur){
		if(err)
			console.log(err.toString());
		else{
			cur.toArray(function(err2,result){
				if(err2)
					console.log(err.toString());
				else{
					res.send(result);
					return;
				}
				res.send("Sensors database is currently empty");
			});
		}
	});
}

exports.showOne = function(req, res){
	var ident = req.params.id;
	sens.find({"_id":parseInt(ident)},function(err, cur){
		if(err)
			console.log(err.toString());
		else{
			cur.toArray(function(err2,result){
				if(err2)
					console.log(err.toString());
				else{
					res.send(result);
					return;
				}
				res.send("Sensors database is currently empty");
			});
		}
	});
}

exports.add = function(req,res){
	sens.find({},function(err,cur){
		cur.count(function(err,num){
			sens.insert({'city':req.body.city, '_id':num, 'val':42}, {safe:true}, function(err,rec){
			if(err)
				console.log(err.toString());
			});
			res.redirect('/sensors/' + num);
		});
	});
}

exports.clear = function(req,res){
	console.log("Clearing");
	sens.remove({});
	res.redirect('back');
}

exports.showVal = function(req,res){
	var reqNum = parseInt(req.params.num,10);
	if(isNaN(reqNum)){
		res.send("");
		return;
	}
	sens.findOne({'_id':reqNum},{'val':true, '_id':false},function(err,doc){
		if(err || !doc){
			return;
		}
		res.send(doc.val + '');
	});
}

exports.numSensors = function(req,res){
	sens.find({},function(err,cur){
		cur.count(function(err,num){
			console.log(num);
			res.send(num.toString());
		});
	});
}



















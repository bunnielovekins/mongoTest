var mongo = require('mongodb');
var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;
var server = new Server('localhost', mongo.Connection.DEFAULT_PORT, {auto_reconnect: true});
var db = new Db('sensordb', server, {strict:false, safe:false});
var mqtt = require('mqtt');
var mqclient = mqtt.createClient();


var watchers = new Array();

db.open(function(err, data) {
	if(err)
		console.log(err.toString());
	else{
		db = data;
		console.log("Opened database");
		startmqtt();
	}
	
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

exports.showVal = function(req,res){
	var reqNum = parseInt(req.params.num,10);
	if(isNaN(reqNum)){
		if(res)
			res.send("");
		return;
	}
	sens.findOne({'_id':reqNum},{'val':true, '_id':false},function(err,doc){
		if(err || !doc)
			return;
		if(res)
			res.send(doc.val + '');
		return doc.val;
	});
}

exports.showName = function(req,res){
	var reqNum = parseInt(req.param('num'),10);
	if(isNaN(reqNum)){
		if(res)
			res.send("");
		return;
	}
	sens.findOne({'_id':reqNum},{'_id':false, 'city':true},function(err,doc){
		if(err || !doc)
			return;
		if(res)
			res.send(doc.city + '');
		return doc.city;
	});
}

exports.numSensors = numSensors = function(req,res){
	var ip = req.param('ip');
	sens.find({},function(err,cur){
		cur.count(function(err,num){
			console.log("Getting number: " + num);
			res.send(num.toString());
			if(ip){
				ip = ip.trim();
				ip = ip.substring(0,ip.length-1);
				console.log("Message body: <" +ip + ">");
				watchers[num-1] = ip;
			}
		});
	});
}

exports.add = add = function(req,res){
	var cityName;
	if(!(cityName = req.param("city")))
		return;
	insert({'city':cityName, '_id':0, 'val':42},function(num){
		mqclient.subscribe('sens/'+num);
		res.send("id:" + num);	
	})
}

var insert = function(things, callback){
	sens.insert(things, {safe:true}, function(err,doc){
		if(err){
			things._id++;
			insert(things,callback);
		}
		else callback(things._id);
	});
}

exports.formAdd = function(req,res){
	add(req,{send:function(str){
		res.redirect('back');
	}});
}

exports.clear = function(req,res){
	console.log("Clearing");
	sens.remove({});
	res.redirect('back');
	mqclient = mqtt.createClient();
}

exports.update = update = function(req,res){
	var ident = parseInt(req.param("id"));
	var val = parseInt(req.params.val);
	if(isNaN(val))
		val = parseInt(req.param("val"));
	sens.update({"_id":ident},{$set:{'val':val}});
	mqclient.publish('sens/'+ident, value+'');
	res.send('updated');
}

exports.formUpdate = function(req,res){
	var ident = parseInt(req.param("id"));
	var value = parseInt(req.param("val"));
	console.log("Updating id=" + ident + " to val=" + value);
	sens.update(
		{"_id":ident},
		{$set: { "val" : value }}
	);
	mqclient.publish('sens/'+ident, value+'');
	res.redirect('back');
}

exports.getWatcher = function(num){
	return watchers[num];
}

exports.del = function(req,res){
	var ident = parseInt(req.param("id"));
	mqclient.publish("sens/"+ident,"510");
	console.log("Deleting id="+ident);
	sens.remove({"_id":ident},true);
	res.redirect('back');
}

//var topics = new Array();

var startmqtt = function(){
	numSensors({param:function(){}},{
		send:function(str){
			var num = parseInt(str);
			var i = 0;
			for(i;i<num;i++)
				mqclient.subscribe('sens/'+i);
			mqclient.subscribe('sens/meta');
			mqclient.on('message',onMessage);
		}
	});
}

var onMessage = function(topic,message){
	if(topic.trim() === 'sens/meta'){
	    if(message.indexOf("add")!=-1){
		message = message.substring(4);
		console.log("Adding");
		add( 
		    {param:function(str){return message;}},
		    {send:function(str){
			mqclient.publish('sens/meta',str.substring(3));
			console.log("Publishing " + str);
		    }
		    });
	    }
		else switch(message.trim()){
			case "num":
				sens.find({},function(err,cur){
					cur.count(function(err,num){
						mqclient.publish('sens/meta',num.toString());
					});
				});
				break;
			case "clear":
				sens.remove({});
				mqclient = mqtt.createClient();
				mqclient.subscribe('sens/meta');
				break;
		}
	}
	else {
		var id = parseInt(topic.substring(5));
		var val = parseInt(message);
		console.log(id+':'+val);
		sens.update({"_id":id},{$set:{'val':val}});
	}
}








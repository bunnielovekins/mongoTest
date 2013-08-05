var mongo = require('mongodb');
var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;
var server = new Server('localhost', mongo.Connection.DEFAULT_PORT, {auto_reconnect: true});
var db = new Db('sensordb', server, {strict:false, safe:false});

var watchers = new Array();

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

exports.showVal = function(req,res){
	var reqNum = parseInt(req.params.num,10);
	if(isNaN(reqNum)){
	    if(res)
		res.send("");
	    return;
	}
	sens.findOne({'_id':reqNum},{'val':true, '_id':false},function(err,doc){
	    if(err || !doc){
		return;
	    }
	    if(res)
		res.send(doc.val + '');
	    return doc.val;
	});
}

exports.numSensors = function(req,res){
    var ip = req.param('ip');
    var number;
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

exports.add = function(req,res){
	sens.find({},function(err,cur){
		cur.count(function(err,num){
		    if(err){
			console.log(err.toString());
			return;
		    }
		    var cityName;
		    if(cityName = req.param("city")){
			sens.insert({'city':cityName, '_id':num, 'val':42}, {safe:true},function(err,doc){
			    if(err)
				console.log(err.toString());
			});
			res.send("id:" + num);
		    }//End if cityname
		});//Emd count callback
	});//end find callback
}// end add

exports.clear = function(req,res){
	console.log("Clearing");
	sens.remove({});
	res.redirect('back');
}

exports.update = function(req,res){
    var ident = parseInt(req.params.id);
    var val = parseInt(req.param("val"));
    console.log("Got update. id:" + ident + ", value:" + val);
    sens.update({"_id":ident},{$set:{'val':val}});
    res.send('updated');
}

exports.formUpdate = function(req,res){
    console.log("Got a form update...");
    var ident = parseInt(req.param("id"));
    var value = parseInt(req.param("val"));
    console.log("Updating id=" + ident + " to val=" + value);
    sens.update(
	{"_id":ident},
	{
	    $set: { "val" : value }
	}
    );
    res.redirect('back');
}

exports.getWatcher = function(num){
    return watchers[num];
}













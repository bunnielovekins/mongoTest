
/*
 * GET home page.
 */

exports.index = function(req, res){
	switch(req.path){
		case "/ang":
			res.render('angular2', { title: 'Sensors' });
			break;
		case "/":
			res.render('index', { title: 'Sensors' });
			break;
		case "/sensorjs":
			res.send(req.params);
			break;
	}
	
};

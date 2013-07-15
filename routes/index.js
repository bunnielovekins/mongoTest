
/*
 * GET home page.
 */

exports.index = function(req, res){
	console.log(req.params);
	switch(req.path){
		case "/ang":
			res.render('angular', { title: 'Sensors' });
			break;
		case "/":
			res.render('index', { title: 'Sensors' });
			break;
		case "/sensorjs":
			res.send(req.params);
			break;
	}
	
};

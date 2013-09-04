
/*
 * GET home page.
 */


exports.index = function(req, res){
	if(req.path.indexOf('/bs/')!=-1){
		res.sendfile("views"+req.path);
	}
	switch(req.path){
		case "/ang":
			res.render('angular2', { title: 'Sensors' });
			break;
		case "/":
			res.render('index', { title: 'Sensors' });
			break;
	}
	
};

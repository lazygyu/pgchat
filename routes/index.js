
/*
 * GET home page.
 */

var http = require('http');

exports.index = function(req, res){
  res.render('index', { title: 'FacebookGroupChat' });
};

exports.chat = function(req, res){
	res.render('chat', { gid:req.params.group, title:'FacebookGroupChat' });
	
};

exports.parseUrl = function(req, res){
	var url = req.params.parsingUrl.toString();
	url = url.replace(/\|_\|/g, '/');
	url = url.replace(/\|`\|/g, '?');
	var tmp = url.split('/');
	var path = '';
	var host = tmp[2];
	if( tmp.length >= 4 ){
		path = "/" + tmp.splice(3, (tmp.length - 3)).join('/');
	}
	
	console.log("Host : " + host + "\nPath : " + path);

	var reqs = http.request({
			"host":"api.embed.ly",
			"port":80,
			"method":"get",
			"path":"/1/oembed?url=" + url

		}, function(ress){
			var reg = /<meta[\s]+property[\s]*=[\s]*['"]og:([^'"]+)['"]\s+content\s*=\s*['"]([^'"]+)['"]/gi;
			var body = '';
			ress.on('data', function(chunk){
				body += chunk;
			});
			ress.on('end', function(){
				res.end(body);
			});
		 });
	reqs.on('error', function(e){
			console.log("Problem with request : " + e.message);
			res.end();
		});
	reqs.end();
};

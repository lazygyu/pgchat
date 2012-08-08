
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var nowjs = require('now');
var app = express();

var members = [];


Date.prototype.format = function(f) {
	if (!this.valueOf()) return " ";
 
	var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
	var d = this;
	 
	return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
	switch ($1) {
		case "yyyy": return d.getFullYear();
		case "yy": return (d.getFullYear() % 1000).zf(2);
		case "MM": return (d.getMonth() + 1).zf(2);
		case "dd": return d.getDate().zf(2);
		case "E": return weekName[d.getDay()];
		case "HH": return d.getHours().zf(2);
		case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
		case "mm": return d.getMinutes().zf(2);
		case "ss": return d.getSeconds().zf(2);
		case "a/p": return d.getHours() < 12 ? "오전" : "오후";
		default: return $1;
	}
	});
};
 
String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

app.configure(function(){
  app.set('port', 3433);
  app.set('views', __dirname + '/views');
  app.set('lib', __dirname + '/lib');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.param(function(name, fn){
  if (fn instanceof RegExp) {
    return function(req, res, next, val){
      var captures;
      if (captures = fn.exec(String(val))) {
        req.params[name] = captures;
        next();
      } else {
        next('route');
      }
    }
  }
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.param('group', /^\d+$/);
app.get("/chat/:group", routes.chat);
app.param('parsingUrl', /^.+$/);
app.get("/parse/:parsingUrl", routes.parseUrl);

nowjs.on('connect', function(){

});
nowjs.on('disconnect', function(){
  console.log(this.user.clientId + " try to disconnect");
  var gid = members[this.user.clientId].group;
  var gr = nowjs.getGroup(members[this.user.clientId].group);
  gr.removeUser(this.user.clientId);
  console.log(this.user.clientId + " has disconnected.");
  gr.count(function(cnt){ console.log("Group " + gid + " has " + cnt + " user(s)."); });
  gr.now.userLogout(members[this.user.clientId].uid);
  members[this.user.clientId] = null;
  delete members[this.user.clientId];
});

var serv = http.createServer(app);
serv.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
var everyone = nowjs.initialize(serv);

everyone.now.enter = function(uid, gid){
  console.log('client ' + this.user.clientId + ' logged in');
  members[this.user.clientId] = {};
  members[this.user.clientId].group = gid;
  members[this.user.clientId].uid = uid;
  var unow = this.now;
  console.dir(members[this.user.clientId]);
  var gr = nowjs.getGroup(gid);
  gr.addUser(this.user.clientId);
  gr.now.userLogin(uid);
  gr.getUsers(function(users){
	  for(var i=0,l=users.length;i<l;i++){
		unow.userLogin(members[users[i]].uid);
	  }
	  
  });

};
everyone.now.sendMsg = function(msg){
  var gr = members[this.user.clientId].group;
  if( !gr ) return;
  var group = nowjs.getGroup(gr);
  var curTime = new Date();
  group.now.recieveMsg(members[this.user.clientId].uid, msg, curTime.format("a/p hh시 mm분 ss초"));
}
everyone.now.parseUrl = function(url, cb){
	var tmp = url.split('/');
	var path = '';
	var host = tmp[2];
	var that = this;
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
				that.now.makePreview(body, cb);
			});
		 });
	reqs.on('error', function(e){
			console.log("Problem with request : " + e.message);
			that.now.makePreview(null, cb);
		});
	reqs.end();
}

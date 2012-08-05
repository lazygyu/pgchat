
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



var serv = http.createServer(app);
serv.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
var everyone = nowjs.initialize(serv);

nowjs.on('connect', function(){
  members[this.now.clientId] = { };
});
everyone.now.enter = function(uid, gid){
  members[this.now.clientId].group = gid;
  members[this.now.clientId].uid = uid;
  nowjs.getGroup(gid).addUser(this.user.clientId);
};
everyone.now.sendMsg = function(msg){
  var gr = members[this.now.clientId].group;
  if( !gr ) return;
  var group = nowjs.getGroup(gr);
  group.now.recieveMsg(members[this.now.clientId].uid, msg);
}


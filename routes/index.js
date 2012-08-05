
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'FacebookGroupChat' });
};

exports.chat = function(req, res){
	res.render('chat', { gid:req.params.group, title:'FacebookGroupChat' });
	now.getGroup(req.params.group).addUser(this.now.getClientId());
}
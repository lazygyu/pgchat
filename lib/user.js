function User(opt){
	var username = opt.username || "";
	var userimage = opt.userimage || "";
	var isLogin = false;
}

function Users(){
	var userlist = [];

	var hasUser = function(usr){
		if( typeof usr == "string" ){
			for(var i=0,l=userlist.length; i<l; i++){
				if(userlist[i].username == usr) return i;
			}
		}else{
			for(var i=0,l=userlist.length;i<l;i++){
				if(userlist[i].username == usr.username ) return true;
			}
		}
		return false;
	}

	this.hasUser = hasUser;

	var add = function(usr){
		if( hasUser(usr) !== false ){
			return false;
		}else{
			userlist.push(usr);
			return true;
		}
	}

	this.add = add;

	var remove = function(usr){
		var idx = hasUser(usr);
		if( idx !== false ){
			userlist.splice(idx, 1);
		}else{
			return false;
		}
	}
}

module.exports = exports = {
	"User":User,
	"Users":Users
};

module.exports = {

  int2hex: function(int){

    var res = int.toString(16);
    if(res.length == 1){
      res = "0"+res;
    }
    return res;
  },

  hex2int: function(hex){
    return parseInt(hex, 16);
  },

  checksum: function(str){

    var sum = 0;
  	for (var c = 0; c < str.length; c += 2){
  	    sum += parseInt(str.substr(c, 2), 16);
  	}

    var res = (sum%256).toString(16);

    if(res.length == 1){
      res = "0"+res;
    }
    return res;
  }
}

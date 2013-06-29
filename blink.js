var timeout = false;
exports.action = function(data, callback, config, SARAH){
  
  if (timeout){
    clearTimeout(timeout);
  }
  
  if (data.blink){
    blink('#'+data.blink, 0.5, '#000000', 0.2, data.duration * 1000);
  } 
  else if (data.warn || data.item){
    var warn = data.warn || data.item;
    blink('#'+warn[0], 0.5, '#'+warn[1], 0.5, data.duration * 1000);
  }
  else if (data.color){ 
    setColor('#'+data.color);
  }
  
  // Go back to black
  timeout = setTimeout(function(){ setColor('#000000'); }, 10000);
  
  // Callback
  callback({});
}

// ==========================================
//  UTIL FUNCTION
// ==========================================

var blink = function(start, d1, end, d2, duration, cb){
  var pattern = 'blink';
  var Step = require('./lib/step');
  Step(
  
     function(){ 
       addPattern(pattern, '0, '+start+', '+d1+', '+end+', '+d2+'', this); 
     },
  
     function(json){
       setPattern(pattern, this);
     },
     
     function(json){ 
       setTimeout(this, duration || 1000);
     },
     
     function(json){ 
       setColor('#000000');
       delPattern(pattern, this);
     },
     
     function(json){ 
       if (cb) { cb(); }
     }
  );
}

// ==========================================
//  SIMPLE FUNCTION
//  https://github.com/todbot/blink1/blob/master/docs/app-url-api.md
// ==========================================


var setColor = function(hexColor, cb){
  sendBlink("/blink1/fadeToRGB?rgb="+ encodeURIComponent(hexColor) +"&time="+ 0.3, cb);
}

var setPattern = function(name, cb){
  sendBlink("/blink1/pattern/play?pname="+encodeURIComponent(name), cb);
}

// format: "repeats,color1,color1time,color2,color2time,..."
var addPattern = function(name, pattern, cb){
  var url  = "/blink1/pattern/add?pname=" + encodeURIComponent(name); 
      url += "&pattern="+encodeURIComponent(pattern); 
  sendBlink(url, cb);
}

var delPattern = function(name, cb){
  sendBlink('/blink1/pattern/del?pname='+encodeURIComponent(name), cb);
}

var logging = function(enable, cb){
  sendBlink('/blink1/logging?loglevel='+(enable?1:0), cb);
}

// ==========================================
//  CORE FUNCTION
//  https://gist.github.com/toddanglin/4970717
// ==========================================

var sendBlink = function (path, cb){

  // console.log('[Blink] send command: ', path);
  
  var url = "http://localhost:8934"+path;
  var request = require('request');
  request({ 'uri': url, json: true }, function (err, response, json){
    
    if (err || response.statusCode != 200) {
      console.log('[Blink] command failed');
      return cb ? cb() : false;
    }
    // console.log(json);
    return cb ? cb(json) : true;
  });
}
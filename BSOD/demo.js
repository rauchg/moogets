Window.implement({
  
  shake: function(times, factor){
    times = times || 10;
    factor = factor || 10;
		(function(){
			window.moveBy(factor * ((times % 2) ? -1 : 1), 0);
			times--;
			if (times > 0) arguments.callee.delay(50);
		})();
	}
  
});

window.addEvent('domready', function(){
  
  $$('.run').addEvent('click', function(){
    eval($(this.id.replace('run-', '')).get('html'));
    return false;
  });
  
});
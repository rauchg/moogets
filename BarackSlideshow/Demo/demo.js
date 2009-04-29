window.addEvent('domready', function(){
  var transition = 'alternate';
  $$('input[name=transition]').addEvent('click', function(){ transition = this.value; });
  var slideAvailable = ['slide-left', 'slide-right', 'slide-top', 'slide-bottom', 'fade'];
  var slideTransition = function(){
    switch(transition){
      case 'alternate':
        if(! $defined(this.count)) this.count = -1;
        return slideAvailable[++this.count % slideAvailable.length];
      case 'random': return slideAvailable.getRandom();
      default: return transition;
    }
  }
  
  $('option-auto').addEvent('click', function(){
    slideshow.options.auto = this.checked;
  });
  
  var slideshow = new BarackSlideshow('menu', 'pictures', 'loading', { transition: slideTransition, auto: $('option-auto').checked });

	// the example above is only fitting for this demo, since we let the user pick the transition and turn auto on/off
	// for most scenarios, it's only enough with: 
	// new BarackSlideshow('menu', 'pictures', 'loading', {transition: '<transition here>', auto: true});
	// transitions can be 'slide-left', 'slide-right', 'slide-top', 'slide-bottom', 'fade'
});
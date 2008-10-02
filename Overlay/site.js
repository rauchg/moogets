var Overlay = new Hash({
  
  options: {
    inject: null,
    opacity: 0.8,
    zIndex: 5000,
    tween: { 
      'duration': 400,
      'transition': Fx.Transitions.Expo.easeOut,
      'link': 'cancel'
    },
    onClick: $empty
  },
  
  initialize: function(box, options) {
    if(! this.init) {
      this.options = $merge(this.options, options);     
      this.element = new Element('div', {
        'id': 'overlay',
        'visibility': 'hidden',
        'opacity': 0,
        'styles': { 
					'z-index': this.options.zIndex,
					'position': Browser.Engine.trident4 ? 'absolute' : 'fixed'
				},
        'events': {
          'click': this.options.onClick.bind(this)          
        }
      }).inject($pick(this.options.inject, document.body));			
      this.element.set('tween', this.options.tween); 
      window.addEvents({
        'resize': this.resize.bind(this),
        'scroll': this.scroll.bind(this)
      });      
      this.init = true;
    }
  },
  
  show: function(box, oncomplete) {
    this.initialize();
    this.element.setStyle('height', Window.getScrollHeight());
    if(!this.shown || box != this.box)
      this.element.fade(this.options.opacity).get('tween').chain(oncomplete || $empty);
    else if(this.box) {
      this.box.close(true);
      box.show(true);
    }
		if(Browser.Engine.trident4) {
			try{ this.shim.remove() }catch(e){}
			this.shim = new IframeShim(this.element, { name: 'overlayShim' });
			this.shim.show();
		}
    this.shown = true;
    this.box = box;
  },
  
  close: function() {		
		try{ this.shim.remove() }catch(e){}
    this.element.fade('out');
    this.shown = false;
    if(! this.box) return;
    this.box.close(true);
    this.box = null;
  },
  
  resize: function(force) {
    if(!force && ! this.shown) return;
		if(Browser.Engine.trident) this.element.setStyle('height', Window.getScrollHeight());
    if(this.box) this.box.relocate();
  },
  
  scroll: function() {
    if(this.box) this.box.scroll()
  }
  
});


var OverlayElement = new Class({
  
  Implements: [Options, Events],
  
  options: {/*
		onClose: $empty,*/
    fx: {
      'duration': 400,
      'transition': Fx.Transitions.Expo.easeOut,
      'link': 'cancel'
    },
    scrolldelay: 200
  },
  
  initialize: function(element, options) {
    Overlay.initialize();
    this.setOptions(options);
    this.element = $(element);
    this.element.set('styles', {
      'display': 'block',
      'z-index': Overlay.options.zIndex + 1
    });
    this.holder = new Element('div', {
      'class': 'overlay_container',
      'styles': { 'z-index': Overlay.options.zIndex + 1 }
    }).adopt(this.element).inject(document.body);    
    this.fx = new Fx.Tween(this.holder, this.options.fx);
  },
  
  show: function(nooverlay) {
	  this.element.getElements('.close').addEvent('click', function() { this.close(); return false; }.bind(this) );
    this.holder.setStyle('display', 'block');
		this.holder.setStyle('top', -this.element.offsetHeight);
    if(! nooverlay) Overlay.show(this, this.relocate.bind(this));
    if(nooverlay) this.relocate();
  },
  
  close: function(nooverlay) {
    this.fx.start('top', null, -this.element.offsetHeight).chain(function() {
      if(! nooverlay) Overlay.close();
      this.holder.setStyle('display', 'none');
    }.bind(this));    
		this.fireEvent('onClose');
  },
  
  scroll: function() {
    if(this.scrolltimer) $clear(this.scrolltimer);
    this.scrolltimer = this.relocate.delay(this.options.scrolldelay, this);
  },
  
  relocate: function() {
    this.fx.start('top', null, this.getCenterHeight());
  },
  
  getCenterHeight: function() {
    return Window.getScrollTop() + ((Window.getHeight() - this.holder.offsetHeight) / 2).toInt();
  }
  
});
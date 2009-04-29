/*
  BarackSlideshow 0.2
    - Libraries required: MorphList <http://devthought.com>
    - MooTools version required: 1.2
    - MooTools components required: 
        Core: (inherited from MorphList)
        More: Assets
  
    Changelog:
    - 0.1: First release
    - 0.2: Added 'transition' option. Can be slide-(bottom|top|left|right) or fade, or a function that returns any of those values
           Added 'tween' to options to customize the transition effect
           BarackSlideshow::show now also alters the menu state
           Other tiny changes
*/
/*! Copyright: Guillermo Rauch <http://devthought.com/> - Distributed under MIT - Keep this message! */

var BarackSlideshow = new Class({
  
  Extends: MorphList,
  
  options: {/*
    onShow: $empty,*/
    auto: false,
    autostart: false,
    autointerval: 2000,
    transition: 'fade',
    tween: { duration: 700 }
  },
  
  initialize: function(menu, images, loader, options) {
    this.parent(menu, options);
    this.images = $(images);
    this.imagesitems = this.images.getChildren().fade('hide');
    $(loader).fade('in');
    new Asset.images(this.images.getElements('img').map(function(el) { return el.setStyle('display', 'none').get('src'); }), { onComplete: function() {
      this.loaded = true;      
      $(loader).fade('out');
      if(this.current) this.show(this.menuitems.indexOf(this.current));
      else if(this.options.auto && this.options.autostart) this.progress();
    }.bind(this) });
    if($type(this.options.transition) != 'function') this.options.transition = $lambda(this.options.transition);
  },
  
  auto: function(){
    if(! this.options.auto) return false;
    $clear(this.autotimer);
    this.autotimer = this.progress.delay(this.options.autointerval, this);
  },
  			
  click: function(event, item) {
    this.parent(event, item);
    event.stop();
    this.show(this.menuitems.indexOf(item));
    $clear(this.autotimer);
  },
  
  show: function(index) {
    if(! this.loaded) return;
    var image = this.imagesitems[index];    
		if(image == this.curimage) return;
    image.set('tween', this.options.tween).dispose().inject(this.curimage || this.images.getFirst(), this.curimage ? 'after' : 'before').fade('hide');
		image.getElement('img').setStyle('display', 'block');
    var trans = this.options.transition.run(null, this).split('-');
    switch(trans[0]){
      case 'slide': 
        var dir = $pick(trans[1], 'left');
        var prop = (dir == 'left' || dir == 'right') ? 'left' : 'top';
        image.fade('show').setStyle(prop, image['offset' + (prop == 'left' ? 'Width' : 'Height')] * ((dir == 'bottom' || dir == 'right') ? 1 : -1)).tween(prop, 0); 
        break;
      case 'fade': image.fade('in'); break;
    }
    image.get('tween').chain(function() { 
      this.auto();
      this.fireEvent('show', image); 
    }.bind(this));
    this.curimage = image;
    this.setCurrent(this.menuitems[index])
    this.morphTo(this.menuitems[index]);
		return this;
  },
  
  progress: function(){
    var curindex = this.imagesitems.indexOf(this.curimage);
    this.show((this.curimage && (curindex + 1 < this.imagesitems.length)) ? curindex + 1 : 0);
  }
  
});
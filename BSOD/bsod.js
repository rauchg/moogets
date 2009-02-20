(function(){
  
  var platform = (function(){
    var oses = { win: 'Windows', mac: 'Mac OS X', linux: 'Linux Kernel', ipod: 'iPod' };
    return oses[Browser.Platform.name];
  })();
    
  BSOD = new Class({
    
    Implements: [Events, Options],
    
    options: {/*
      onClose: $empty,
      html: '',
      title: ''*/
    },
    
    initialize: function(document, options){
      this.setOptions(options);
      
      this.document = document;
      this.body = $(document.getDocument().body);
      this.container = $('bsod') ? $('bsod') : new Element('div', { id: 'bsod', 'styles': {
        'position': Browser.Engine.trident4 ? 'absolute' : 'fixed'
      }}).inject(this.body);
      this.container.setStyle('display', 'block');
      
      var title = this.options.title || platform;
      var html = this.options.html || '<p>An error has ocurred. To continue:</p><p>Press Enter to return to '+ title + ', or</p><p>Press CTRL+ALT+DEL to restart your computer. If you do this, you will lose any unsaved information in all open applications.</p><p>Error: 0E : 016F : BFF9B3D4</p>';
      
      this.container.adopt(
        new Element('div', { id: 'bsod-content' }).adopt(
          new Element('h1', { html: '<span>'+title+'</span>' }),
          new Element('div', { 'class': 'content', html: html }),
          new Element('div', { 'class': 'exit', html: '<p>Press any key to continue <span class="underscore">_</span></p>' })
        )
      );      
    
      this.restyle();
      this.bound = { close: this.close.bind(this), restyle: this.restyle.bind(this) };
      this.document.getWindow().addEvent('keyup', this.bound.close).addEvent('resize', this.bound.restyle);
      if(Browser.Engine.trident4) this.document.getWindow().addEvent('scroll', this.bound.restyle);
    },
    
    restyle: function(){
      this.container.setStyles({
        'top': Browser.Engine.trident4 ? document.getWindow().getScrollTop() : 0,
        'width': document.getWindow().getWidth(), 
        'height': document.getWindow().getHeight()
      });
      $('bsod-content').setStyle('margin-top', Math.round((document.getWindow().getHeight() - $('bsod-content').offsetHeight) / 2));
    },
    
    close: function(){
      this.container.setStyle('display', 'none').empty();
      this.document.getWindow().removeEvent('keyup', this.bound.close).removeEvent('resize', this.bound.restyle);
      if(Browser.Engine.trident4) this.document.getWindow().removeEvent('scroll', this.bound.restyle);
      this.fireEvent('close');
    }
    
  });
  
})();


Native.implement([Window, Document], {

  bsod: function(options){
    new BSOD(this, options);
  }  

});
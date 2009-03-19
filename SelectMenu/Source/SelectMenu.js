/*
Script: SelectMenu.js
	Produces a menu from a list of links that utilizes a select input control.

	License:
		MIT-style license.

	Authors:
		Guillermo Rauch
*/

var SelectMenu = new Class({
  
  Implements: [Options, Events],
  
  options: {
    title: true,
    data: null,
    mainclass: 'select_menu',
    toggleclass: 'select_menu_open'
  },
  
  initialize: function(el, options){
    this.setOptions(options);
    this.element = $(el);
    this.select = new Element('select').setOpacity(0).addEvents({
      'change': this.select.bind(this),
      'blur': this.blur.bind(this),
      'focus': this.focus.bind(this)
    });
    this.fill();
    this.select.selectedIndex = -1;
    this.trigger = new Element('span', { 'class': this.options.mainclass, 'title': this.options.title ? this.element.getFirst().get('text') : '' });
    this.element.empty().adopt(this.trigger.adopt(this.select));
  },
  
  fill: function(){
    if (this.options.data === null){
      this.element.getElements('a').each(function(el){ 
        this.add(el.get('text'), el.href);
      }, this);
    } else {
      for (var url in this.options.data)
        this.add(this.options.data[url], url);
    }
  },
  
  add: function(title, url){    
    this.select.adopt(this.createOption(title, url));
    return this;
  },
  
  createOption: function(title, url){
    var that = this;
    return new Element('option', { value: url, html: title }).addEvent('click', function(){
      window.location = this.value;
      that.blur();
    });
  },
  
  setIndex: function(){
    if (Browser.Engine.trident || Browser.Engine.presto || Browser.Engine.webkit)
      this.select.selectedIndex = -1;
  },
  
  select: function(){    
    if (Browser.Engine.trident || Browser.Engine.presto || Browser.Engine.webkit){
      if (this.select.selectedIndex > -1)
        window.location = this.select.options[this.select.selectedIndex].value;
      this.setIndex();    
      this.blur();
    }
  },
  
  focus: function(){
    this.setIndex();
    this.trigger.addClass(this.options.toggleclass);
  },
  
  blur: function(){
    this.setIndex();
    this.trigger.removeClass(this.options.toggleclass);
  }
  
});
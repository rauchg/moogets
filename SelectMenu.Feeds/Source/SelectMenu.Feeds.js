/*
Script: SelectMenu.js
	Produces a menu from the feeds found in the page easily.

	License:
		MIT-style license.

	Authors:
		Guillermo Rauch
*/

var SelectMenu.Feeds = new Class({
  
  Extends: SelectMenu,
  
  options: {
    selector: 'link[type*=rss], link[type*=atom]',
    labels: {
      'atom': 'Atom feeds',
      'rss': 'RSS feeds'
    },
    mainclass: 'feed_menu',
    toggleclass: 'feed_menu_open'
  },
  
  types: [],
    
  fill: function(){
    document.getElements(this.options.selector).each(function(el){ 
      this.add(el.get('title'), el.get('href'), el.get('type').replace(/^application\/(.*)\+xml/, '$1'));
    }, this);
  },
  
  add: function(title, url, type){
    if (type && !this.types[type]){
    	this.types[type] = Browser.Engine.presto ? this.select : new Element('optgroup', { label: this.options.labels[type] }).inject(this.select);
    }
		this.createOption(title, url).inject(type ? this.types[type] : this.select);
    return this;
  }
  
});
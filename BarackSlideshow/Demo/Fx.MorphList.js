/*
Script: Fx.MorphList.js
	Animates lists of objects with a morphing background.

	License:
		MIT-style license.

	Authors:
		Guillermo Rauch
*/

Fx.MorphList = new Class({   
	
	Implements: [Events, Options],
	
	options: {/*             
		onClick: $empty,
		onMorph: $empty,*/
		bg: {'class': 'background', html: '<div class="inner"></div>', morph: {link: 'cancel'}}		
	},
	
	initialize: function(element, options) {
		this.setOptions(options);
		this.element = $(element);
		this.element.getChildren().addEvents({
			mouseenter: function(){ that.morphTo(this); },
			mouseleave: function(){ that.morphTo(that.current); },
			click: function(ev){ that.onClick(ev, this); }
		});       
		this.bg = new Element('li', this.options.bg).inject(this.element).fade('hide');
		this.setCurrent(this.element.getElement('.current'));
	},          

	onClick: function(ev, item) {
		this.setCurrent(item, true).fireEvent('click', [ev, item]);
	},
	
	setCurrent: function(el, effect){  
		if (el && !this.current){
			this.bg.set('styles', el.getCoordinates());
			(effect) ? this.bg.fade('in') : this.bg.fade('show');
		}
		if (this.current) this.current.removeClass('current');
		if (el) this.current = el.addClass('current');    
		return this;
	},         
         
	morphTo: function(to) {
		if (!this.current){
			this.bg.morph(to.getCoordinates());
			this.fireEvent('morph', to);
		}
		return this;
	}

});
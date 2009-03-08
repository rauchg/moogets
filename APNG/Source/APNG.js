/*
Script: APNG.js
	Animated PNGs, background-image or src based. If background-image is used, background-position transitions are supported. Native APNG fallback for browsers that support it included.

	License:
		MIT-style license.

	Authors:
		Guillermo Rauch
*/

var APNG = new Class({
	
	Implements: [Options, Class.Occlude],
		
	options: {
		property: 'src',
		axis: 'x',
		ext: '.png',
		frames: 5,
		endless: true,
		interval: 100,
		autoStart: true,
		startFrame: 1,
		preload: true,
		native: Browser.Engine.gecko19 || Browser.Engine.presto950,
		addFilter: Browser.Engine.trident
	},
	
	initialize: function(element, options){
		this.setOptions(options);		
		this.element = $(element);
		if (this.occlude('apng')) return this.occluded;
		this.original = this.options.property == 'src' ? this.element.src : this.element.getStyle('background-image').replace(/url\((.*)\)/i, '$1');
		this.basename = this.original.substr(0, this.original.length - this.options.ext.length);
		if (this.options.native){
			this.setSrc(this.basename + '-anim.png');
			this.start = this.reset = this.pause = this.resume = this.cancel = $empty;
		} else {
			if (this.options.preload) this.preload();
			this.reset(! this.options.autoStart);
		}
	},
	
	setSrc: function(src, index){
		if (this.options.property != 'background-position') {
			this.options.property == 'src' ? this.element.set('src', src) : this.element.setStyle('background-image', 'url('+ src +')');
			if (this.options.addFilter) {
				this.element.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+src+"',sizingMethod='crop')";
				this.element.setSrc(APNG.blankImage || '/blank.gif');
			}
		} else {
			var px = index * this.element['get' + (this.options.axis == 'x' ? 'Width' : 'Height')]();
			this.element.setStyle('background-position', (this.options.axis == 'x' ? -px + 'px 0' : '0 ' + px + 'px'));
		}
	},
	
	setFrame: function(index, pause){
		this.current = index;
		var ext = this.options.ext;
		this.setSrc(index == 1 ? this.original : (this.basename + '-' + index + this.options.ext), index);
		if (!pause) this.start();
	},
	
	preload: function(){
		if (!this.preloaded){
			for (var index = 1; index <= this.options.frames; index++){
				new Image().src = index == 1 ? this.original : (this.basename + '-' + index + this.options.ext)
			}
			this.preloaded = true;
		}
	},
	
	start: function(){
		this.running = true;
		this.timer = (function(){
			if (this.current == this.options.frames) (this.options.endless ? this.reset() : this.pause());
			else this.setFrame(this.current + 1);
		}).delay($type(this.options.interval) == 'array' ? this.options.interval[this.current - 1] : this.options.interval, this);
	},
	
	reset: function(pause){		
		if (this.running) this.pause();
		this.setFrame(this.options.startFrame, pause);
	},
	
	pause: function(){
		$clear(this.timer);
		this.running = false;
	},
	
	resume: function(){
		if (!this.running) this.start();
	},
	
	cancel: function(){
		this.pause();
		this.reset(true);
	}
	
});
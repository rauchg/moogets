String.implement({
  
  toHash: function(string) {
    var decoded = new Hash;
    string.split('&').each(function(param){
      param = param.split('=');
      decoded.set(param[0], param[1]);
    });
    return decoded;
  }
  
});

// Runtime mixins

Class.Mutators = $extend({
  
  Mixins: function(self, klass){  
    // has to be the first because we need to include events
    if(! self.Implements) self.Implements = [Events];
    else self.Implements.include(Events);
    
    // now we run and unset the other mutators from here...
    for(var mut in Class.Mutators){
      if(mut == 'Mixins') continue;
      if(self[mut]) {
        Class.Mutators[mut](self, self[mut]);
        delete self[mut];
      }
    }
    
    // ... because we need to edit all methods
    for(var method in self){
      if($type(self[method]) == 'function'){
        var m = self[method];
        self[method] = function() {
          m.apply(self, arguments);
          self.fireEvent(klass + '::' + method, arguments);
        };
      }
    }
    
    // add other methods
    
    self.registerMixins = function() {
      Array.flatten(arguments).each(function(mixin) {
        mixin.enable(self);
      });
    };
  }
  
}, Class.Mutators);


var Mixin = new Class({
  
  initialize: function(forklass, methods) {
    this.forklass = forklass;
    this.methods = methods;
  },
  
  enable: function(obj) {
    for(var method in this.methods) obj.addEvent(this.forklass + '::' + method, this.methods[method]);
  }
  
});


var TextboxList = new Class({
  
  Mixins: 'TextboxList',
  
  Implements: [Options, Events],

  options: {/*
    onFocus: $empty,
    onBlur: $empty,
    onEditableFocus: $empty,
    onEditableBlur: $empty,
    onBoxFocus: $empty,
    onBoxBlur: $empty,
    onBoxDispose: $empty,*/
    cssclass: 'textboxlist',
    boxclass: null,
    inject: 'before',    
    features: [], /* like enter, autocomplete, drag */
    boxfeatures: [], /* like closable */
    limit: null,
    extrainputs: true,
    startinput: true,
    hideempty: true
  },
  
  initialize: function(element, options){
    this.setOptions(options);
    this.css = this.options.cssclass;
    this.bits = new Hash;
    this.events = new Hash;
    this.original = $(element);
    
    this.registerMixins(this.options.features);
    this.afterInit();
  },
  
  afterInit: function() {
    console.log('textboxlist init');
    this.prepare();
    this.create();
    this.set();
  },
  
  toElement: function(){
    return this.textboxlist;
  },
  
  prepare: function(){
    try {
      this.original.blur();
    } catch(e) {}
    this.original.setStyle('display', 'none');
  },
  
  create: function(){
    this.textboxlist = new Element('div', { 'class': this.css });
    this.inputs = new Element('ul', { 'class': this.css + '-inputs' }).inject(this.textboxlist);
    
    if(this.options.inject)
      this.textboxlist.inject(this.original, $type(this.options.inject) == 'string' ? this.options.inject : null);
  },
  
  set: function(){
    
  },
  
  createBitBox: function(value){
    var klass = this.options.boxclass || TextboxListBitBox;
    eval('return new TextboxListBitBox' + this.options.box.camelCase() + '(this.textboxlist, value);');
  },
  
  createBitEditable: function(value){
    return new TextboxListBitEditable(this.textboxlist, value);
  },
  
  // this function inserts 
  assignInputs: function() {
    
  },
  
  add: function(val){
    var box = this.createBitBox();
    
  },
  
  focus: function(){
    return this;
  },
  
  blur: function(){
    return this;
  },
  
  update: function(){
    this.element.set('value', this.encode(this.bits.getValues()));
    return this;
  },
  
  encode: function(obj){
    return JSON ? JSON.encode(obj) : obj.toQueryString();
  },
  
  decode: function(string){
    return JSON ? JSON.decode(string) : string.toHash();
  }
  
});


var TextboxListBit = new Class({
  
  Mixins: 'TextboxListBit',
  
  Implements: Options,
  
  initialize: function(container, value, uid, features) {
    this.value = value;
    this.uid = uid || value;
    this.container = $(container);
    this.registerMixins(features);
    this.create();
  },
  
  toElement: function(){
    return this.element
  },
  
  is: function(type) {
    return $splat(this.types).contains(type);
  },
  
  create: function(){    
    var toggle = function() { this.toggleClass(this.type + '-hover'); }.bind(this);
    this.element = new Element('li', { 'class': this.type, 'html': this.value }).addEvents({
      'mouseenter': toggle,
      'mouseleave': toggle
    });
  },
  
  replaceWith: function(bit){
    bit.inject(this, 'after');
    this.destroy();
  },
  
  inject: function(element, where){
    this.element.dispose();
    this.element.inject(element, where);
  },
  
  destroy: function(){
    this.element.destroy();
  },
  
  setValue: function(v){
    this.value = v;
    this.element.set('html', v);
  },
  
  getValue: function(){
    return this.value;
  },
  
  focus: $empty,
  
  blur: $empty
  
});


var TextboxListBitEditable = new Class({
  
  Extends: TextboxListBit,
  
  options: {
    resizable: {}
  },
  
  type: 'bit-editable',  
  
  toElement: function(){
    return $pick(this.input, this.element);
  },
  
  create: function(){
    this.parent();
    this.native = $defined(this.container.contentEditable);
    this.element.set('html', '').set('contentEditable', true);
    
    if(! this.native)
      this.input = $(new InputResizable(new Element('input', { 'type': 'text', 'class': this.type + '-input' }).inject(this.element), this.options.resizable)).inject(this.element);
    
    new PropertyObserver(this, this.native ? 'html' : 'value', function(v) {
      this.setValue(v);
    }.bind(this));
    
    this.element = new Element();    
  },
  
  setValue: function(v){
    if(this.native) this.parent();
    else {
      this.value = v;
      this.input.set('value', v);
    }
  },
  
  focus: function(){
    $(this).focus();
  },
  
  blur: function(){
    $(this).blur();
  }
  
});


var TextboxListBitEditableSmall = new Class({

  

});


var TextboxListBitBox = new Class({
  
  Mixins: 'TextboxListBitBox',
  
  Extends: TextboxListBit,
  
  type: 'bit-box'
  
});


var TextboxListBitBoxClosable = new Mixin('TextboxListBitBox', {

  
    
});


var TextboxListAutocomplete = new Mixin('TextboxList', {
  
  afterInit: function() {
    console.log('autocomplete init');
  },
  
  autoFeed: function() {
    
  }
  
});


var TextboxListEnter = new Mixin('TextboxList', {
  
  afterInit: function() {  
    console.log('enter init');
  }
  
});


var TextboxListDrag = new Mixin('TextboxList', {
  
  add: function() {
    // when a box is added, make it draggable
  }
  
});
/*
  Moogets - TextboxList 0.2
  - MooTools version required: 1.2
  - MooTools components required: Element.Event, Element.Style and dependencies.
  
  Credits:
  - Idea: Facebook + Apple Mail
  - Caret position method: Diego Perini <http://javascript.nwbox.com/cursor_position/cursor.js>
  
  Changelog:
  - 0.1: initial release
  - 0.2: code cleanup, small blur/focus fixes
*/

/* Copyright: Guillermo Rauch <http://devthought.com/> - Distributed under MIT - Keep this message! */

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


Element.implement({
  
  getCaretPosition: function() {
    if (this.createTextRange) {
      var r = document.selection.createRange().duplicate();
    	r.moveEnd('character', this.value.length);
    	if (r.text === '') return this.value.length;
    	return this.value.lastIndexOf(r.text);
    } else return this.selectionStart;
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
    this.data = new Hash;
    this.events = new Hash;
    this.original = $(element);

    this.registerMixins(this.options.features);
    this.afterInit();
  },
  
  afterInit: function() {
    this.prepare();
    this.create();
    this.set();
  },

  prepare: function(){
    try {
      this.original.blur();
    } catch(e) {}
    this.original.setStyle('display', 'none');
  },
  
  create: function(){
    this.textboxlist = new Element('div', { 'class': this.options.cssclass });
    this.inputs = new Element('ul', { 'class': this.options.cssclass + '-inputs' }).inject(this.textboxlist);
    
    if(this.options.inject)
      this.textboxlist.inject(this.original, $type(this.options.inject) == 'string' ? this.options.inject : null);
  },
  
  set: function(){
    
  },
  
  createBitBox: function(data){
    var klass = this.options.boxclass || TextboxListBitBox;
    return new klass(this, data);
  },
  
  createBitEditable: function(data){
    return new TextboxListBitEditable(this, data);
  },
  
  // this function inserts 
  assignInputs: function() {
    
  },
  
  add: function(data){
    var bit = this.createBit(data);
  },
  
  createBit: function(data){
    if($type(data) == 'string') data = { text: data };
    if(! data.id) data.id = this.data.length + 1
    if(! data.html) data.html = data.text;
    data.object = this.createBitBox(data);
    this.data.set(data.id, data);    
    return data.id;
  },
  
  destroyBit: function(id){
    if(this.data.has(id)){
      if($(this.data.get(id).object)) $(this.data.get(id).object).destroy();
      this.data.erase(id);
    }    
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
  
  initialize: function(parent, data) {
    this.parent = parent;
    this.data = data;
    this.container = parent.textboxlist;
    this.registerMixins(parent.options.features);
    this.create();
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
    return this.element;
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
    this.parent.destroy(this.data.id);
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
  
  create: function(){
    this.parent();
    this.native = $defined(this.container.contentEditable);
    this.element.set('html', '').set('contentEditable', true);
    
    if(! this.native)
      this.input = $(new InputResizable(new Element('input', { 'type': 'text', 'class': this.type + '-input' }).inject(this.element), this.options.resizable)).inject(this.element);
    
    new PropertyObserver(this, { 
      property: this.native ? 'html' : 'value',
      onChange: function(v) { this.setValue(v); }.bind(this)
    });
  
    return this.element;
  },
  
  setValue: function(v){
    this.value = v;
    $(this).set(this.native ? 'html' : 'value', v);
  },
  
  getValue: function(){
    return this.value;
  },
  
  focus: function(){
    $(this).focus();
  },
  
  blur: function(){
    $(this).blur();
  }
  
});


var TextboxListBitEditableSmall = new Class({

  Extends: TextboxListBitEditable,
  
  

});


var TextboxListBitBox = new Class({
  
  Extends: TextboxListBit,
  
  type: 'bit-box'
  
});


var TextboxListBitBoxClosable = new Class({

  Extends: TextboxListBitBox,

  create: function(ret){
    this.parent();
    this.element.adopt(new Element('a', { 'class': 'bit-box-closable' }).addEvent('click', function(){
      this.destroy();
    }));
  }
    
});


var TextboxListAutocomplete = new Mixin('TextboxList', {
  
  afterInit: function(){
    this.autodata = new Hash;
  },
  
  createBit: function(ret, data){
    var index = data.index ? data.index : (String.standarize ? String.standarize(data.text) : data.text);
    this.data[index].index = index;
  },
  
  autoFeed: function(data, customhtml){
    this.autodata.set(data.index, [data, customhtml]);
  }
  
});


var TextboxListEnter = new Mixin('TextboxList', {
  
  afterInit: function() {  
    
  }
  
});


var TextboxListDrag = new Mixin('TextboxList', {
  
  add: function(ret) {
    ret.makeDraggable({ container: this.textboxlist });
  }
  
});
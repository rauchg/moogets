var Playground = {
  
  init: function() {    
    var list = new TextboxList('sample_input', { features: ['enter', 'autocomplete'] });    
    list.autoFeed('test');
  }
  
};

window.addEvent('domready', function() {
  Playground.init();
});
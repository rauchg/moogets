/*
Script: PlaceholderInput.js
	Specs for PlaceholderInput.js

License:
	MIT-style license.
*/

(function(){
	
	window.addEvent('domready', function(){
	
		var testInput = new Element('input', { 'type': 'text', 'placeholder': 'Your name' }).inject(document.body);
		var testInput2 = new Element('input', { 'type': 'text', 'value': 'value', 'placeholder': 'Your name' }).inject(document.body);
	
		new PlaceholderInput(testInput);
		new PlaceholderInput(testInput2);	
	
	});
	
	describe('PlaceholderInput', {

		'should return the placeholder when accessing the value directly': function(){
			value_of(testInput.value).should_be(testInput.placeholder);
		},
		
		'should return an empty string and not the placeholder': function(){
			value_of(testInput.get('value')).should_be('');
		},
		
		'should return the set value and not the placeholder': function(){
			value_of(testInput2.get('value')).should_be('value');
		}

	});
})();

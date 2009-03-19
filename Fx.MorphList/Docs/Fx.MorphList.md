Class: Fx.MorphList {#Fx-MorphList}
=============================

### Syntax:

	var myMorphList = new Fx.MorphList(element, options);

### Arguments:

1. element - (*object*) The list to animate
2. options - (**)

#### Options:

* bg - (*object*) The background element properties.

### Returns:

* (*object*) A new *Fx.MorphList* instance.

## Events:

### click

* (*function*) When an element of the list is clicked

### morph

* (*function*) When the background morphs

Fx.MorphList Method: setCurrent {#Fx-MorphList:setCurrent}
-----------------------------------------------------

### Syntax:

  myMorphList.setCurrent(myListChild);

### Arguments:

1. el - (*object*) The element of the list where the background will be set.
2. effect - (*boolean*, defaults to false) If set to true, the background will fade in behind the element.

### Returns:

* (*object*) This *Fx.MorphList* instance.

Fx.MorphList Method: morphTo {#MorphList:morphTo}
-----------------------------------------------

### Syntax:

  myMorphList.morphTo(myListChild);

### Arguments:

1. to - (*object*) The element of the list to morph and move the background to.

### Returns:

* (*object*) This *Fx.MorphList* instance.



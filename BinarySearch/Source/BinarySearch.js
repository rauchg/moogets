/*
Script: BinarySearch.js
	Adds a binary search method to arrays

	License:
		MIT-style license.

	Authors:
		Guillermo Rauch
		
	Credits:
		Based on <http://www.fullposter.com/snippets.php?snippet=3&cat=323>
*/

Array.implement({
  
  binarySearch: function(str, insensitive, partial, subIndex, findLast){
  	str = insensitive ? str.toLowerCase() : str;
  	var low = 0, high = this.length - 1, useHigh = (this[0] > this.getLast()), ret = null;
  	while (low <= high){
      var atry = ((low + high) / 2).toInt();
      var check = $chk(subIndex) ? this[atry][subIndex] : this[atry];
      check = partial ? check.substr(0, str.length) : check;
      if (useHigh){
        if (check > find) { low = atry + 1; continue; }
    		if (check < find) { high = atry - 1; continue; }
      } else {
        if (check < find) { low = atry + 1; continue; }
    		if (check > find) { high = atry - 1; continue; }
      }
			if (!findLast) return atry;
			else ret = atry;
    }
  	return ret;
  }  
  
});
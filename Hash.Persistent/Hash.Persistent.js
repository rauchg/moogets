/*
Script: Hash.Persistent.js
	A Hash that stays in the client for long periods of time

	License:
		MIT-style license.

	Authors:
		Guillermo Rauch
*/

Hash.Persistent = new Class({
  
  Implements: Options,
  
  options: {
    provider: null,
		check: null,
		expires: false
  },
  
  initialize: function(name, options, context) {
    this.name = name;
    this.setOptions(options);
		this.context = context || document;
    this.load();
		this.context.getWindow().addEvent('unload', this.save.bind(this), true);
  },
  
  save: function() {
    if(this.provider) this.provider.store(this.name, JSON.encode([$time(), this.hash]));
  },
  
  load: function() {
		this.provider = this.options.provider ? Hash.Persistent.Providers[this.options.provider] : Hash.Persistent.Provider;
		if (!this.provider) {
			var providers = ($splat(this.options.check) || Hash.Persistent.Providers).filter(function(o) { 
				return o.check.run(this.context, o); 
			});
			if (providers[0]) this.provider = Hash.Persistent.Provider = providers[0];
		}
		if (this.provider){
			this.provider.init(this.context);
			var data = JSON.decode(this.provider.retrieve(this.name));
	    this.hash = $H((data && (this.options.expires === false || (this.options.expires + data[0]) > $time())) ? data[1] : {});			
		}	
  }
  
});

Hash.Persistent.implement((function(){
	
	var methods = {};
	
	Hash.each(Hash.prototype, function(method, name){
		methods[name] = function(){
			return method.apply(this.hash, arguments);
		};
	});
	
	return methods;
	
})());

Hash.Persistent.Providers = {};
Hash.Persistent.ProvidersSQL = {
	
	'create':   "CREATE TABLE IF NOT EXISTS hash (k VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY, v TEXT NOT NULL)",
	'select':   "SELECT value FROM hash WHERE k = ?",
	'insert':   "INSERT INTO hash(k, v) VALUES (?, ?)",
	'delete':   "DELETE FROM hash WHERE k = ?"
	
};

Hash.Persistent.Providers.ie = {
  
  check: function() {
		return Browser.Engine.trident;
  },

	init: function(context) {		
		this.body = context.getDocument().body;		
	},
	
	element: function(id) {
		if($('hash_persistent-' + id)) return $('hash_persistent-' + id);
		var el = new Element('div', { 'id': 'hash_persistent-' + id }).inject(this.body);
		el.addBehavior('#default#userData');
		return el;
	},
  
  retrieve: function(key) {    
		return this.element(key).getAttribute('data');
  },
  
  store: function(key, value) {    
    this.element(key).setAttribute('data', value);
  },
  
  eliminate: function(hash) {
    this.element(key).removeAttribute('data');
  }
  
};

Hash.Persistent.Providers.html5session = {
  
  check: function(context) {
		return context.getWindow().sessionStorage;
  },
  
	init: function(context) {
		this.window = context.getWindow();
	},

  retrieve: function(key) { 
		return this.window.sessionStorage[key]; 
	},
  
  store: function(key, value) { 
		this.window.sessionStorage[key] = value; 
	},
  
  eliminate: function(hash) { 
		delete this.window.sessionStorage[key]; 
	}
  
};

Hash.Persistent.Providers.html5local = {
  
  check: function(context) {
		return context.getWindow().localStorage;
  },
  
	init: function(context) {
		this.window = context.getWindow();
	},

  retrieve: function(key) { 
		return this.window.localStorage[key]; 
	},
  
  store: function(key, value) { 
		this.window.localStorage[key] = value; 
	},
  
  eliminate: function(hash) { 
		delete this.window.localStorage[key];
	}
  
};

Hash.Persistent.Providers.whatwg_db = {
	
	check: function(context) {
		if(context.getWindow().openDatabase)
		{
			this.db = context.getWindow().openDatabase('hash-persistent', '1.0', 'Hash.Persistent storage', 1024 * 1024);
			return !! this.db;
		}
		return false;
	},
	
	execute: function() {
		var a = arguments;
		this.db.transaction(function(tx) { tx.executeSql.run(a); });
	},
	
	init: function() {
		this.execute(Hash.Persistent.ProvidersSQL.get('create'));
	},
	
	retrieve: function(key) {
		var r = null;
		this.execute(Hash.Persistent.ProvidersSQL.get('select'), key, function(tx, result) {
			if(result.rows.item(0)) r = result.rows.item(0)['v'];
		});
		return r;
	},
	
	store: function(key, value) {
		this.eliminate(key);
		this.execute(Hash.Persistent.ProvidersSQL.get('insert'), [key, value]);
	},
	
	eliminate: function(key) {
		this.db.execute(Hash.Persistent.ProvidersSQL.get('delete'), key);
	}
	
};

Hash.Persistent.Providers.gears = {
	
	check: function(context) {
		return context.getWindow().google && google.gears;
	},
	
	init: function() {
		this.db = google.gears.factory.create('beta.database', '1.0');
		this.db.open('hash-persistent');
		this.db.execute(Hash.Persistent.ProvidersSQL.get('create'));
	},
	
	retrieve: function(key) {
		var rs = this.db.execute(Hash.Persistent.ProvidersSQL.get('select'), key);
		return rs.isValidRow() ? rs.field(0) : false;
	},
	
	store: function(key, value) {
		this.eliminate(key);
		this.db.execute(Hash.Persistent.ProvidersSQL.get('insert'), [key, value]);
	},
	
	eliminate: function(key) {
		this.db.execute(Hash.Persistent.ProvidersSQL.get('delete'), key);
	}
	
};

Hash.Persistent.Providers.swiff = {
  
  check: function() {
		return Browser.Plugins.Flash;
  },

	init: function(context) {
		this.el = $(new Swiff('hash.storage.swf')).inject(context.getDocument().body);
	},
  
  retrieve: function(key) {
    return this.el.get(key);
  },
  
  store: function(key, value) {    
    this.el.store(key, value);
  },
  
  eliminate: function(key) {
    this.el.remove(key);
  }
  
};
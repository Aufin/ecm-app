function EntityMap () {}

Object.assign(EntityMap.prototype, {
    typeCache: {},
    typeMap: function (typeName) {
	return ((m) => {
	    if (typeof m == 'undefined') {
		m = new Map();  this.typeCache[typeName] = m ; return m}
	    return m;
	})(this.typeCache[typeName])
    },
    objectVector: function(typeName, key) {
	const imap = this.typeMap(typeName)
	 return ((v) => { if (!v) { v = [] ; imap.set(key, v)}
			      return v;
			    })(imap.get(key))
    },
    addObject: function(typeName, key, object) {
	const ref = new WeakRef(object),
	      vec = this.objectVector(typeName, key)
	vec.push(ref)
    },
    getObjects: function(typeName, key) {
	const rv = [], ov = [] 

	this.objectVector(typeName, key).forEach((ref) => {
	    const obj = ref.deref();
          
	    if (typeof obj != 'undefined') {
		rv.push(ref)
		ov.push(obj);
	    }
	})

	// remove GC'd objects
	this.typeMap(typeName).set(key, rv);
	
	return ov
    },
    changeEvent: function (obj) {
	return new CustomEvent("build", { detail: obj })
    },
    onchange: function (obj) { return obj }
})

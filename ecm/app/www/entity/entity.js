function Entity (type, keyName, init, options) {
    console.log("Got Entity make?", type, keyName, init, options)
    const object = typeof init != "number" ? init : (o => { o[keyName] = init; return o })({}),
	  key = object[keyName],
	  typeName = typeof type == 'function' ? type.name : type,
          cache = window.ECM.entityCache,
	  cacheobj = {}, //cache.get(typeName, key),
	  obj = Object.assign(cacheobj || {}, object)
    
    Object.assign(this, { obj, keyName, typeName })
    //this.cache.set(key, obj)

    // this.getMappedInstances(typeName, key).forEach(e => {
    //    e.onchange(obj)
    // })
    

    //return this;
    return new Proxy(this, {
	get: (target, key) => {
            if (key === "identity") { return this }
            return target.obj[key];
	}
    })
}

Entity.define = function (constructor, proto = Entity.prototype) {
    Object.setPrototypeOf(constructor.prototype, proto)
}

Object.assign(Entity.prototype, {
    cache: false,
    // If we keep track of all entities then we can have a "change"
    // event.
    instances: {},
    instancesMap: function (typeName) {
	return ((m) => {
	    if (typeof m == 'undefined') { m = new Map();  this.instances[typeName] = m ; return m}
	    return m;
	})(this.instances[typeName])
    },
    instanceVector: function(typeName, key) {
	const imap = this.instancesMap(typeName)
	 return ((v) => { if (!v) { v = [] ; imap.set(key, v)}
			      return v;
			    })(imap.get(key))
    },
    addInstanceToMap: function(typeName, key, instance) {
	const ref = new WeakRef(instance),
	      vec = this.instanceVector(typeName, key)
	vec.push(ref)
    },
    getMappedInstances: function(typeName, key) {
	const rv = []
	this.instanceVector(typeName, key).forEach(ref => {
	    const obj = ref.deref();
          
	    if (typeof obj != 'undefined') { rv.push(obj) }
	})
	return rv
    },
    changeEvent: function (obj) {
	return new CustomEvent("build", { detail: obj })
    },
    onchange: function (obj) { return obj }
})

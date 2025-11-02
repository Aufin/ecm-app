function EntityCache() {
// init the db
    this.db;
}

Object.defineProperty(EntityCache.prototype, "db", {
    get() {
	  const edb  = this.entityDB
	  if (edb) {
	      return edb.db
	  }
	const proto = Object.getPrototypeOf(this)
	  proto.entityDB = new EntityDB()
	  return proto.entityDB
    }
})

Object.assign(EntityCache.prototype, {
    entityMap: new EntityMap(),
    entityDB: false,
    set(typeName, key, value) {
	const db = this.db,
	      tranny = db.transaction(typeName, "readwrite"),
	      store = tranny.objectStore(typeName),
	      addReq = store.put(value),
          that = this

	addReq.onsuccess = function(event) {
	    // Data added successfully
	    that.entityMap.getObjects(typeName,key).forEach((entity) => {
		console.log('got entity?', entity)
		entity.identity.onchange(value)
	    })
	}

	return value;
    },
    get(typeName, key) {
	const db = this.db,
	      tranny = db.transaction(typeName),
	      store = tranny.objectStore(typeName)
	return store.get(value)
    }
	
})

function EntityDB () {
 // Let us open our database
    const request = window.indexedDB.open(this.dbName, this.dbVersion),
	  that = this
    
    Object.assign(this, { request, error: false, db: false })

    request.onerror = (event) => { that.error = event }
    request.onsuccess = (event) => {
	that.db = event.target.result
	const db = this.db

	db.onerror = (event) => {
	    // Generic error handler for all errors targeted at this database's
	    // requests!
	    console.error(`Database error: ${event.target.error?.message}`);
	    that.error = event
	}

    }

    
    request.onupgradeneeded = (event) => {
	const db = event.target.result,
	      oldv = event.oldVersion,
	      newv = event.newVersion
	      
	console.log('update needed', oldv, newv, db, db.version)
	this.init(db, oldv, newv)
    }


}

Object.assign(EntityDB.prototype, {
    dbName: "EcmEntityDB",
    dbVersion: 1,
    init: function (db, oldVersion, newVersion) {
	for (let v = oldVersion + 1; v <= newVersion; v++) {
	    console.log
	    const initfn = this.initHandlers[v]
            console.log('calling init', v, initfn)
	    initfn.call(this, db)
	}
    },
    initHandlers: [
	function (db) { null; },
	function (db) {
	    const stores = {
		Claim: db.createObjectStore("Claim", { keyPath: "claim_id" }),
		Risk: db.createObjectStore("Risk", { keyPath: "risk_id" }),
		Loss: db.createObjectStore("Loss", { keyPath: "loss_id" }),
		Policy: db.createObjectStore("Policy", { keyPath: "policy_id" }),
		Contract: db.createObjectStore("Contract", { keyPath: "contract_id" }),
		Person: db.createObjectStore("Person", { keyPath: "person_id" }),
		User: db.createObjectStore("User", { keyPath: "app_user_id" }),
		Timecard: db.createObjectStore("Timecard", { keyPath: "timecard_id" }),
		Attachment: db.createObjectStore("Attachment", { keyPath: "attachment_id"}),
		Transaction: db.createObjectStore("Transaction", { keyPath: "transaction_id"})
	    }
	    
	    this.stores = stores;
	}
    ]
	    
	    
		  
})

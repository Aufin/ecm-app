globalThis._debug_ = globalThis._debug_ || {}

function BordereauReport(parent) {
    EcmElement.call(this, parent)
    parent.innerHTML = this.innerHTML;
    const typeParent = parent.querySelector('[data-bdx-type]'),
          typeSel = new EcmSelect(typeParent),
          riskParent = parent.querySelector('[data-bdx-risk]'),
          riskSel = new EcmSelect(riskParent),

          startDateInput = parent.querySelector('[data-ecm-start-date]'),
	  startDateTime = new EcmDateTime(startDateInput),
          endDateInput = parent.querySelector('[data-ecm-end-date]'),
          hasEndDateBeenSet = false,
	  endDateTime = new EcmDateTime(endDateInput),
          endDate = luxon.DateTime.now().startOf('month').toISODate(),
          startDate = luxon.DateTime.fromISO(endDate).minus({month: 1}).toISODate(),
          syndicateParent = parent.querySelector('[data-bdx-syndicate]'),
          syndicateSelect = new EcmSelect(syndicateParent),
          agencyParent = parent.querySelector('[data-bdx-agency]'),
          agencySelect = new EcmSelect(agencyParent),
          contractParent = parent.querySelector('[data-bdx-contract]'),
          contractSelect = new EcmSelect(contractParent),
          forSelect = parent.querySelector('[data-bdx-for]'),
          switcher = parent.querySelector('[data-bdx-switcher]'),
          progress = parent.querySelector('[data-bdx-progress]'),
          show = (val) => {
	      val = val || forSelect.value
	      UIkit.switcher(switcher).show(['syndicate', 'agency', 'contract'].indexOf(val))
	  },
	  runBtn = parent.querySelector('[data-bdx-run]'),
	  that = this,
	  ps = {},
	  spinner = ((p = document.createElement('p')) => {
              p.innerHTML = 'Loading ... &nbsp;&nbsp;<span class="uk-align-center" uk-spinner></span>'
              return p })(),
	  table =  parent.querySelector('[data-bdx-table]'),
          accordion = parent.querySelector('[uk-accordion]')
	  

    _debug_.bdx = this

    Object.assign(this, {
	type:  { parent: typeParent, select: typeSel },
	risk:  { parent: riskParent, select: riskSel },
	start: { input: startDateInput, datetime: startDateTime },
	end: { input: endDateInput, datetime: endDateTime },
	"for": { select: forSelect },
        syndicate: { parent: syndicateParent, select: syndicateSelect},
        agency: { parent: agencyParent, select: agencySelect},
        contract: { parent: contractParent, select: contractSelect},
	switcher, show, runBtn, progress, table, spinner, accordion
    })
    this.progress.style.display = 'none'
    runBtn.onclick = () => {
	this.progress.style.display = ''
	this.runReport ()
    }
    this.show()

    forSelect.onchange = (...args) => {
	that.show();
	[that.syndicate, that.contract, that.agency].forEach( el => {
	 el.select.input.classList.remove('uk-form-danger')
     })
	console.log('fired onchange', ...args);
    }
    console.log("Bordereau Report", this)

    this.getTypes().then(types => {
	const opts = types.map(type => ({ text: type, value: type }))
	opts.forEach(o => typeSel.addOption(o))
	
	typeSel.selectOption(opts[0])
    })
    this.getRiskTypes().then(types => {
	types.forEach(([o]) => riskSel.addOption(o))
    })


    
    this.getSyndicates().then(syns => {
        console.log('sydicates', syns)
	syns.forEach(([o]) => syndicateSelect.addOption(o))
    })

    this.getAgencies().then(agns => {
        console.log('agencires', agns)
	agns.forEach(([o]) => agencySelect.addOption(o))
    })
    this.getContracts().then(cons => {
        console.log('contracts', cons)
	cons.forEach(([o]) => contractSelect.addOption(o))
    })


    startDateTime.val(startDate, undefined, false)
    endDateTime.val(endDate, undefined, false)
    startDateTime.onChange = (val) => {
	
	//console.log('Start Date change, end date?', val, hasEndDateBeenSet)
    }

    


    
    // this.ECM.initElement(parent.firstElementChild);

    
}

Object.assign(BordereauReport.prototype, {
    makeRequest() {
	const type = this.type.select.output.value,
	      start = this.start.input.value,
	      end = this.end.input.value,
              fore = this.for.select.value,
              syndicate_id = this.syndicate.select.output.value,
              agency_id = this.agency.select.output.value,
              contract_id = this.contract.select.output.value,
	      risk = this.risk.select.output.value,
              forObj = ((f = fore) => {
		  if (f === 'syndicate') {
		      return { syndicate_id }
		  } else if (f === 'contract') {
		      return { contract_id }
		  } else if (f === 'agency') {
		      return { agency_id }
		  }
	      })()

        
	return { type, start, end, for: forObj, risk};
    },
    startBordereau: async function(req) {
	const res = await fetch('/rpc/bordereau.ss', {
	    method: 'POST',
	    body: JSON.stringify(req)
	}),
	      json = await res.json()
	this.ps = json
	console.log('ran', json)
	return json
    },
    startWatcher(ps) {
	let pgress = this.progress, that = this
	    currentNumber = 0,
	    datetime = luxon.DateTime.fromISO(ps.timeEstimate),
	    secs = parseInt(datetime.toFormat('s')),
	    mins = parseInt(datetime.toFormat('m')),
	    timeout = ((secs + (mins * 60)) * 1000) / 100,
	    progressFn = () => {
		currentNumber = currentNumber + 1
                if (currentNumber < 95) {
		    pgress.value = currentNumber
		    return currentNumber
		} else { return false }
	    },
	    animate = setInterval(function () {
		if (!progressFn()) { clearInterval(animate) }
	    }, timeout),
	    runIt = setInterval(function () {
		that.startBordereau({status: ps.table_name}).then(({status}) => {
		    console.log("status", ps.table_name, status)
		    if (status !== 'running') {
			clearInterval(runIt)
		    } else {
			if (that.datatable) {
			    console.log("Have Table", that.datatable)
			    that.datatable.datatable && that.datatable.datatable.destroy()
			    that.datatable = false
                            that.table.innerHTML = ""
			}

		    }
		    if (status === 'finished') {
			clearInterval(runIt)
                     
                      that.table.innerHTML = ""
                     that.progress.style.display = 'none'
                     that.progress.value = 0
                     that.spinner.replaceWith(that.runBtn)
                     UIkit.accordion(that.accordion).toggle(0, true);
		     that.getBordereau(ps.table_name);
		    } else if (status !== 'running') {
			console.error(ps.table_name, status)
		    }
		})
	    }, timeout)

	
		    
				
		    
    },
    getBordereau(tableName) {
        const bdx = this.datatable ||
	      new EcmDataTable(
		  this.table,
		  'select * FROM "' + tableName +'"',
		  {  buttons: [
  		      {
  			  extend: 'excelHtml5',
  			  title: '', 
  			  className: 'uk-button uk-button-default',
  			  exportOptions: {
  			     // columns: [0,2,3,4,5,6,7,9,11,13],
  			      orthogonal: 'export' 
  			  }
  		      }
		  ],
		  layout: {
		      topStart: [ 'pageLength', 'buttons']
		  },

		  })
	this.datatable = bdx;
	return bdx;
    },
	
    runReport() {
	const req = this.makeRequest(),
	      type = req.type,
	      fore = req.for,
	      for_id = Object.entries(fore)[0][1],
	      for_keyName = Object.entries(fore)[0][0],
              risk = req.risk,
	      start = req.start,
	      end = req.end
        let run = true
	
        if (!type) {
          this.type.select.input.classList.add('uk-form-danger')
          UIkit.notification('Must select Bordereau Layout type', {status:'danger'});
          run = false
        }
       if (!for_id) {
           let el = false, name = "Item"
          if (for_keyName == "syndicate_id") {
              el = this.syndicate ; name = "Syndicate"
	  } else if (for_keyName == "agency_id") {
	      el = this.agency ; name = "Agency"
	  } else { el = this.contract ;name = "Contract" }

	el.select.input.classList.add('uk-form-danger')
          UIkit.notification('Must select ' + name + ' to continue', {status:'danger'});
          run = false
        }
	if (run) {
            this.runBtn.replaceWith(this.spinner)
	    return this.startBordereau(req).then(ps => {
		this.startWatcher(ps)
	    })
		
	}
	console.log('runReport', req)
    },
    
    innerHTML: `<div class="uk-container">
 
 <ul uk-accordion= "multiple: true">
  <li class="uk-open">
  <a class="uk-accordion-title" href>Run Bordereau</a>
  <div class="uk-accordion-content">
 <div class="uk-padding-small uk-grid-divider uk-child-width-expand@s" uk-grid>
<div>Type:
 <select data-placeholder="Layout" data-bdx-type name="type"></select>
 <select data-placeholder="Risk Type (optional)" data-bdx-risk name="risk"></select>
</div>
<div>
  For: <select data-bdx-for class="uk-select">

    <option value="contract">Contract</option>
    <option value="syndicate" selected="selected">Syndicate</option>
    <option value="agency">Agency</option>
 </select>
<div data-bdx-switcher class="uk-switcher">
<div> <select data-placeholder="Choose Syndicate" class="uk-select" data-bdx-syndicate></select> </div>
 <div> <select data-placeholder="Choose Agency" class="uk-select" data-bdx-agency></select> </div>
 <div> <select data-placeholder="Choose Contract" class="uk-select" data-bdx-contract></select> </div>
</div>
</div>
<div>
 Date Range: <input data-ecm-start-date class="uk-input" type="date">
 <input data-ecm-end-date class="uk-input" type="date">
</div>
</div>
<div class="uk-width-1-1">
<hr>
<button data-bdx-run class="uk-align-center uk-button uk-button-default"> Run </button>
<progress data-bdx-progress class="uk-progress" value="0" max="100"></progress>
<hr>
  </div>
  </div>
 </li>
<li>
<table data-bdx-table></table> </li>
</ul>
</div>`,
    getTypes() {
	return EcmDataTable.submitQuery("SELECT * from report_bdx_type")
	    .then(r => {
		if (r.result) {
		    return r.result.data.map(([a]) => a)
		} else  {
		    console.error("GetTypes error:", r)
                    UIkit.notification('Error ' + r.error.message);
		}
	    })
	    
    },
    getSyndicates() {
	return EcmDataTable.submitQuery(` SELECT
         json_build_object('text', text||open||count||close, 'value', value)  
        FROM (SELECT (contract).syndicate_id as value, 
              person_name((contract).syndicate_id) AS text, 
              ' (' AS open, count(*) AS count , ' claims)' AS close 
               FROM claim_view GROUP BY (contract).syndicate_id) 
         ORDER BY text`).then(r => r.result.data)
    },
    getAgencies() {
	return EcmDataTable.submitQuery(` SELECT
         json_build_object('text', text||open||count||close, 'value', value)  
        FROM (SELECT (contract).agency_id as value, 
              person_name((contract).agency_id) AS text, 
              ' (' AS open, count(*) AS count , ' claims)' AS close 
               FROM claim_view GROUP BY (contract).agency_id) 
         ORDER BY text`).then(r => r.result.data)
    },
  //   getAgencies() {
  // 	return EcmDataTable.submitQuery(`SELECT
  //   json_build_object('text', text, 'value', value)
  // FROM (SELECT (contract).agency_id as value,
  //      person_name((contract).agency_id) ||' ('|| count(*) ||' claims)' AS text
  //        FROM claim_view GROUP BY (contract).agency_id)
  //  ORDER BY text`).then(r => r.result.data)
  //   },
    getContracts() {
	return EcmDataTable.submitQuery(`SELECT
   json_build_object('text', c||ef||ex||agency||syndicate, 'value', value)
      FROM (SELECT contract_id as value, contract_number||' ' as c,
                   effective_date||' to ' AS ef, expiry_date||' ' AS ex,
                  COALESCE(person_name(agency_id), '')||' ' AS agency,
                  COALESCE(person_name(syndicate_id), '') AS syndicate
           FROM contract)  ORDER BY c `).then(r => r.result.data)
    },
    getRiskTypes() {
	return EcmDataTable.submitQuery(`SELECT
    json_build_object('text', text, 'value', value)
  FROM (SELECT type_name as value, description AS text
         FROM risk_type)
   ORDER BY text`).then(r => r.result.data)
    }



    
})

EcmElement.define(BordereauReport, 'data-bordereau-report')
function BordereauBuilder(el) {
    el.removeAttribute('data-bordereau-builder');
    el.innerHTML= this.innerHTML;
    console.log('BordereauBuilder', this, this.currentScript)
    this.fetchDefs()
	.then(json => {
	    this.init(el, json)
	})
    
    
    return this
}

EcmElement.define(BordereauBuilder, 'data-bordereau-builder')


BordereauBuilder.prototype.init = function (el, defs) {
    const select = el.querySelector('select'),
	  esel = new EcmSelect(select),
          types = defs.types,
	  opts = types.map(({name}) => 
	      ({text: name, value: name}))
    Object.assign(this, { defs, types, opts, element: el })
    const cols = this.getCols(types[0]) ; this.cols = cols
    

    

    // First the "type" select
    for (opt of opts) {
	esel.addOption(opt)
    }
    esel.selectOption(opts[0])

    esel.element.classList.add('uk-width-auto')
    

    el.toggleAttribute('data-ecm-bordereau-builder-wrapper')
    ECM.initElement(el);
    ECM.setDOM(el, this);

    // First the "type" select
    for (opt of opts) {
	esel.addOption(opt)
    }
    esel.selectOption(opts[0])

    this.renderCols()

    

    

    

    console.log("Inited BdxBuild",types,  this, opts, this.getCols(types[0]))
    return this
}


BordereauBuilder.prototype.getCols = function (type) {
    const { name } = type,
	  cols = this.defs.cols.filter(({type}) => name == type)
    console.log('cols', cols.sort((a,b) => a.num - b.num))
    return cols.sort((a,b) => a.num - b.num)
}

BordereauBuilder.prototype.colName = function (n) {
    var ordA = 'A'.charCodeAt(0);
    var ordZ = 'Z'.charCodeAt(0);
    var len = ordZ - ordA + 1;
    
    var s = "";
    while(n >= 0) {
        s = String.fromCharCode(n % len + ordA) + s;
        n = Math.floor(n / len) - 1;
    }
    return s;
}

BordereauBuilder.prototype.renderCols = function (_cols) {
    const cols = _cols || this.cols,
	  tbl = this.element.querySelector('table'),
	  renderCol = (col, idx) => {
	      const row = tbl.insertRow(-1),
		    n = row.insertCell(-1),
		    title = row.insertCell(-1),
		    def = row.insertCell(-1),
		    syntax = row.insertCell(-1)
	      
	      n.innerText = col.num + ' (' + this.colName(idx) +')'
	      title.innerText = col.as || col.def
              def.innerText = col.def
              syntax.innerText = col.syntax
	  }

    cols.forEach(renderCol);
}





BordereauBuilder.prototype.fetchDefs = async function () {
    const url = "/rpc/bordereau";
    try {
	const response = await fetch(url);
	if (!response.ok) {
	    throw new Error(`Response status: ${response.status}`);
	}

	const json = await response.json();
	console.log("BDX defs:", json);
	return json;
    } catch (error) {
	console.error(error.message);
    }
}



BordereauBuilder.prototype.innerHTML = `
<table class="uk-table uk-table-small uk-table-divider">\
  <caption>Bordereau: <select></select></caption>
<tr><th>Num</th><th>Title</th><th>Definition</th><th>Syntax</th></table>`

function EcmTimeRecorded(parent, options = {}) {
    const self = this,
	  opts = Object.assign({}, this.defaultOpts, options),
	  spinner = ((p = document.createElement('p')) => {
         	p.innerHTML = 'Loading ... &nbsp;&nbsp;<span uk-spinner></span>'

        	return p })(),
	  edt = _ => this.makeDataTable(parent)
    let drawn = false
    parent.append(spinner)

    this.spinner = spinner
    this.parent = parent
    this.opts = opts

    globalThis._ecm_time_recorded = this;
    // console.error(document.querySelector('.uk-switcher'))

    UIkit.util.on(
	  document.querySelector('.uk-switcher'), "shown",
	  e => {
	      if (!drawn && e.target.contains(spinner)) {
                  drawn = true;
		  this.edt = edt();
		  this.edt.promise.then(r => {
		      spinner.remove() ;
		      //console.log('Finished!', r)
		  });
	      }
		  
		  
	      //console.log("shown", e, parent.contains(spinner))
	  })
}

EcmElement.define(EcmTimeRecorded, 'data-ecm-time-recorded')

EcmTimeRecorded.prototype.query = function (start, end) {
    const st = start || ((s = new Date()) => { s.setDate(0); s.setDate(1);
				  return s.toLocaleDateString('en-CA')
				})(),
	  nd = end || ((e = new Date()) => { e.setDate(1);
			       return e.toLocaleDateString('en-CA')
					   })();
    return `SELECT app_user_id, username,
  sum(billable) + sum(unbillable) as hours,
  sum(billable) as billable,
  sum(unbillable) as unbillable,
  array_to_string(array_agg(claim_id), ', ') AS claims,
  json_object_agg(claim_id, timecards)
 FROM
  (SELECT app_user_id, username, claim_id,
      sum(minutes) AS billable,
      sum(unbillable_hours) AS unbillable,
       json_agg(json_build_object(
       'date', date,
       'hours', minutes + unbillable_hours,
       'billable', minutes,
       'notes', notes,
       'unbillable', unbillable_hours,
       'mileage', mileage_km,
       'disbursements', disbursements
       )) AS timecards

      FROM timecard LEFT JOIN app_user USING(app_user_id)
      WHERE daterange('`+st+`', '`+nd+`') @> date::date
      AND leader_id IS NULL
      GROUP BY app_user_id, username, claim_id) trec 
 GROUP BY app_user_id, username LIMIT 5
  `
}

Object.assign(EcmTimeRecorded.prototype, {
    toISODate: function (date) {
	if (typeof date === 'string') { return date }
        if (date instanceof luxon.DateTime) { 
	    return date.toISODate()
	} else {
	    return this.toISODate(luxon.DateTime.fromJSDate(date))
	}
    },
    defaultOpts: {
	startDate: (d => { d.setDate(0); d.setDate(1) ; return d})(new Date()),
	endDate: (d => { d.setDate(1) ; return d})(new Date())
    },
    makeClaimTable: function (id, cards) {
	console.log("Claim Table", id, cards)
    },
    modalDivHTML: `<div class="uk-modal-container" uk-modal>
 <div class="uk-modal-dialog">
  <button class="uk-modal-close-default" type="button" uk-close></button>
   <div class="uk-modal-header">
    <h2 class="uk-modal-title"></h2>
   </div>
   <div style="padding-top: unset" class="uk-modal-body"></div>
   <div class="uk-modal-footer"></div>
  </div>
 </div>`,
    claimModalTableHTML: `<table class="uk-table uk-table-small compact">
    <caption></caption>
    <thead>
        <tr>
            <th>Date</th>
            <th>Hours</th>
            <th>Billable</th>
            <th>Unbillable</th>
            <th>Mileage</th>
            <th>Disbursments</th>
        </tr>
    </thead>
    <tbody>
    </tbody>
    <tfoot>
        <tr>
            <td></td>
        </tr>
    </tfoot>
</table>`, 
    claimModalDiv: function () {
	if (this._claim_modal_div) { return this._claim_modal_div }
	let div = document.createElement('div')
	div.innerHTML = this.modalDivHTML
        div = div.firstElementChild;
	this._claim_modal_div = div
        this.parent.prepend(div)
        console.log("Have Div", div, this.parent)
	return div
    },

    claimDrawCallback: function () {
     return function (settings) {
	 console.log("Drew table, add notes", settings)

          const api = this.api(),
                rows = api.rows( {page:'current'} )

		rows.every(function () {
		    const node = this.node(),
			  tr = document.createElement('tr'), 
			  td = document.createElement('td'),
                        data = this.data()
		    tr.style.borderBottom = '1px solid lightgray';
                    
		    td.setAttribute('colspan', node.children.length)
		    td.innerHTML= `<div style="display: list-item; "><blockquote cite="#">
    <pre class="uk-margin-remove" style="white-space: pre-wrap;" > Note here </pre>
  </blockquote></div>`
            
		    const pre = td.querySelector('pre')
		    pre.innerHTML = data.notes;
                tr.append(td)
		    node.after(tr)
		    console.log("Got row", this, data)
		})
                
     }
    },

    claimModal: function(id, cards, row, meta) {
       const m = this.claimModalDiv(),
             title = m.querySelector('.uk-modal-title'),
             body = m.querySelector('.uk-modal-body'),
	       start = this.toISODate(this.opts.startDate),
	       end = this.toISODate(this.opts.endDate)

        title.innerHTML='Claim #' + id;
        body.innerHTML = this.claimModalTableHTML
	
	const table = body.firstElementChild,
	      caption = table.querySelector('caption'),
	      dtable = new DataTable(table, {
		  data: cards,
		  drawCallback: this.claimDrawCallback(),
		  paging: false,
		  layout: { topEnd: false },
		  columns: [
		      { data: "date" },
		      { data: "hours" },
		      { data: "billable" },
		      { data: "unbillable" },
		      { data: "mileage" },
		      { data: "disbursements" }
		  ]
	      })
	
              
	caption.innerHTML = "Time for "+row[1]+' from '+start+ ' to '+end 
	// + JSON.stringify(cards);
	UIkit.modal(m).show();
    },
	
    renderClaimsCol: function () {
	return (data, type, row, meta) => {
	    if (type !== "display") { return data }
            let sep = '', span = document.createElement('span')
	    const claims = Object.entries(row[meta.col + 1])
	    
	    console.log("Claims col!", claims)
	    
            for (const [id, cards] of claims) {
                const a = document.createElement('a')
                a.outerHTML = '<a href="#"></a>'
		a.innerHTML = id;
                a.onclick = e => { this.claimModal(id, cards, row, meta); };
		span.append(sep);
		sep = ', '
		span.append(a);
//		console.log('Have a',id,  a, span)
	    }                    return span;
	}

    },
    makeDataTable: function (parent) {
	const edt = new EcmDataTable(
	      parent, this.query(),
	      {
                  colReorder: true,
		  fixedHeader: true,
                  pageLength: 100,
                  //order: [{ name: 'time' }],
		  buttons: [
		      {
			  extend: 'excelHtml5',
			  title: '', //messageTop: 'Fasd',
			  className: 'uk-button uk-button-default',
			  exportOptions: {
			      columns: [0,1,2,4,5],
			      orthogonal: 'export' 
			  }
		      }
		  ],
		  layout: {
		      topStart: [ 'pageLength', 'buttons']
		  } ,
      		  columnDefs: [
    //                   { targets: '_all', className: 'dt-center'},
     		      { targets: [5], width: '70vw', render: this.renderClaimsCol() }
       	//	      { targets: 0, render: this.claimLinkRender() },
      	//	      { targets: 4, render: this.entityLinkRender() },
     	   	  ]
	      });

    edt.table.classList.add('display')
    edt.table.classList.add('compact')
    edt.table.classList.add('row-border')
    return edt;
    },
    entityLink: function (type, id) {
	if (['timecard',
	    'timecard_interim',
	    'attachment',
	    'claim_transaction',
	    'diary_entry'].includes(type)) {
	    return '<a href="/ecm/view?' + type +
		'=' + id + '">&nbsp;' + (type || '') + '&nbsp;</a>';
	}
	else { return type }
    },
    entityLinkRender: function () {
	return (data, type, row, meta) => {
	    if (type == "display") {
                if (data == 'claim') {
                  // console.log(data, row[meta.col - 1], row, meta)
                  return this.claimLink(row[meta.col - 1])
               }
		return this.entityLink(data, meta.col > 0 && row[meta.col - 1])
	    }
	    return data;
	}
    }
})
    

EcmTimeRecorded.prototype.personLink = function (name, id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/view?person=' + id + '">&nbsp;' + name || '' + '&nbsp;</a>';
}

EcmTimeRecorded.prototype.claimLink = function (id, prefix = '') {
    // console.log('Person Link', name, id)
    
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/claim/' + id + '">'+ prefix + '&nbsp;#' + id || '' + '&nbsp;</a>';
}
 
EcmTimeRecorded.prototype.claimLinkRender = function (prefix = '') {
    return (data, type, row, meta) => {
	if (type == "display") {return this.claimLink(data, prefix)} return data;}
}


EcmTimeRecorded.prototype.contractLink = function (name, id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/view?contract=' + id + '">&nbsp;' + name || '' + '&nbsp;</a>';
}

EcmTimeRecorded.prototype.contractLinkRender = function () {
    return (data, type, row, meta) => {
	if (type == "display")
	{return this.contractLink(data, row[meta.col - 1])} return data;}
}
EcmTimeRecorded.prototype.policyLink = function (name, id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/view?contract=' + id + '">&nbsp;' + name || '' + '&nbsp;</a>';
}

EcmTimeRecorded.prototype.policyLinkRender = function () {
    return (data, type, row, meta) => {
	if (type == "display")
	{return this.policyLink(data, row[meta.col - 1])} return data;}
}

EcmTimeRecorded.prototype.dollarRender = function () {
      return (data, type, row, meta) => {
        // console.log('render', data, type, meta)
  	  if (type == "display") {
	      return '$' + Intl.NumberFormat().format(data)
	  }
	  return data;
      }
}

EcmTimeRecorded.prototype.percentRender = function () {
      return (data, type, row, meta) => {
  	  if (type == "display" && data > 0) {
	      return '' + data + '%'
	  }
	  return data;
      }
}

function EcmStaticClaims(parent) {
   EcmElement.call(this,parent);
    const self = this,
	  spinner = ((p = document.createElement('p')) => {
         	p.innerHTML = 'Loading ... &nbsp;&nbsp;<span uk-spinner></span>'

        	return p })(),
	  edt = new EcmDataTable(
	      parent, this.query(),
	      {
                  colReorder: true,
		  fixedHeader: true,
                  order: [{ name: 'time' }],
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
		      topStart: [ 'pageLength', 'buttons',
				  { interval: {
				      num: 3, unit: 'MONTH',
				      onchange: function (e)  {
					  console.log('Wored?', e.detail, self, this)
                                          self.ecmDatatable.query = self.query(this.value)
                                          self.parent.prepend(spinner)
					  self.ecmDatatable.reload().then(_ => {
					      self.spinner.remove()
					  })
				      }
				  }
				  }
				]
		  } ,
      		  columnDefs: [
    //                   { targets: '_all', className: 'dt-center'},
     		      { targets: [3], visible: false},
       		      { targets: 0, render: this.claimLinkRender() },
      		      { targets: 4, render: this.entityLinkRender() },
     	   	  ]
	      });

    this.ecmDatatable = edt
    edt.table.classList.add('display')
    edt.table.classList.add('compact')
    edt.table.classList.add('row-border')
    edt.table.classList.add('dt-center')
    parent.append(spinner)

    this.spinner = spinner
    this.parent = parent

    // console.log("promise?", edt.promise);

    edt.promise.then(r => { spinner.remove() ; console.log('Finished!', r) });
}

EcmElement.define(EcmStaticClaims, 'data-ecm-static-claims')

EcmStaticClaims.prototype.query = function (interval = '3 months') {
    return `SELECT move.claim_id, time, "action" , row_id AS entity_id, "class" as entity, username
FROM claim LEFT JOIN claim_last_movement move USING (claim_id)
WHERE status = 'Open' AND time < (now () - INTERVAL '` + interval +`')`

}

Object.assign(EcmStaticClaims.prototype, {
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
    

EcmStaticClaims.prototype.personLink = function (name, id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/view?person=' + id + '">&nbsp;' + name || '' + '&nbsp;</a>';
}

EcmStaticClaims.prototype.claimLink = function (id, prefix = '') {
    // console.log('Person Link', name, id)
    
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/claim/' + id + '">'+ prefix + '&nbsp;#' + id || '' + '&nbsp;</a>';
}
 
EcmStaticClaims.prototype.claimLinkRender = function (prefix = '') {
    return (data, type, row, meta) => {
	if (type == "display") {return this.claimLink(data, prefix)} return data;}
}


EcmStaticClaims.prototype.contractLink = function (name, id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/view?contract=' + id + '">&nbsp;' + name || '' + '&nbsp;</a>';
}

EcmStaticClaims.prototype.contractLinkRender = function () {
    return (data, type, row, meta) => {
	if (type == "display")
	{return this.contractLink(data, row[meta.col - 1])} return data;}
}
EcmStaticClaims.prototype.policyLink = function (name, id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/view?contract=' + id + '">&nbsp;' + name || '' + '&nbsp;</a>';
}

EcmStaticClaims.prototype.policyLinkRender = function () {
    return (data, type, row, meta) => {
	if (type == "display")
	{return this.policyLink(data, row[meta.col - 1])} return data;}
}

EcmStaticClaims.prototype.dollarRender = function () {
      return (data, type, row, meta) => {
        // console.log('render', data, type, meta)
  	  if (type == "display") {
	      return '$' + Intl.NumberFormat().format(data)
	  }
	  return data;
      }
}

EcmStaticClaims.prototype.percentRender = function () {
      return (data, type, row, meta) => {
  	  if (type == "display" && data > 0) {
	      return '' + data + '%'
	  }
	  return data;
      }
}

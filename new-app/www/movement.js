function EcmClaimMovement(parent) {
    const spinner = ((p = document.createElement('p')) => {
	p.innerHTML = 'Loading ... &nbsp;&nbsp;<span uk-spinner></span>'
	return p })(),
	  edt = new EcmDataTable(
	      parent, this.query_text,
	      {
                colReorder: true,
		    fixedHeader: true,
                serverSide: true,
                ajax: true,
                processing: true,
                order: {
		      "column": 3,
		      "dir": "desc",
		      "name": "time"
		  },
		  buttons: [
		      {
			  extend: 'excelHtml5',
			  title: '', //messageTop: 'Fasd',
			  className: 'uk-button uk-button-default',
			  exportOptions: {
			      columns: [0,2,3,4,5,6,7,9,11,13],
			      orthogonal: 'export' 
			  }
		      },
		      {
			  extend: 'colvis', 
			  className: 'uk-button uk-button-default'
		      }
		  ],
		  layout: {
		      topStart: [ 'pageLength', 'buttons', 'dateRange' ]
		  },
		  columnDefs: [
                      { targets: '_all', className: 'dt-center'}//,
    		      // { targets: [1, 8, 10, 12], visible: false},
     		      // { targets: 0, render: this.claimLinkRender() },
     		      // { targets: [5,6], render: this.dollarRender() },
     		      // { targets: 7, render: this.percentRender() },
     		      // { targets: 11, render: this.contractLinkRender() },
     		      // { targets: 13, render: this.policyLinkRender() },
		      // { targets: [2, 9], render: (data, type, row, meta) => {
		      // 	  if (type == "display") {
		      // 	      return this.personLink(data,  row[meta.col - 1])
		      // 	  }
                      //     return data;
		      // }}
     		  ]});

    // this.data
    table = edt
    edt.table.classList.add('display')
    edt.table.classList.add('compact')
    edt.table.classList.add('row-border')
    edt.table.classList.add('dt-center')
    parent.append(spinner)

    console.log("promise?", edt.promise);

    edt.promise.then(r => { spinner.remove() ; console.log('Finished!', r) });
}

EcmElement.define(EcmClaimMovement, 'data-ecm-claim-movement')

EcmClaimMovement.prototype.query_text = `
  SELECT * FROM claim_movement WHERE claim_id IS NOT NULL AND time > (now () - INTERVAL '2 months')`

EcmClaimMovement.prototype.personLink = function (name, id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/view?person=' + id + '">&nbsp;' + name || '' + '&nbsp;</a>';
}

EcmClaimMovement.prototype.claimLink = function (id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/claim/' + id + '">&nbsp;#' + id || '' + '&nbsp;</a>';
}
 
EcmClaimMovement.prototype.claimLinkRender = function () {
    return (data, type, row, meta) => {
	if (type == "display") {return this.claimLink(data)} return data;}
}

EcmClaimMovement.prototype.contractLink = function (name, id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/view?contract=' + id + '">&nbsp;' + name || '' + '&nbsp;</a>';
}

EcmClaimMovement.prototype.contractLinkRender = function () {
    return (data, type, row, meta) => {
	if (type == "display")
	{return this.contractLink(data, row[meta.col - 1])} return data;}
}
EcmClaimMovement.prototype.policyLink = function (name, id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/view?contract=' + id + '">&nbsp;' + name || '' + '&nbsp;</a>';
}

EcmClaimMovement.prototype.policyLinkRender = function () {
    return (data, type, row, meta) => {
	if (type == "display")
	{return this.policyLink(data, row[meta.col - 1])} return data;}
}

EcmClaimMovement.prototype.dollarRender = function () {
      return (data, type, row, meta) => {
        console.log('render', data, type, meta)
  	  if (type == "display") {
	      return '$' + Intl.NumberFormat().format(data)
	  }
	  return data;
      }
}

EcmClaimMovement.prototype.percentRender = function () {
      return (data, type, row, meta) => {
  	  if (type == "display" && data > 0) {
	      return '' + data + '%'
	  }
	  return data;
      }
}

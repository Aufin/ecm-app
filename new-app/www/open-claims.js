function EcmOpenClaims(parent) {
    const spinner = ((p = document.createElement('p')) => {
	p.innerHTML = 'Loading ... &nbsp;&nbsp;<span uk-spinner></span>'
	return p })(),
	  edt = new EcmDataTable(
	      parent, this.query_text,
	      {
                  colReorder: true,
		  fixedHeader: true, 
		  buttons: [
		      {
			  extend: 'excelHtml5',
			  title: '', //messageTop: 'Fasd',
			  className: 'uk-button uk-button-default',
			  exportOptions: {
			      columns: [0,2,3,4,5,6,7,9,11,13,14],
			      orthogonal: 'export' 
			  }
		      },
		  ],
		  layout: {
		      topStart: [ 'searchPanes', 'buttons', 'pageLength']
		  },
		  searchPanes: {
		      columns: [2]
		  },
		  columnDefs: [
                      { targets: '_all', className: 'dt-center'},
    		      { targets: [1, 8, 10, 12], visible: false},
     		      { targets: 0, render: this.claimLinkRender() },
     		      { targets: [5,6], render: this.dollarRender() },
     		      { targets: 7, render: this.percentRender() },
     		      { targets: 11, render: this.contractLinkRender() },
     		      { targets: 13, render: this.policyLinkRender() },
		      {
			  targets: [2, 9],
			   searchPanes: {
			       initCollapsed: true,
  			       orthogonal: {
  				   display: 'filter'
  			       }
   			   },
			  
			
			render: (data, type, row, meta) => {
			  if (type == "display") {
			      return this.personLink(data,  row[meta.col - 1])
			  }
                          return data;
		      }}
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

EcmElement.define(EcmOpenClaims, 'data-ecm-open-claims')

EcmOpenClaims.prototype.query_text = `
    SELECT claim AS "Claim",
    examiner_id, examiner AS "Examiner",
    line_of_business AS "Line Of Business",
    last_movement::date AS "Last Movement",
    (paid + outstanding_reserve)::numeric AS "Incurred Indemnity",
    outstanding_reserve::numeric AS "Outstanding Indemnity",
    subscription_percent AS "Subscription",
    insured_id, insured AS "Insured",
    contract_id, contract_number AS "Contract",
    policy_id, policy_number AS "Policy",
    (SELECT value FROM loss_detail
     WHERE claim = claim_id AND "key" = 'Loss Province' LIMIT 1) AS "Province"


FROM (
    SELECT
     claim_id AS claim,
     adjuster_id AS examiner_id, person_short_name(adjuster_id) AS examiner,
    line_of_business, max(time) AS last_movement,
    (claim_indemnity(claim_id)).*, subscription_percent,
    (policy).insured_id, person_name((policy).insured_id) AS insured,
    (policy).policy_id, (policy).policy_number,
    (contract).contract_id, (contract).contract_number


    FROM claim
    LEFT JOIN claim_movement USING (claim_id)
    LEFT JOIN claim_view USING (claim_id)
    WHERE status = 'Open' GROUP BY claim_id, policy, contract ) openc
    
`

EcmOpenClaims.prototype.personLink = function (name, id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/view?person=' + id + '">&nbsp;' + name || '' + '&nbsp;</a>';
}

EcmOpenClaims.prototype.claimLink = function (id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/claim/' + id + '">&nbsp;#' + id || '' + '&nbsp;</a>';
}
 
EcmOpenClaims.prototype.claimLinkRender = function () {
    return (data, type, row, meta) => {
	if (type == "display") {return this.claimLink(data)} return data;}
}

EcmOpenClaims.prototype.contractLink = function (name, id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/view?contract=' + id + '">&nbsp;' + name || '' + '&nbsp;</a>';
}

EcmOpenClaims.prototype.contractLinkRender = function () {
    return (data, type, row, meta) => {
	if (type == "display")
	{return this.contractLink(data, row[meta.col - 1])} return data;}
}
EcmOpenClaims.prototype.policyLink = function (name, id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/view?policy=' + id + '">&nbsp;' + name || '' + '&nbsp;</a>';
}

EcmOpenClaims.prototype.policyLinkRender = function () {
    return (data, type, row, meta) => {
	if (type == "display")
	{return this.policyLink(data, row[meta.col - 1])} return data;}
}

EcmOpenClaims.prototype.dollarRender = function () {
      return (data, type, row, meta) => {
        // console.log('render', data, type, meta)
  	  if (type == "display") {
	      return '$' + Intl.NumberFormat().format(data)
	  }
	  return data;
      }
}

EcmOpenClaims.prototype.percentRender = function () {
      return (data, type, row, meta) => {
  	  if (type == "display" && data > 0) {
	      return '' + data + '%'
	  }
	  return data;
      }
}

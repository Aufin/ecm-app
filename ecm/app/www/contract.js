function EcmContractsPage (parent) {
    const spinner = ((p = document.createElement('p')) => {
	p.innerHTML = 'Loading ... &nbsp;&nbsp;<span uk-spinner></span>'
	return p })(),
	  edt = new EcmDataTable(
	      parent, this.query_text,
	      {
                
		  buttons: [
		      {
			  extend: 'excelHtml5',
			  title: '',
			  className: 'uk-button uk-button-default',
                          exportOptions: {
			      columns: [1,2,3,4,5,7,9,11,13],
			      orthogonal: 'export' 
			  }

		      },
		      {
			  extend: 'colvis', 
			  className: 'uk-button uk-button-default'
		      }
		  ],
		  layout: {
		      topStart: [ 'pageLength', 'buttons' ]
		  },
		  columnDefs: [
                      { targets: '_all', className: 'dt-center'},
		      { targets: [0,6,8,10,12], visible: false},
		      { targets: 1, render: function (data, type, row, meta) {
			  if (type == "display") {
			      console.log('render', data, type, row, meta)
			      return '<a style="display:inline-block; width:100%" href="/ecm/view?contract=' + row[0] + '">&nbsp;' + data || '' + '&nbsp;</a>';
			  }
			  return data;
		      }},
		      { targets: [7,9,11,13], render: (data, type, row, meta) => {
			  if (type == "display") {
			      return this.personLink(data,  row[meta.col - 1])
			  }
                          return data;
		      }}
		      ]});

    this.datatable = edt
    edt.table.classList.add('display')
    edt.table.classList.add('compact')
    edt.table.classList.add('row-border')
    edt.table.classList.add('dt-center')
    parent.append(spinner)

    console.log("promise?", edt.promise);

    edt.promise.then(r => { spinner.remove() ; console.log('Finished!', r) });
}

EcmElement.define(EcmContractsPage, 'data-ecm-contracts-page')

EcmContractsPage.prototype.query_text = `SELECT
   contract_id, contract_number,
  effective_date::date, expiry_date::date,
  (SELECT count(*) FROM risk LEFT JOIN claim USING (risk_id)
    WHERE risk.contract_id = contract.contract_id) AS "Claims",
  (SELECT count(*) FROM risk LEFT JOIN claim USING (risk_id)
    WHERE risk.contract_id = contract.contract_id AND status = 'Open') AS "Open Claims",
  agency_id, person_name(agency_id) AS "Agency", 
  syndicate_id, person_name(syndicate_id) AS "Syndicate",
  london_broker_id, person_name(london_broker_id) AS "London Broker",
  insurance_company_id, person_name(insurance_company_id) AS "Insurance Company"
  -- ,*
 from contract`

EcmContractsPage.prototype.personLink = function (name, id) {
    // console.log('Person Link', name, id)
    if (id == null || name == null) { return '' }
    return '<a href="/ecm/view?person=' + id + '">&nbsp;' + name || '' + '&nbsp;</a>';
}

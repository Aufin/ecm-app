function UserTimeRecorded(parent) {
    parent.innerHTML = this.innerHTML
    const table = parent.querySelector('table'),
          timelog = parent.querySelector('table[data-timelog]'),
          runBtn = parent.querySelector('[data-ecm-run]'),
   	  user_id = ECM.currentUser().user_id,
	  start = new EcmDateTime(
	      parent.querySelector('[data-ecm-start-date]'),
	      { format: 'yyyy-MM-dd HH:mm ZZ' }
	  ),
	  end = new EcmDateTime(
	      parent.querySelector('[data-ecm-end-date]'),
	      { format: 'yyyy-MM-dd HH:mm ZZ' }
	  )
    Object.assign(this, { table, runBtn, user_id, start, end, timelog })
    console.log("user time recorded", this)
    this.makeGlobalDataTable(this.timelog, user_id)
    runBtn.onclick = _ => { this.runPersonalQuery() }
    return this

    
}

EcmElement.define(UserTimeRecorded, 'data-user-time-recorded')
Object.assign(UserTimeRecorded.prototype, {
    sqlQuery(user_id) {
   	// The ORDER BY date DESC will by taken care of by the
   	// datatable
   	return `SELECT date, claim_id,
             app_user_id AS user_id, username,
             minutes as hours, notes, unbillable_hours,
             mileage_km AS mileage, disbursements
        FROM timecard LEFT JOIN app_user USING (app_user_id)
        WHERE leader_id IS NULL AND app_user_id = ` + user_id
    },
    sqlPersonalQuery(user_id, start, end) {
	const range = "'["+start+","+end+")'::tstzrange"
	return `SELECT claim_id,
      count(*) as cards, sum(minutes) as hours,
         json_agg(notes) as notes,
      sum(unbillable_hours) AS unbillable_hours,
      sum(mileage_km) AS mileage,
      sum(disbursements) AS disbursements,
      min(date) AS start, max(date) AS end
      FROM timecard 
        WHERE leader_id IS NULL AND `+range+` @> date
	    AND app_user_id = ` + user_id +
		` GROUP BY claim_id`
        
    },
    runPersonalQuery() {
	const { table, user_id, start, end } = this,
	      range = luxon.Interval.fromDateTimes(start.value, end.value)
	if (range.isValid) {
	    this.makePersonalDataTable(
		table, user_id, start.value.toString(), end.value.toString()
	    )
	} else {
	    UIkit.notification('Error: ' + range.invalid.reason, {status: 'danger'})
	}
    },
    innerHTML: `<div class="uk-container">
   
<ul uk-accordion= "multiple: true">
<li class="uk-open">
 <a class="uk-accordion-title" href>Personal Timecard Report </a>
 <div class="uk-accordion-content">
   <form class="uk-form-horizontal uk-grid-small" uk-grid>
   <div class="uk-width-1-2@s">
  <label class="uk-form-label" for="form-horizontal-text">Start</label>
    <div class="uk-form-controls">
    <input data-ecm-start-date class="uk-form-small uk-input" type="datetime-local">
   </div>
   </div>
   <div class="uk-width-1-2@s">

      <label class="uk-form-label" for="form-horizontal-text">End</label>
        <div class="uk-form-controls">
    <input data-ecm-end-date class="uk-form-small uk-input" type="datetime-local">
   </div>
   </div>
   </form>
  <button data-ecm-run class="uk-align-center uk-form-small uk-button uk-button-default"> Run </button>
  
   <table data-time-report class="compact row-border"></table>
  </div> </li>
  
  <li class="uk-open">
  <a class="uk-accordion-title" href>Timelog</a>
 <div class="uk-accordion-content">
   <table data-timelog class="compact row-border"></table>
   </div>
  </li>
  </ul>
   </div>`,
    
    makeGlobalDataTable(table, user_id) {
   	return new EcmDataTable(
   	    table, this.sqlQuery(user_id),
   	    {
   		ajax: true, serverSide: true,
            processing:true,
                order: {
                    name: 'date',
                    dir: 'desc'
                },
     		fixedHeader: true,
                pageLength: 10,
          	columnDefs: [
		    { targets: 5, render: this.renderNotes() }
		]

   	    }
   	)
    },
    printNotes(notes) {
	console.log(notes)
    },
    renderNotes: function (width = '40em') {
  	return (data, type, row, meta) => {
  	    if (type !== "display") {
		  return data
	      } else {
		  const pre = document.createElement('pre'),
			vec = typeof data == 'string' ? [data] : data;
		  console.log('Motes!', data)
                  pre.style.width = width;
                  pre.style.wordWrap = 'break-word'
                  pre.style.whiteSpace = 'pre-wrap'

		  pre.innerHTML = '<code>'+vec.join('\n------\n')+'</code>'
		  return pre
	      }
	  }
    },
	
    makePersonalDataTable(table, user_id, start, end) {
	new DataTable(table).destroy()
	table.innerHTML = ''
       	return new EcmDataTable(
       	    table, this.sqlPersonalQuery(user_id, start, end),
       	    {
                // order: {
                //     name: 'date',
                //     dir: 'desc'
                // },
		buttons: [
  		    {
  			extend: 'excelHtml5',
  			title: '',
  			className: 'uk-button uk-button-default',
  			exportOptions: {
  			   // columns: [0,1,2,4,5],
  			    orthogonal: 'export' 
  			}
  		    }
  		],

         	fixedHeader: true,
                 layout: {
  		      topStart: [ 'pageLength', 'buttons']
  		} ,

                //pageLength: 10,
        	columnDefs: [
       		    { targets: 3, width: '50%', render: this.renderNotes() }
		]
       	 }
       	)
    }

})

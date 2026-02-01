import { Complaint } from './model'
import { Complaints } from './collection'
import { Widget, html } from '@spinal/widget'
import _ from '@spinal/underscore'
// import { Widget, html, View, M, $, _, Backbone } from 'spinalize'
import Table from '@spinal/table'


export const ComplaintsTable = Table.extend({
  loading: new Promise((t) => { t(false); }),
  columns: [
	{
	  header: "Claim",
	  accessorFn: (model) => model.get('claim_id')
	},
	{
	  header: "Date",
	  accessorFn: (model) => model.get('date')
	},
	{
	  header: "Reason",
	  accessorFn: (model) => model.get('reason')
	}, 
	{
	  header: "Syndicate",
	  accessorFn: (model) => model.get('syndicate')
	}, 
	{
	  header: "Broker",
	  accessorFn: (model) => model.get('broker')
	},
	{
	  header: "Agency",
	  accessorFn: (model) => model.get('agency')
	}
  ],
  sorting: [
	{
	  "id": "Time",
	  "desc": false
	}
  ],
  columnVisibility: {
	Id: false
  },
  makeOptions(opts) {
	return _.assign({
	  enableSorting: true,
	  enablePagination: true,
	  enableMultiSort: false,
	  //isMultiSortEvent: (e) => true
	}, opts)
  },
  initialize(args) {
	this.collection = new Complaints({})
	this.initPromise = new Promise((resolve, reject) => {
	  this.collection.fetch({
		reset: true,
		error: reject,
		success: ()=>{
		  Table.prototype.initialize.call(
			this,
			this.makeOptions({
			  data: this.collection.models,
			  columns: this.columns,
			  csv: {
				fileName: `complaints${JSON.stringify(new Date()).split('T')[0]}.csv`
			  }
			}))
		  resolve(this)
		}
	  })
	})
  }
})									 
		
		





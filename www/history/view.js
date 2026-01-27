//import { ClaimMovement } from './model'
//import { ClaimMovements } from './collection'
import { Widget, html } from '@spinal/widget'
// import { Widget, html, View, M, $, _, Backbone } from 'spinalize'
//import { Table } from '../tanstack/table'

export const ClaimMovementView = Widget.extend({
  template: `<div class="row">
  <div class="s6">
  <input type="text" placeholder="Enter Claim #">
  </div>
  <div class="s6">
  <button>Fetch History</button>
  </div>
  <div class="s12">
  <table></table>
  </div>
</div>`,
  render() {
	this.tableEl.innerHTML = this.template
	// this.table = new ClaimMovementTable({
	//   claim_id: this.claim_id,
	//   el: this.tableEl
	// })
  },
  events: {
	"click button": "onClick"
  },

  onClick() {
	const str = this.inputEl.value,
		  n = str ? Number(str) : false
	if (n) {
	  this.claim_id = n
	  this.render()
	}
	console.debug('clk', this.inputEl.value)
  },
	
  initialize({ claim_id }) {
	this.el.innerHTML = this.template;
	this.claim_id = claim_id
	this.inputEl = this.el.querySelector('input')
	this.tableEl = this.el.querySelector('table')
	this.delegateEvents()
	if (this.claim_id) {
	  this.render()
	}
  }
  
  // makeTable(claim_id) {
  
  
})
     


export const ClaimMovementTable = Table.extend({
  claim_id: 85219,
  columns: [
	{
	  header: "Claim",
	  accessorFn: (model) => model.get('claim_id')
	},
	{
	  header: "Time",
	  accessorFn: (model) => model.get('time')
	},
	{
	  header: "Class",
	  accessorFn: (model) => model.get('class'),
	},
	{
	  header: "Action",
	  accessorFn: (model) => model.get('action'),
	},
	{
	  header: "User",
	  accessorFn: (model) => model.get('username')
	},
	{
	  header: "Previous", 
	  accessorFn: (model) => model.get('diff'),
	  cell: (props, row, table) => {
		const val = props.getValue(),
			  disp = val ? JSON.stringify(val, null, 2) : ''
		return `<pre>${disp}</pre>`
	  }
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
			enableMultiSort: false,
			//isMultiSortEvent: (e) => true
		}, opts)
	},
  initialize(args) {
	if (args.claim_id) { this.claim_id = args.claim_id }
	if (this.collection) {
	  Table.prototype.initialize.call(this, this.makeOptions({
		data: this.collection.models,
		columns: this.columns
	  }))
	} else {
	  this.collection = new ClaimMovements({
		claim_id: this.claim_id
	  });
	  this.collection.load().then(_ => {
		this.initialize(args)
	  })
	}
  }
})									 
		
		





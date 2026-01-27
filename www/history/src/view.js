import { ClaimMovement } from './model'
import { ClaimMovements } from './collection'
import { Widget, html } from '@spinal/widget'
import _ from '@spinal/underscore'
import { renderLink } from './link'
// import { Widget, html, View, M, $, _, Backbone } from 'spinalize'
import Table from '@spinal/table'

export const ClaimMovementView = Widget.extend({
  template: `<div>
<div class="row" data-chooser>
  <div class="s6">
    <input type="text" placeholder="Enter Claim #">
  </div>
  <div class="s6">
    <button>Fetch History</button>
  </div>
</div>
<div class="row">
  <div data-his-table class="s12">
   <h3> Claim #<span></span> </h3>
   <div data-table></div>
  </div>
  <div class="s12 progress">
    <h3 class="center-text"> Loading... </h3> 
    <div class="indeterminate"></div>
  </div>
</div>

</div>`,
  render() {
	this.el.innerHTML = this.template
	this.inputEl = this.el.querySelector('input')
	this.wrapperEl = this.el.querySelector('[data-table]')
	this.completeEl = this.el.querySelector('[data-his-table]')
	this.chooserEl = this.el.querySelector('[data-chooser]')
	this.progressEl = this.el.querySelector('.progress')
	this.numberEl = this.completeEl.querySelector('h3 span')

	this.progressEl.style.display = 'none'
	this.completeEl.style.display = 'none'

	this.delegateEvents()
	if (this.claim_id) {
	this.progressEl.style.display = ''
	this.chooserEl.style.display = 'none'
	  this.table = new ClaimMovementTable({
		claim_id: this.claim_id,
		el: this.wrapperEl
	  })

	  this.table.loading.then(_ => {
		this.progressEl.style.display = 'none';
		this.completeEl.style.display = '';
		this.chooserEl.style.display = '';
	  })
	}
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
	
  initialize({ claim_id } = { claim_id: false }) {
	this.claim_id = claim_id
	this.render()
  }
  
  // makeTable(claim_id) {
  
  
})
     


export const ClaimMovementTable = Table.extend({
  claim_id: 85219,
  loading: new Promise((t) => { t(false); }),
  columns: [
	{
	  header: "Claim",
	  accessorFn: (model) => model.get('claim_id'),
	  enableSorting: false
	},
	{
	  header: "Time",
	  accessorFn: (model) => model.get('time'),
	  cell: (props, row, table) => {
		const val = props.getValue()
		return val.replace('T', ' ');
	  }
	},
	{
	  header: "Class",
	  accessorFn: (model) => model.get('class'),
	  cell: props => {
		const id = props.row.original.get('row_id'),
			  klass = props.getValue(),
			  a = renderLink(klass, klass, id)
		// console.debug('Why me no workie?', id, klass, a, props)

		return a.outerHTML
	  }
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
			  disp = val ? JSON.stringify(val, null, 1) : ''
		return `<pre style="white-space: pre-wrap; overflow-x: auto;">${disp}</pre>`
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
	  enablePagination: true,
	  enableMultiSort: false,
	  //isMultiSortEvent: (e) => true
	}, opts)
  },
  initialize(args) {
	//console.debug('WTF!', _, S._)
	if (args.claim_id) { this.claim_id = args.claim_id }
	if (this.collection) {
	  Table.prototype.initialize.call(this, this.makeOptions({
		data: this.collection.models,
		columns: this.columns
	  }))
	  this.render()
	} else {
	  this.collection = new ClaimMovements({
		claim_id: this.claim_id
	  });
	  this.loading = this.collection.load()
	  this.loading.then(_ => {
		this.initialize(args)
	  })
	}
  }
})									 
		
		





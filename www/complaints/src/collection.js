import { Collection } from '@spinal/backbone'
import { Complaint } from './model'

export const Complaints = Collection.extend({
  model: Complaint,
  url: '/rpc/collection/complaints'// ,
  // initialize(args = {}) {
  // 	Collection.prototype.initialize()
  // },
  // async load (options) {
  // 	  const exams = await fetch(this.url, {
  // 		method: 'POST',
  // 		headers: {
  // 		  'Content-Type': 'application/json',
  // 		},
  // 		body: JSON.stringify({
  // 		  claim_id: this.claim_id
  // 		})

  // 	  }
  // 							   ).then(c => c.json())
  // 	return this.reset(exams, options)
  // }
})

	



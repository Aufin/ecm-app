import { Collection } from '@spinal/backbone'
import { ClaimMovement } from './model'

export const ClaimMovements = Collection.extend({
  model: ClaimMovement,
  claim_id: 85219,
  url: '/rpc/collection/claim-movements',
  initialize(args = {}) {
	//console.debug('Have claim?', args)
	args.claim_id ? this.claim_id = args.claim_id  : null; //claim_id
	Collection.prototype.initialize()
  },
  async load (options) {
	  const exams = await fetch(this.url, {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({
		  claim_id: this.claim_id
		})

	  }
							   ).then(c => c.json())
	return this.reset(exams, options)
  }
})

	



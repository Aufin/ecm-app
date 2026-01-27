import { Model } from '@spinal/backbone'

export const ClaimMovement = Model.extend({
	idAttribute: "id",
	toString() {
		const c = this.attributes
		return `${c.claim_id}`
		
	}
})







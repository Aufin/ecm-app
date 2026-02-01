import { Model } from '@spinal/backbone'

export const Complaint = Model.extend({
  idAttribute: "claim_id",
  toString() {
	const c = this.attributes
	return `${c.date} - ${c.reason}`
  }
})







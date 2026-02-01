import * as Model from './model'
import * as View from './view'
import * as Collection from './collection'

Object.assign(Model.Complaint, Model, View, Collection, {
  default: Model.Complaint
})
  
export const Complaint = Model.Complaint

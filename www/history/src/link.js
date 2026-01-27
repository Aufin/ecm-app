
export const renderLink = (text, type, id, appendTo = document.createElement('span')) => {

  const urls = {
	claim(id) {
	  return `/ecm/claim/${id}`
	},
	claim_transaction(id) {
	  return `/ecm/view?claim_transaction=${id}`
	},
	diary_entry(id) {
	  return `/ecm/view?diary_entry=${id}`
	},
	attachment(id) {
	  return `/ecm/view?attachment=${id}`
	},
		a = document.createElement('a'),
		fn = urls[type],
		href = fn && fn(id)
  a.textContent = text
  if (!href) {
	appendTo.append(a.innerHTML)
	return a
  } else {
	a.setAttribute('href', href)
	appendTo.append(a)
	return a
  }
}
	
		

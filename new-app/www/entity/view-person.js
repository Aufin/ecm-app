function EcmViewPerson(element) {
    this.element = element
    
    fetch(this.pathExpand('view-person.html'))
	.then(r => r.text()).then(txt => {
 	    element.innerHTML = txt
	})
    
    // when this.person is set this.renderPerson is run
    return this
    
}

  
 Object.setPrototypeOf(EcmViewPerson.prototype, EcmElement.prototype);
 EcmViewPerson.prototype.currentScript = document.currentScript;


 Object.defineProperty(EcmViewPerson.prototype, 'person', {
     get() { return this._person },
     set(p) {
       const p_p = p instanceof Person;
       if (!p_p) { p = new Person(p) }
 	this._person = p
 	// console.log("setting person to view", p)
 	this.renderPerson(p)
     }
 })

  EcmViewPerson.prototype.claimTR = function (claim) {
      const lnk = ((a = document.createElement('a')) => {
          a.setAttribute('href', '/ecm/claim/' + claim.claim_id)
 	 a.textContent = claim.claim_id
 	 return a
      })(),
 	   tr = document.createElement('tr'),
 	   td = (e) => {
 	       const tde = document.createElement('td')
 	       tde.append(e)
 	       tr.append(tde)
 	       return tde
 	   },
 	   a = (href, a = document.createElement('a'))=> {
   	       a.setAttribute('href', href)
   	       return a
 	   },
 	   ex = (n => {
 	       const na = a('/ecm/view?person=' + claim.examiner._id)
 	       na.textContent = claim.examiner.full_name
 	       return na
 	   })();


      if (claim.transactions) {
         const ledger = () => document.createElement('span'),
               thed = td('')
          
         claim.transactions.forEach(ct => {
             const l = ledger()
            // console.log('have CT', ct)
             l.append(ct.date+ ' ' + ct.type+": "+ct.amount)
             thed.append(l)
	 })
      }
      td(lnk)
      td(claim.status)
      td(claim.date_of_loss)
      td(this.makePolicyElement(claim.policy))
      td(this.makeContractElement(claim.contract))
      td(ex)
      return tr
  }
 	   

      
 EcmViewPerson.prototype.makePolicyElement = function (policy) {
     if (!(policy instanceof Policy)) {
	 policy = new Policy(policy)
     }
     const a = (href, a = document.createElement('a'))=> {
 	a.setAttribute('href', href)
 	return a
     },
 	  span = document.createElement('span'),
 	  pa = a('/ecm/view?policy=' + policy.policy_id),
 	  ca = (href, tooltip) => {
 	      const la = a(href)
 	      la.setAttribute('uk-tooltip', tooltip)
 	      return la
 	  }
     
           

     pa.textContent = policy.policy_number
     span.append(pa) ;
     span.append(((s) => {
 	s.textContent = ' ' + policy.effective_date + ' to ' + policy.expiry_date
 	return s
     })(document.createElement('small')))

     const ag = policy.agent && ca('/ecm/view?person='+ policy.agent._id, 'Agent'),
           rb = policy.agency_office && ca('/ecm/view?person='+ policy.agency_office._id, 'Retail Broker'),
           uw = policy.underwriter && ca('/ecm/view?person='+ policy.underwriter._id, 'Underwriter'),
           lb = policy.branch && ca('/ecm/view?person='+ policy.branch._id, 'Local Branch'),
 	  co = policy.insurance_company && ca('/ecm/view?person='+ policy.insurance_company._id, 'Insurance Company')

     if (ag) {
 	ag.textContent = policy.agent && (' ' + policy.agent.full_name)
 	span.append(ag)
     }
     if (co) {
 	span.append(co)
 	co.textContent = policy.insurance_company && ((ag ? ', ' : ' ') +  policy.insurance_company.full_name)
     }
     if (rb) {
 	  span.append(rb)
 	  rb.textContent = ((ag || co ? ', ' : ' ') + policy.agency_office.full_name)
     }
     if (uw) {
 	  span.append(uw)
 	  uw.textContent = ((ag || co || rb ? ', ' : ' ') + policy.underwriter.full_name)
     }

     if (lb) {
 	  span.append(lb)
 	  lb.textContent = ((ag || co || rb || uw ? ', ' : ' ') + policy.branch.full_name)
     }


     // span.append(JSON.stringify(policy.object))

     return span
 }

 EcmViewPerson.prototype.makeContractElement = function (contract) {
     const a = (href, a = document.createElement('a'))=> {
 	a.setAttribute('href', href)
 	return a
     },
 	  span = document.createElement('span'),
 	  pa = a('/ecm/view?contract=' + contract._id),
 	  ca = (href, tooltip) => {
 	      const la = a(href)
 	      la.setAttribute('uk-tooltip', tooltip)
 	      return la
	  },
 	  auth = () => {
 	      const span = document.createElement('span')
 	      span.textContent = ' $' + contract.authority
 	      span.setAttribute('uk-tooltip', "Authority")
 	      return span
 	  }
     
           

     pa.textContent = contract.contract_number
     span.append(pa) ;
     span.append(((s) => {
 	s.textContent = ' ' + contract.effective_date + ' to ' + contract.expiry_date
 	return s
     })(document.createElement('small')))

     const ag = contract.agency && ca('/ecm/view?person='+ contract.agency._id, 'Agency'),
           syn = contract.syndicate && ca('/ecm/view?person='+ contract.syndicate._id, 'Syndicate'),
           lb = contract.london_broker && ca('/ecm/view?person='+ contract.london_broker._id, 'London Broker'),
 	  co = contract.insurance_company && ca('/ecm/view?person='+ contract.insurance_company._id, 'Insurance Company')

     if (syn) {
 	syn.textContent = (' ' + contract.syndicate.full_name)
 	span.append(syn)
     }
     if (ag) {
 	span.append(ag)
 	ag.textContent = ((syn ? ', ' : ' ') +  contract.agency.full_name)
     }
     if (co) {
 	  span.append(co)
 	  co.textContent = ((ag || syn ? ', ' : ' ') + contract.insurance_company.full_name)
     }

     if (lb) {
 	  span.append(lb)
 	  lb.textContent = ((ag || co || syn ? ', ' : ' ') + contract.london_broker.full_name)
     }

     if (contract.authority) {
 	span.append(auth());
     }
     // span.append(JSON.stringify(policy.object))

     return span
 }



 EcmViewPerson.prototype.insuredHTML =`
  <table class="uk-table uk-table-small uk-table-divider">
   <thead>
       <tr>
           <th>Claim</th>
           <th>Status</th>
           <th>Date&nbsp;of&nbsp;Loss</th>
           <th>Policy</th>
           <th>Contract</th>
           <th>Examiner</th>
       </tr>
   </thead>
   <tbody> </tbody>
 </table> `

EcmViewPerson.prototype.payeeHTML =`
  <table class="uk-table uk-table-small uk-table-divider">
   <thead>
       <tr>
           <th>Ledger</th>
           <th>Claim</th>
           <th>Status</th>
           <th>Date&nbsp;of&nbsp;Loss</th>
           <th>Policy</th>
           <th>Contract</th>
           <th>Examiner</th>
       </tr>
   </thead>
   <tbody> </tbody>
 </table> `


 EcmViewPerson.prototype.renderPerson = function(person) {
     if (!person) { person = this.person }
     const el = this.element,
 	  nameEl = el.querySelector('[data-ecm-full-name]'),
 	  addressEl = el.querySelector('[data-ecm-address]'),
 	  claimsEl = el.querySelector('[data-ecm-person-claims]'),
 	  insuredEl = claimsEl.querySelector('[data-ecm-insured]'),
 	  payeeEl = claimsEl.querySelector('[data-ecm-payee]')
           
     console.log('Render Person', person)
     nameEl.textContent = person.full_name
     addressEl.textContent = person.address;

     // console.log('Promise', person.isPayee, person.isPayee().then)
     person.isPayee().then(yes => {
       console.log('is payee', yes, person.person_id);
     });


     // must have a ; before this
     ;
     ([insuredEl, payeeEl]).forEach(el => {
 	el.style.display = ''
 	this.addLoading(el.querySelector('.uk-accordion-title'));
     })

     person.insuredDetails.then(jso => {
       const cnt = insuredEl.querySelector('.uk-accordion-content'),
             claims = jso.claims && jso.claims.map(init => new Claim(init))
     this.removeLoading(insuredEl.querySelector('.uk-accordion-title'));
 	if (!claims) {
 	    insuredEl.style.display = 'none'
 	} else {
 	    // console.log(claims && claims.map(c => c.claim_id), claims)
             cnt.innerHTML = this.insuredHTML
 	    const bdy = cnt.querySelector('tbody')
         
 	    claims.forEach(c => bdy.append(this.claimTR(c)))
 	    console.warn(new DataTable(cnt.querySelector('table')))
 	}
     })

   
 }



 EcmViewPerson.prototype.makeLoading = function () {
     const d = document.createElement('div')
     d.setAttribute('uk-spinner', '')
     return d
 }
   
 EcmViewPerson.prototype.addLoading = function (element) {
     let el = element.querySelector('[uk-spinner]')
     if (el) {
 	return el
     }

     el = this.makeLoading()
     element.append(el)
     return el
   }

 EcmViewPerson.prototype.removeLoading = function (element) {
     let el = element.querySelector('[uk-spinner]')
     if (el) {
 	    el.remove()
       return el
     }

   }



    

 // EcmViewPerson.prototype.

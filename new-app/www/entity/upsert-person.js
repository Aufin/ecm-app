// console.log('here')
function EcmUpsertPerson(element, full_name = "") {
    const person_name =
	  {
	      title: null,
	      first_name: null,
	      middle_name:  null,
	      last_name:  null,
	      suffix: null,
	      company_name: null,
	      set nick(name) {
		  this.company_name = name
	      },
        
	      set first(name) { this.first_name = name },
	      set last(name) { this.last_name = name },
	      set middle(name) { this.middle_name = name }
	  },
	  self = this,
	  company = { company_name: full_name },
	  address = new Address(),
	  editAddress = address.newEditAddress()

    
	   
    this.isCompany = false
    this.address = address
    this.element = element

    Object.assign(this, { person_name, full_name, company})

     


 fetch(this.pathExpand('upsert-person.html'))
	.then(r => r.text())
	.then(txt => {
	    element.innerHTML = txt
	    const psel = element.querySelector('[name="province"]'),
		  csel = element.querySelector('[name="country"]')
            // console.log('Select Upsert Province', psel, psel.parentElement)
            this.addressElement = element.querySelector('[data-ecm-person-address]')
	    editAddress.appendTo(this.addressElement)

	    this.personName = element.querySelector('[data-person-name]')
	    this.companyName = element.querySelector('[data-company-name]')
	    this.fullNameInput = this.companyName.querySelector('input')
	    this.typeRadio = element.querySelectorAll('[name="type"]')
            //this.province = new SelectProvince(psel, 'CA')
	    //this.country = new SelectCountry(csel, "CA")
	    this.saveButton = element.parentNode.querySelector('[data-ecm-save-button]')
	    //this.addressInput = this.addressElement.querySelector('[name=full_address]')
	    

	    //console.log('Got Adddress Input', this.addressInput)

            //this.addressInput.onpaste = event => this.addressOnPaste(event);


	    // captureInputs links any inputs change event to an
	    // object's property of .name
            this.captureInputs(this.personName, person_name)
            this.captureInputs(this.companyName, company)
            //this.captureInputs(this.addressElement, this.address)


             globalThis.__saveButton = this.saveButton

	     this.saveButton.addEventListener("click", e => {
		// console.log(`Saving clicked, ${e}`)
		 this.savePerson()
	     })
	     
	     // this.country.element.addEventListener("update", e => {
	     // 	 //console.log("Changed Country", e.detail.country.value)
	     // 	 this.province.update(e.detail.country.value)
             //    //console.log(self.province, self.province.update)
	     // })
	     // //
	    console.log("type radios", this.typeRadio);

            this.typeRadio.forEach(r => {
              r.addEventListener("input", (event) => {
                  // console.warn('this', this, this.companyName)
                //    globalThis.__SelectPerson = this
		   this.personName.style.display = event.target.value == 'person' ? '' : 'none';
                  this.companyName.style.display = event.target.value == 'company' ? '' : 'none';
                  this.isCompany = event.target.value == 'company';
		   })
		      
                 // console.log('radio!', event, event.target.value)
	     });


      // Object.keys(person_name).map(k => {
      // 	    const name = '[name="'+k+'"]',
      // 		  input = element.querySelector(name);
      // 	    // console.log('have name!', name, input)
      // 	    if (input) {
      // 		Object.defineProperty(person_name, k, {
      // 		    enumerable: true,
      // 		    get() { return input.value },
      // 		    set(v) { return input.value = v}
      // 		})
      // 	    }
	    
      //	})
	

   });

  

    return this }

Object.setPrototypeOf(EcmUpsertPerson.prototype, EcmElement.prototype);
EcmUpsertPerson.prototype.currentScript = document.currentScript;

Object.assign(EcmUpsertPerson.prototype, {
    parseAddress(str) {
       globalThis.parseAddress(str, (err, adr) => {
        console.log('Parsed Address', adr, err)
       })
    },
    addressOnPaste(event) {
	// event.preventDefault();
	let paste = (event.clipboardData || window.clipboardData).getData("text");

	console.log('pasted', this, paste)
        this.parseAddress(paste);
    }
})

EcmUpsertPerson.prototype.parseFullName = globalThis.parseFullName;

EcmUpsertPerson.prototype.updateWithFullName = function (txt) {
  this.company.company_name = txt;
  Object.assign(this.person_name, this.parseFullName(txt))
  this.setInputs(this.element, this.person_name)
  this.setInputs(this.element, this.company)
}


Object.defineProperty(EcmUpsertPerson.prototype, 'person', {
    get() {
	const p = {
	    person_id: this.person_id,
            company_flag: this.isCompany,
	    name: this.isCompany ? this.company : this.person_name,
	    address: this.address
	}

	return p;
    }
});
  
EcmUpsertPerson.prototype.savePerson = function (p) {
    const request = new Request(this.pathExpand('../rpc/person.ss?upsert'), {
	method: "POST",
	body: JSON.stringify(this.person)
    });
    console.log(`Saving`, this.person, JSON.stringify(this.person))
      
    const foo = fetch(request).then(res => {
	console.log('Fetched', res)
        res.text().then(obj => {
         const err = this.element.querySelector("[data-ecm-error]")
	    console.log('got json', obj, this.element.querySelector("[data-ecm-error]"))
          err.innerHTML =`<div class="uk-alert-danger" uk-alert>
  <a href class="uk-alert-close" uk-close></a>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</p>
</div>`
	}).catch(e => { console.warn(e, res.text()) })
    }).catch(e => {
	console.warn('ERRORFETCH', e)
    })


    console.log('Fetching', foo)
		    
    
}

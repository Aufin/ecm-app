function Address(init) {
       this.init(init)
}

EcmElement.define(Address);

Address.parse = globalThis.parseAddress
Address.print = globalThis.parseAddress.printAddress

Object.assign(Address.prototype, {
    toString() { return Address.print(this) },
    parse(addr) {
	obj = addr || this;
	return Address.parse(obj)
    },
    init(arg) {
	const obj = typeof arg == 'string' ? this.parse(arg) : arg;
	Object.assign(this, obj)
    },
    template:
    {
	line1: null,
	line2: null,
	city: null,
	province: null,
	postal_code: null,
	country: null
    },
    newEditAddress() {
	const that = this;
	function EditAddress() {
	    const el = document.createElement('div'),
		  that_country = that.country
	    el.setAttribute('class',
			    "uk-width-expand uk-flex uk-align-center uk-flex-center uk-flex-middle")
	    el.innerHTML = that.editInnerHTML
	    
	    const addressElement =  el.querySelector('[data-address]'),
  		  input = el.querySelector('[name="full_address"]'),
  		  psel = el.querySelector('[name="province"]'),
		  csel = el.querySelector('[name="country"]'),
		  province =  new SelectProvince(psel, that_country),
	          country  = new SelectCountry(csel, that_country),
		  value = that.toString()

            Object.keys(that.template).forEach(k => {
                const inp = addressElement.querySelector(`[name="${k}"]`)
		  if (inp) {
		      inp.addEventListener('change', e => {
			  that[k] = inp.value
                          input.value = that.toString()
		      })
		  }
	      })
            
	    input.value = value
            input.onchange = _ => {
		const that_country = that.country || "CA"
		that.init(input.value)
		const new_country = that.country || "CA"
		if (that_country !== new_country) {
		    province.update(that_country).then(_ => {
			this.setInputs(addressElement, that)
			
		    })
		} else { 
		    this.setInputs(addressElement, that)
		}
            }

	    country.onchange = (val) => {
            if (!val) { return }
             province.update(val).then(_ => {
		this.setInputs(addressElement, that)
            })

		console.warn('Changed Cuntry', val)

	    }
	    Object.assign(this, {element: el, input, addressElement, province, country })
	    
            that_country && province.update(that_country).then(_ => {
		this.setInputs(addressElement, that)
            })
	}

	EcmElement.define(EditAddress)
	Object.assign(EditAddress.prototype, {
	    appendTo(parent) {
		parent.append(this.element)
	    }
	})

	return new EditAddress()
    },


	    
    makeEditElement() {
	const el = document.createElement('div')
	el.setAttribute('class', "uk-width-expand uk-flex uk-align-center uk-flex-center uk-flex-middle")
	el.innerHTML = this.editInnerHTML

	const addressElement =  el.querySelector('[data-address]'),
  	    psel = el.querySelector('[name="province"]'),
              csel = el.querySelector('[name="country"]'),
	      province =  new SelectProvince(psel, 'CA'),
	      country = new SelectCountry(csel, "CA")
          province.update('CA').then(_ => {
             this.setInputs(addressElement, this)
         })
	return el
    },
	      
	
    editInnerHTML: `<div class="uk-width-expand uk-flex uk-align-center uk-flex-center uk-flex-middle" >
	  <div class="uk-width-expand" data-address>
	    <ul uk-tab>
	      <li><a href="#">Full Address</a></li>
	      <li><a href="#">Components</a></li>
	    </ul>
	    
	    
	    <div class="uk-width-expand uk-switcher uk-margin">
	      <div class="">
		<input class="uk-input" name="full_address" placeholder="Enter Full Address">
	      </div>
	      <div class="uk-width-expand">
		<input class="uk-input" name="line1" placeholder="Address Line 1"> <br>
		<input class="uk-input" name="line2" placeholder="Address Line 2"><br>
		<input class="uk-input" name="city" placeholder="City">
		<select class="uk-input" name="province" data-placeholder="Province"></select>
		<br>
		<input class="uk-input" name="postal_code" placeholder="Postal Code">
		<select class="uk-input" name="country" data-placeholder="Country"></select>
		
	      </div>
	    </div>
	    
	    
	  </div> 
	</div>`

})

function SelectProvince(select, country) {
    EcmSelect.call(this, select)

    this.update("CA");
    return this;
}


SelectProvince.prototype.update = function(country) {
    this.options = []
    this.element.querySelector('ul').innerHTML = '';
  console.warn(this.element)
     if (!country) { return null }
     return fetch('/rpc/province.ss?country='+country).then(r=>r.json())
	.then(j => {
	    console.log('provinces', j)
            j.forEach(c => {
		this.addOption({
		    value: c.code,
		    text: c.name == c.code ? c.name : `${c.name} (${c.code})`,
		})
	    })
	   //  this.options.forEach(o => {
	// 	if (o.selected) { this.selectOption(o) }
	//     })
	})

}


Object.setPrototypeOf(SelectProvince.prototype, EcmSelect.prototype);
SelectProvince.prototype.currentScript = document.currentScript;

function SelectCountry(select, init) {
    EcmSelect.call(this, select)

    this.input.placeholder = "Country"

    fetch('/rpc/country.ss').then(r=>r.json())
	.then(j => {
	    console.log('countries', j)
            j.forEach(c => {
		this.addOption({
		    value: c.code,
		    text: c.name,
		    selected: c.code === init
		})
	    })
	    this.options.forEach(o => {
		if (o.selected) { this.selectOption(o) }
	    })
	})
    

    this.addOption({value: "CA", text: "Canada"})

   this.onChabge
    
    return this;
}

    
SelectCountry.prototype.makeUpdateEvent = (country) => {
    return new CustomEvent("update", {
	detail: { country },
        bubbles: true
    });
};

Object.setPrototypeOf(SelectCountry.prototype, EcmSelect.prototype);
SelectCountry.prototype.currentScript = document.currentScript;

SelectCountry.prototype.selectOption = function (...args) {
      const parent = Object.getPrototypeOf(Object.getPrototypeOf(this)),
  	    el = parent.selectOption.call(this, ...args);
    this.element.dispatchEvent(this.makeUpdateEvent(this.selectedOption))
    console.log('WE DID IT! Dispatched?', this.element, el, ...args)
    return el
  };

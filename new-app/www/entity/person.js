function Person(initargs = {}) {
    this.init(initargs);
    return this;
}

EcmSPA.prototype.Person = Person;

Object.setPrototypeOf(Person.prototype, EcmElement.prototype);
Person.prototype.currentScript = document.currentScript;
// NB: the id is stored all over the place by various different
// things, old and new, which call it different things.

// But `.person_id` is where it lives for real.

Object.assign(Person.prototype, {
    template: {
	person_id: null,
	title: null,
  	first_name: null,
  	middle_name:  null,
  	last_name:  null,
  	suffix: null,
  	company_name: null,
	isCompany: false,
	email_address: null,
	address: null,
	birth_date: null,
	phone: null 
	
    },
    parse(str) {
	return Person.parse(str);
    },
    toString() { return Person.print(this) },
    init(arg) {
	const obj = typeof arg === "string"  ? this.parse(arg) : arg
	Object.entries(this.template).forEach(([k,v]) => {
	    this[k] = k in obj ? obj[k] : v
	})
    },
    changeEvent: new Event("change"),
    
	
     editNameInnerHTML: `<div class="uk-width-expand uk-flex uk-align-center uk-flex-center uk-flex-middle">
  	  <div class="uk-width-expand" data-address>
  	    <ul uk-tab>
  	      <li><a href="#">Full Name</a></li>
  	      <li><a href="#">Components</a></li>
  	    </ul>
  	    
    <div class="uk-form-controls uk-form-controls-text">
      <label><input class="uk-radio" value="person" type="radio" name="type" checked>&nbsp;Person</label>
      <label><input class="uk-radio" value="company" type="radio" name="type">Company/Group/Other</label>
	</div>
 
  	    <div class="uk-width-expand uk-switcher uk-margin">
  	      <div class="">
  		<input class="uk-input" name="full_name" placeholder="Enter Full Address">
  	      </div>
  	      <div class="uk-width-expand">
	  <input class="uk-input uk-width-auto uk-margin-remove"
		 size="5" name="title" placeholder="Title" uk-tooltip="Title">
	  <input class="uk-input uk-width-medium@s uk-margin-remove"  name="first_name" placeholder="First Name" uk-tooltip="First Name">
	  <input class="uk-input uk-width-small@m uk-width-medium@s uk-margin-remove" name="middle_name"  placeholder="Middle Name" uk-tooltip="Middle Name">
	  <input class="uk-input uk-width-medium uk-margin-remove" name="last_name" placeholder="Last Name" uk-tooltip="Last Name">
    <input class="uk-input  uk-width-small uk-margin-remove" size="6" name="suffix" placeholder="Suffix">
    <input class="uk-input uk-margin-remove uk-width-large@s" name="company_name" placeholder="Company or Group or Nickname">
	
  	      </div>
  	    </div>
  	    
  	    
  	  </div> 
  	</div>`,
    newEditName() {
	const that = this
	
	function copyAttrs(target, source) { 
            [...source.attributes].forEach(attr => { 
                target.setAttribute(attr.nodeName, attr.nodeValue) 
            }) 
        } 
	function EditName() {
	    const div = document.createElement('div'),
		  person = that
	    div.innerHTML = that.editNameInnerHTML
	    console.log('Have div'. div, div.firstElementChild)
	    copyAttrs(div, div.firstElementChild)
	    div.innerHTML = div.firstElementChild.innerHTML

	    this.typeRadio = div.querySelectorAll('[name="type"]')
	    this.typeRadio.forEach(r => {
		r.addEventListener("input", (event) => {
                    person.isCompany = event.target.value == 'company';
		})
	     });

            


	    this.element = div;
            this.input = div.querySelector('[name="full_name"]')
            this.input.value = that.toString();
            this.input.onchange = _ => {
		console.log('init', this.input.value)
		person.init(this.input.value)
                this.setInputs(div, person);
	    }
	    
		
            this.setInputs(div, that);

	    Object.keys(that.template).forEach(k => {
                const inp = div.querySelector(`[name="${k}"]`)
  		  if (inp) {
  		      inp.addEventListener('change', e => {
  			  that[k] = inp.value
                        this.input.value = that.toString()
  		      })
  		  }
  	      })
              
	}
	    
	    

      EcmElement.define(EditName)
  	Object.assign(EditName.prototype, {
  	    appendTo(parent) {
  		parent.append(this.element)
  	    }
  	})

	return new EditName();
    }

})

Person.parse = function (str) {
    const pobj = globalThis.parseFullName(str),
	  obj = {},
	  // trans: parse names to our keys
	  trans = (their, key) => {
	      obj[key || their] = pobj[their] || null
	  }
    trans('title'); trans('first', 'first_name'); trans('middle', 'middle_name')
    trans('last', 'last_name'); trans('suffix'); trans('nick', 'company_name')
    return obj
}

Person.print = function(obj) {
    if (obj.isCompany) {
	return obj.company_name
    }
    
    let str = ''
    const strify = (prop) => {
	const v = obj[prop]
        if (v) { str = (str + v + ' ') }
    }

    ['title', 'first_name', 'middle_name'].forEach(strify)
    if (obj.company_name) {
	str = str + ' "' + obj.company_name + '" '
    }
    
    ['last_name', 'suffix'].forEach(strify);

    return str.trim()
}
    
    
    
Person.prototype.isPayee = async function (id) {
    const pid = id || this.person_id,
	  query = `SELECT COALESCE((SELECT
                 TRUE FROM claim_transaction
                 WHERE payee_id =` + pid + ` LIMIT 1),
                 FALSE) AS is_payee`,
	  { result } =  await EcmDataTable.submitQuery(query)

    // console.log('isPayee', result.data[0][0])
    return result.data[0][0];
}


// And these details are taken over by our dynamic EcmDataTable
Object.defineProperty(Person.prototype, 'insuredDetails', {
    get() {
 	const deets = this._insured_promise
        if (!deets) {
            this._insured_promise = this.getInsuredDetails()
            return this._insured_promise
        } else { return deets }
    }
})

Person.prototype.getInsuredDetails = function () {
    return fetch(this.pathExpand('insured.ss')+'?id='+encodeURIComponent(this.person_id)).then(r => r.json())
}

// Object.defineProperty(Person.prototype, 'payeeDetails', {
//      get() {
//  	const deets = this._payee_promise
//          if (!deets) {
//              this._payee_promise = this.getPayeeDetails()
//              return this._payee_promise
//          } else { return deets }
//      }
//  })

//  Person.prototype.getPayeeDetails = function () {
//      return fetch(this.pathExpand('payee.ss')+'?id='+encodeURIComponent(this.person_id)).then(r => r.json())
//  }

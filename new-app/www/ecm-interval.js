function EcmInterval(parent, options) {
    const div = document.createElement('div'),
	  opts = Object.assign({}, this.defaultOpts, options)
    div.classList.add('uk-float-left', 'uk-form-small')

    
    div.innerHTML = this.template;
    div.append(this.selectUnitElement())

    const input = div.querySelector('input'),
	  select = div.querySelector('select')

    opts.num ? input.value = opts.num : null
    opts.unit ? select.value = opts.unit : null 

    input.oninput = this.inputHandler()
    select.oninput =  this.inputHandler()

    Object.assign(this, { output: parent, div, input, select, opts })

   // console.log('ecm-interval', parent, div)
    parent.style.display = 'none';
    parent.after(div)
    
}

EcmElement.define(EcmInterval, 'data-ecm-interval')

Object.assign(EcmInterval.prototype, {
    intervals: ['YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND'],
    defaultOpts: {
	num: 1,
	unit: 'MONTH',
        // After this many seconds of a changed input the change event
        // is fired.
        changeSecs: 1.25
    },
    newChangeEvent: (value) => new CustomEvent("change", {
	detail: value,  bubbles: true
    }),
    getValue: function () {
	const num = parseFloat(this.input.value),
	      unit = this.select.value
	if (!isNaN(num)) {
	    return '' + num + ' ' + unit
	} else { return false }
    },
    changeOutputValue: function (val) {
	const value = val || this.getValue()
	this.output.value = value
	// console.log("Setting Val=ue:", value, this.input)
        this.value = value
        const ev = this.newChangeEvent(value);
        this.onchange(ev);
	this.input.dispatchEvent(ev);
	return value;
	
    },
    onchange: function (event)  {
	const fn = this.opts.onchange || function () {}
	return fn.call(this, event)
    },
    inputHandler: function () {
	const self = this
	return (event) => {
	    const val = self.getValue()
	    setTimeout(() => {
		const newVal = self.getValue()
		if (val && val === newVal && val !== self.value) {
		    this.changeOutputValue(val)
		}
	    }, (this.opts.changeSecs || 2) * 1000
		      )
	}
    },

    
    selectUnitElement: function () {
	const sel = document.createElement('select')
        sel.classList.add('uk-width-auto', 'uk-select', 'uk-form-small')
	this.intervals.map(i => {
	    const opt = document.createElement('option')
	    opt.setAttribute('value', i)
	    opt.innerHTML = i.toLowerCase() + '(s)'
            
	    sel.append(opt)
	})

	return sel
    },
    template:  `<input class="uk-input uk-form-small uk-form-width-xsmall" type="text" value=""> `

})

Object.defineProperty(
    EcmDateTime.prototype, "value",
    {
	get() {
	    const d = this.s.d,
		  luxDT = luxon.DateTime.fromJSDate(d).toUTC();
	    return luxDT.setZone(this.zoneName, { keepLocalTime: true });
	}
    }
)
		     
EcmSPA.prototype.initFunctions.ecm_date = function (el) {
    const init = (e) => { new EcmDateTime(e) };
    if (el.hasAttribute('data-ecm-datetime')) { init(el) }
    $(el).find('[data-ecm-datetime]').each((_, e) => {  init (e) })
    
}
function EcmDateTime(el, opts = {}) {
    // console.log("Constructing DateTime", el, opts)
    let datetime_input = document.createElement('input'),
        zoneName = luxon.DateTime.local().zoneName,
        close = document.createElement('button')
    
    datetime_input.setAttribute("class", el.getAttribute("class"))
    datetime_input.setAttribute("style", el.getAttribute("style"))
    el.style.display = "none"
    el.after(datetime_input);

    this.ecm = { input: el, datetime_input, opts}
    this.zoneName = zoneName
    
    DateTime.call(this, datetime_input,
		  Object.assign(opts, this.default_opts));
    this.c.onChange = (...args) => {
	this.setInput()
	this.onChange(...args)
    }
    if (this.s.parts.time) {
     this.dom.container[0].firstElementChild.append(zoneName)
    }

    this.dom.container[0].prepend(close);
    close.outerHTML = '<button type="button" style="float:right" uk-close></button>'
    close = this.dom.container[0].firstElementChild
    close.onclick = e => {
	e.stopPropagation()
	this.hide()
    }
    
    console.log('EcmDateTime', this, zoneName)
     return this;
}

EcmElement.define(EcmDateTime, false, DateTime.prototype);

Object.assign(EcmDateTime.prototype, {
    default_opts: { yearRange: 5000 },
    tooltip: function () {
      // console.log('Tooltip!', this, this.dom.input.val())
      UIkit.tooltip(this.dom.input, { title: this.value.toFormat(this.c.format) }).show();
    },
    setInput() {
        console.log('val?', this.c.format, this.val())
	this.ecm.input.value = this.valFormat(this.c.format)
    },
    onChange: function (...args) {
	console.log('EcmDateTime onchange:', ...args, 'd?', this.s.d, this.s.display)
    },
    _writeOutput: function (focus, change) {
	var date = this.s.d;
	var out = '';
	var input = this.dom.input;
	
	if (date) {
	    out =  this.value.toFormat(this.c.format)
	}

	input.val(out);
	
	if (change === undefined || change) {
	    // Create a DOM synthetic event. Can't use $().trigger() as
	    // that doesn't actually trigger non-jQuery event listeners
	    var event = new Event('change', { bubbles: true });
	    input[0].dispatchEvent(event);
	}
	
	if (input.attr('type') === 'hidden') {
	    this.val(out, false);
	}
	
	if (focus) {
	    input.focus();
	}
    },
    _val(...args) {
	const kont = Object.getPrototypeOf(EcmDateTime.prototype).val
	return kont.call(this, ...args);
    },
    maybeSetVal: function(str, write, kont, popup = true) {
       console.log("setting string->Date from", str, ' and write the value?: ', write)
        // If it's just a month name set a day
        if ((/^[A-Za-z ]+$/).test(str)) {
           str = str + ' 01'
        } else if ((/\d{4}-\d{2}-\d{2}$/).test(str)) {
	    str = str + '00:00'
	}
        
	  const
	  // No string start? Try a date as is.
	  first_date = /[a-zA-Z]/.test(str) ? false : new Date(str),
	  // No date as is? parse in the standard locale.
	  second_date = !first_date || isNaN(first_date) ? Date.fromString(str) : first_date
	  // No date in the set locale? Try french.
	  prem_date = isNaN(second_date) ? Date.fromString(str, 'fr-CA') : second_date,
	  // No date en francais? Try english
	  the_date = isNaN(prem_date) ? Date.fromString(str, 'en') : prem_date
        // console.log('F, S, T', first_date, second_date, prem_date, the_date)
	if (!isNaN(the_date)) {
           
	    const val =  kont.call(this, the_date, write)
	    if (popup) { this.tooltip(); }
            this.ecm.input.value = this.valFormat(this.c.format)
	    return val;
	}
    },
    val: function (set, write, popup = true) {
	const kont = Object.getPrototypeOf(EcmDateTime.prototype).val,
	      focused = document.activeElement == this.dom.input[0]
	
        console.log('Maybe Setting DateTime',
		    this, set, write, this.s.d)
	if (typeof set == 'undefined') {
	    return kont.call(this, set, !focused && write)
	}
	
          if (set == '') { set = new Date() }
	
	if (typeof set === 'string' && set !== "") {
    	    return this.maybeSetVal(set, write, (d, w) => this.val(d, w, popup))
    	} else {
            return kont.call(
		this,
		set, !focused && write
	    )
    	}
    }
})
 

EcmDateTime.prototype.defaultArgs = {
    fmt: {
	date: 'yy-mm-dd'
    },
    disp: {
	date: 'yy-mm-dd'
    },
    icon: 'calendar'
}

EcmDateTime.prototype.format = function (fmtStr) {
    // console.log('Format', fmtStr, this.Date, this.datepickerArgs) 
   return $.datepicker.formatDate(fmtStr, this.Date, this.datepickerArgs)
}
EcmDateTime.prototype.initEvents = function () {
    // Parse on input
    const self = this
    $(this.input).on('keyup', function() { self.parseEvent() })
    $(this.input).on('change', function() {
       // console.log("change event", $(self.input).parent())
	self.parseEvent()
	$(self.input).parent().removeClass('uk-alert-success uk-alert-danger uk-alert-warning')
    })

}



/* Canadian-French initialisation for the jQuery UI date picker plugin. */
jQuery(function ($) {
	$.datepicker.regional['fr-CA'] = {
		closeText: 'Fermer',
		prevText: 'Précédent',
		nextText: 'Suivant',
		currentText: 'Aujourd\'hui',
		monthNames: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
			'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
		monthNamesShort: ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin',
			'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
		dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
		dayNamesShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
		dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
		weekHeader: 'Sem.',
		dateFormat: 'yy-mm-dd',
		firstDay: 0,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ''
	};
});

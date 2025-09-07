// Pages, in single page? The router
// :PROPERTIES:
// :CUSTOM_ID: pages-in-single-page-the-router
// :END:


function EcmRouter() {
    this.elements = {}
    this.pages = []
    this.activePages = {}
    return this;
}

EcmRouter.prototype.setInnerHTML = function (elm, html) {
   elm.innerHTML = html;
   Array.from(elm.querySelectorAll("script")).forEach(oldScript => {
     const newScript = document.createElement("script");
     Array.from(oldScript.attributes)
       .forEach(attr => newScript.setAttribute(attr.name, attr.value));
     newScript.appendChild(document.createTextNode(oldScript.innerHTML));
     oldScript.parentNode.replaceChild(newScript, oldScript);
   });
 }

EcmRouter.prototype.loadElement = function(name, use_cache = true) {
    if (use_cache) {
	const el = this.elements[name]
	if (el) { return new Promise(r => r(el)); }
    }
    
    return fetch(name)
    	.then(res => res.text()
      	      .then(t => {
    		  const edoc = new DOMParser().parseFromString(t, "text/html"),
			el = edoc.body.firstChild
    		  this.elements[name] = el
		  return el
    	      })
	     )
}

// Routing "pages"
// :PROPERTIES:
// :CUSTOM_ID: routing-pages
// :END:

// The idea here is simple. The server routes all pages to one file, the
// "index.html". That loads the application which then starts on the page
// the uri location says.



EcmRouter.prototype.loadPage = function(name, place = false, reload = false) {
    const al = !reload && this.activePages[name]
    if (al) { return new Promise(r => r(al)); }

    return this.loadElement(name, !reload)
	.then(lel => {
	    const parent = document.createElement('div')
	    this.setInnerHTML(parent, lel.outerHTML)
	    const child = parent.firstChild
	    this.activePages[name] = child;
	    // I think this is the problem! We init before we make it
	    // part of the DOM.

	    // console.log('loading page', child, document.body.contains(child))

	    if (place && child) { place.prepend(child) }
            if (globalThis['ECM']) {
               ECM.initElement(child)
            }
           
	    return child;
	});
}
	    
EcmRouter.prototype.findPage = function (location, place = false) {
    for (const pa of this.pages) {
        const path = pa[0], page = pa[1]
	// console.log('looking for page', pa[0], pa)

	if (location.pathname == path) {
           console.warn("Got it!", page)
           return this.loadPage(page, place)
       }
	
    }
	return new Promise(r => r(false))
}

// Constructor =EcmSPA=
// :PROPERTIES:
// :CUSTOM_ID: constructor-ecmspa
// :END:


function EcmSPA () {
    this.router = new EcmRouter()
    this.locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return this;
}

EcmSPA.prototype.setInnerHTML = function (elm, html) {
    elm.innerHTML = html;
    Array.from(elm.querySelectorAll("script")).forEach(oldScript => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes)
        .forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

// [[file:../README.org::#envvar-an-ecm-global-environment][=.env['var']=: An ECM "global" environment:1]]
EcmSPA.prototype.env = {}
EcmSPA.prototype.getEnv = function (nm, defaul) {
    if (this.env.hasOwnProperty(nm)) {
	return this.env[nm]
    } else {
	return defaul;
    }
}
EcmSPA.prototype.setEnv = function (nm, val) {
    this.env[nm] = val;
    return val
}
// =.env['var']=: An ECM "global" environment:1 ends here

// [[file:../README.org::#the-dom-for-dom-elements-ecmelements][The =.DOM= for DOM elements->EcmElements:1]]
EcmSPA.prototype.DOM = new WeakMap();
EcmSPA.prototype.getDOM = function(el) {
  return this.DOM.get(el) || [];
}

EcmSPA.prototype.setDOM = function(el, ecm_el) {
    const val = this.getDOM(el) || [];
    val.push(ecm_el);
    return this.DOM.set(el, val);
}
// The =.DOM= for DOM elements->EcmElements:1 ends here

// =.querySelector= mostly to find data attributes
// :PROPERTIES:
// :CUSTOM_ID: queryselector-mostly-to-find-data-attributes
// :END:

// This is because we want to modify/replace elements as they are loaded.


EcmSPA.prototype.querySelectorAll = function(el, ... sels){
   const selThis = el.matches(... sels), selC = el.querySelectorAll(... sels)

  return [... selThis ? [el] : [], ... selC]
}

// Get/Set cookies
// :PROPERTIES:
// :CUSTOM_ID: getset-cookies
// :END:


EcmSPA.prototype.setCookie = function (cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

EcmSPA.prototype.getCookie = function (cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Initialize an element
// :PROPERTIES:
// :CUSTOM_ID: initialize-an-element
// :END:


EcmSPA.prototype.initFunctions = {}
EcmSPA.prototype.initElement = function(el) {
   if (! (el instanceof Element)) { return null}
    // console.warn("Init fns?", this.initFunctions, this, el)
    Object.values(this.initFunctions).forEach(init => {
	init.call(this, el)
    })
    
    $(el).data('ecm-instance', true)
    return el
}

// Set Page title
// :PROPERTIES:
// :CUSTOM_ID: set-page-title
// :END:

// Often a page may want to set it.


EcmSPA.prototype.initFunctions.setTitle = function (el) {
  this.querySelectorAll(el, '[data-ecm-set-title]')
	  .forEach(e => {
	      const title =  e.dataset['ecmSetTitle'],
		    ot = document.querySelector('[data-ecm-title]');
	      if (title) {
		  document.title = title
		  if (ot) { ot.innerHTML = title };
	      }
	      // console.log('set title', e, e.dataset['ecmSetTitle'])
	  })
		  
}

// Load an element
// :PROPERTIES:
// :CUSTOM_ID: load-an-element
// :END:


EcmSPA.prototype.loadElement = function(name, use_cache = true){
   return this.router.loadElement(name, use_cache).then(e => {
    // some elements might replace themselves
      const bdy = document.createElement('div');
       bdy.append(e)
	if (!$(e).data('ecm-instance')) {
	    this.initElement(e)
	}
	return bdy.firstChild
    })
}

// =replaceElement= Replace an element
// :PROPERTIES:
// :CUSTOM_ID: replaceelement-replace-an-element
// :END:


EcmSPA.prototype.replaceElement = function(from, to, use_cache = true){
   return this.loadElement(to, use_cache).then(e => {
      // console.log('Replace?', from, to, e)
      this.fixScriptsSoTheyAreExecuted(e)
      from.replaceWith(e)
      return e
    })
}

EcmSPA.prototype.initFunctions.ecm_replace = function (el) {
    const init = (e) => { this.replaceElement(e, $(e).data('ecm-replace'))};
    this.querySelectorAll(el, '[data-ecm-replace]').forEach(init) 
}

// =.loadScript= Dynamic Loading of JavaScript files
// :PROPERTIES:
// :CUSTOM_ID: loadscript-dynamic-loading-of-javascript-files
// :END:


EcmSPA.prototype.loadScript = function (src) {
    const el = document.createElement('script'),
	  pro = new Promise((res) => {
	      el.onload = _ => {
		  el.remove()
		  res(el)
	      }
	  })
    el.async = false
    el.setAttribute('src', src)
    
    this.element = el;
    document.body.append(el)
    return pro
}

// =.loadScripts= load all deps first, promise!
// :PROPERTIES:
// :CUSTOM_ID: loadscripts-load-all-deps-first-promise
// :END:


EcmSPA.prototype.loadScripts = function (...sources) {
    return Promise.all([...sources].map(src => this.loadScript(src)))
}

function EcmElement(parent) {
     this.ECM.setDOM(parent, this);
    return this
};
    
Object.defineProperty(EcmElement.prototype, 'ECM', {
  get() { return globalThis.ECM || EcmSPA.prototype }
})

EcmElement.prototype.currentScript = document.currentScript;

EcmElement.prototype.pathExpand = function (postfix = '', path = false) {
    const uri = path || this.currentScript.src.split('?')[0],
	  dir = path || uri.split('/').slice(0, -1).join('/')+'/'
    
    return dir + postfix;
}


EcmElement.define = function(newd, data_name = false, proto = EcmElement.prototype) {
     Object.setPrototypeOf(newd.prototype, proto)
     newd.prototype.currentScript = document.currentScript;
     if (data_name) {
 	const att = '[' + data_name + ']';

 	EcmSPA.prototype.initFunctions[newd.name] = function (el) {
 	    this.querySelectorAll(el, att)
 		.forEach(e => new newd(e))
 	}

     }
 }
// EcmSPA.prototype.domElements = {}

// EcmSPA.prototype.addDomElement = function (domEl, ecmEl) {
//     const map = this.domElements[ecmEl.constructor.name], cache =  map || new WeakMap()
//     cache.set(domEl, ecmEl)
//     if (!map)  this.domElements[ecmEl.constructor.name] = cache
// }
    
// EcmSPA.prototype.getElement = function (domEl, type = false) {
//     if (type) {
// 	return this.domElements[type].get(domEl)
//     } else {
// 	let ret = undefined,
// 	    arr = Object.values(this.domElements)
// 	for (let i = 0; i < arr.length ; i++) {
// 	    const el = arr[i].get(domEl)
// 	    if (typeof el !== 'undefined') {
// 		ret = el ; break
// 	    }
// 	}

// 	if (typeof ret !== 'undefined') {
// 	    return ret
// 	} else {
// 	    const p = domEl.parentNode
// 	    if (p) {
// 		return this.getElement(p)
// 	    } else return ret
// 	}
//     }

// }
EcmElement.prototype.create = function (thing, init = e => e) {
    const el = document.createElement(thing),
	  ret = init(el);
    
    return ret || el;
}

EcmElement.prototype.createHTML = function (html, init = e => e) {
    return this.create('div', div => {
	div.innerHTML = html;
	const child = div.firstElementChild
	child.remove()
	return child
    })
}


// .linkForm : Edit an object

EcmElement.prototype.captureInputs = function(element, object) {
    const el = element || this.element,
	  obj = object || {}
    
    el.querySelectorAll('input').forEach(i => {
      // console.log('Capture change on ', i.name, i)
	if(i.name) {
	    i.addEventListener('change', e => { 
		obj[e.target.name] = e.target.value
		// console.log(`Changed ${e.target.name} to ${e.target.value}`, obj)
	    })
	}
    })

    return obj;
}


EcmElement.prototype.setInputs = function(element, object) {
    const el = element || this.element,
	  obj = object || {},
	  handler = {
	      get(target, prop) {
		  const inp = el.querySelector(`[name="${prop}"`)
                  if (inp && inp.type == 'checkbox') {
		      return inp.checked 
		  } else {
		      return inp ? inp.value : undefined
		  }
		  
	      },
	      set(target, prop, val) {
		  const inp = el.querySelector(`[name="${prop}"`),
			chg = new Event("change")
		  if (inp) {
		      if (inp.type == 'checkbox') {
			  inp.checked = !!val
		      } else {
			  inp.value = val
		      }
		      inp.dispatchEvent(chg)
		      return inp;
		  }
	      },
	      has(target, prop) {
		  return !!el.querySelector(`[name="${prop}"`)
	      }
	      
	  },
	  prox = new Proxy(el, handler);

    for (const [key, value] of Object.entries(obj)) {
	// if (value) {
	    prox[key] = value
	//}
	// console.log(`${key}: ${value}`);
    }

    return prox
}

    
function EcmAutoComplete (args, replace = false) {
    const self = this;

    self.appendStyle()

    function isElement(element) {
	return element instanceof Element || element instanceof HTMLDocument;  
    }
    
    if (isElement(args)) {
        const existing = $(args).data('ecm-autocomplete')
        if (existing) { return existing }
        if (args.tagName.toLowerCase() !== "select") {
           throw new Error("Cannot yet make an autocomplete from a non-select")
         }
	this.element = this.makeElementFromSelect(args)
        if  (replace) { args.replaceWith(this.element) }
        $(this.element).data('ecm-autocomplete', this);
        this.init(this.element);
	return this
    } ;
};

// * KeyDown

EcmAutoComplete.prototype.onKeyDown = function (event) {
    let lis = $(this.optionsUl).find('li'),
	len = lis.length - 1, idx = -1, e = event
   // event.stopPropagation();
   // console.log('keydown')
    if (event.which === 40 || event.which === 38) {
	$(lis).each((n, e) => {
	    if(e.hasAttribute('data-ecm-selected')) {
                // console.log('idx', n)
	 	e.removeAttribute('data-ecm-selected')
                // console.log('idx', n, e)
	 	idx = n
	    }
	})
    }
        
    if (event.which === 40) {
	// downarrow
        if (idx !== len) {
            idx++;  $(this.optionsUl).show()
        }
        const li = lis[idx]
        li.setAttribute('data-ecm-selected', '')
        li.scrollIntoView()
    } else if (event.which === 38) {
	// uparrow
            if (idx > 0) {
             idx--
            } else { return }
            const li = lis[idx]
            li.setAttribute('data-ecm-selected', '')
            li.scrollIntoView()
	} else if (event.which === 13) {
            // console.log("Return!", $(lis).filter('[data-ecm-selected]'))
	    $(lis).filter('[data-ecm-selected]').each((_, e) => {
		this.selected = e
	    })
						      	    
	}


}

EcmAutoComplete.prototype.init = function (element) {
    this.input = $(element).find('[data-ecm-select-text]').get(0)
    this.display = $(element).find('[data-ecm-select-display').get(0)

    $(this.display).on('click',  e => { console.log('clicked display');  e.stopPropagation(); e.preventDefault()})
    $(this.display).find('a').first().on('click', _ => this.selected = false)
    // console.log('Got input', this.input)
    
    $(this.input).on("keyup", event => {
      if (event.which === 40 || event.which === 38 || event.which === 13) { return }
	this.showResults(this.input.value)
    })
    $(this.input).on("blur", event => { $(this.optionsUl).hide() })

    $(this.optionsUl).on('mouseover', e => {
       const hli = $(e.target).parents('li').get(0)

      // console.log('Monuseose==cver', $(e.target).parents('li'), e.target)
	$(e.currentTarget).find('li').each((_, li) => {
             if (hli == li) {
		 li.setAttribute('data-ecm-selected', true)
	     } else {
		 li.removeAttribute('data-ecm-selected')
	     }
	})
    });
			    
	    
	    
	
    $(this.element).on('keydown', e => this.onKeyDown(e));
    $(this.optionsUl).on('keydown', e => this.onKeyDown(e));

	$(element).on("click",function(event){
  	    $(element).find('.ecm-options').toggle();
	});

    }
		    

 EcmAutoComplete.prototype.autocompleteMatch = function (input) {
   // console.log('Matching', input, this.options)
    if (input == '') {
	return [];
    }
    var reg = new RegExp(input)
    return this.options.filter(function({val, text}) {
	if (text.match(reg)) {
  	    return {val, text};
	}
    });
}

EcmAutoComplete.prototype.showResults = function (val) {
    resq = $(this.element).find(".ecm-options")
    res = resq[0]
    if (!this.firstHTML) { this.firstHTML = res.innerHTML }
    res.innerHTML = '';

    let list = '';
    let terms = this.autocompleteMatch(val);
    for (i=0; i<terms.length; i++) {
	list += '<li data-ecm-option="'+terms[i].value+'"><a href="javascript:;">' + terms[i].text + '</a></li>';
    }
    resq.show()
    res.innerHTML = list || (this.input.value == '' ? this.firstHTML : '');
}


Object.defineProperty(EcmAutoComplete.prototype, 'selected', {
    get() { return this.selectedElement },
    set(v) {
	 this.selectedElement = v;
         const disp = v && v.firstChild && v.firstChild.firstChild
		 ? v.firstChild.firstChild.cloneNode(true) : " " //v.firstChild.cloneNode(true) : false
         // console.log('settong', v, disp)
        $(this.optionsUl).hide()
	 if (!v) {
	     $(this.display).css('z-index', '-42')
		 .hide().contents().filter((n) =>  n > 0 ).remove()
	     $(this.input).css('z-index', 'auto')
	 } else {
             
	     $(this.input).css('z-index', '-42')
	    // $(this.display).css('z-index', 'auto')
	     $(this.display).show().css('z-index', 'auto').append(disp)
	 }
	 return v
    }
});
EcmAutoComplete.prototype.selectToObject = (select) => {
  return {
	name: select.name,
        required: $(select).attr('required'),
	options: [... select.options].map(o => {
	    return obj = {
		value: o.value,
		text: o.text,
		selected: o.selected
	    }
	})
  }
};

EcmAutoComplete.prototype.elementHtml = `
   <div data-ecm-select-wrapper class="ecm-select uk-select">
    <input type="hidden" data-ecm-select-out>
    <form autocomplete="off">
    <div data-ecm-select-display><a class="ecm-close" href="#"></a></div>
     <input class='uk-input' type="text" data-ecm-select-text>
     <ul class="ecm-options" data-ecm-options></ul>
    </form>
   </div>`;

  EcmAutoComplete.prototype.makeEmptyElement = function(html = false) {
   const edoc = new DOMParser().parseFromString(html || this.elementHtml, "text/html"),
         child = edoc.body.firstChild
      return child;
  }
EcmAutoComplete.prototype.optionsUl = false;
EcmAutoComplete.prototype.addOptions = function (opts) {
    const ul = this.optionsUl 
    var list = ''
    
    for (i=0; i<opts.length; i++) {
	list += '<li data-ecm-option'
	    + ((val = opts[i].value) => {
	      if (val) {
		  return '="' + val + '"';
	      } else  { return '' }
	  })()
	    + '><a href="#">'+opts[i].text+'</a></li>'
	if (opts[i].selected) this.selected = opts[i]
    }

    ul.innerHTML = ul.innerHTML + list
}


	    
EcmAutoComplete.prototype.makeElement = function (name = '', opts = [], html = false) {
    const el = this.makeEmptyElement(html)
    // console.log('el', el)
    $(el).find('[data-ecm-select-name]').each((_, e) => {
	this.nameInput = e
	e.setAttribute('name', name)
    });
    $(el).find('[data-ecm-select-text]').each((_, e)  => { this.textInput = e });
    $(el).find('[data-ecm-options]').each((_, e) => {
	this.optionsUl = e
	this.addOptions(opts)
    });
   this.options = opts
   // console.log('el', el, ' opts ', this.options)
return el;
};

EcmAutoComplete.prototype.makeElementFromSelect = function (sel, html = false) {
 const {name, options} = this.selectToObject(sel)

 return this.makeElement(name, options)
}
EcmAutoComplete.prototype.elementCss = `
 .ecm-select { width: unset; position:relative; z-index: 1}

  .ecm-select input {
    background: unset;
    height: 30px;
     vertical-align: unset;
 }

     .ecm-options{
       background-clip: padding-box;
       background-color: #fff;
       border: 1px solid #dfe8f1;
       border-top: unset;
       border-radius: 3px;
       box-shadow: 0 1px 7px 2px rgba(135, 158, 171, 0.2);
       display: none;
       list-style: outside none none;
       padding: 0 0 10px;
       position: absolute;
       z-index: 0; 
       float: left;
       list-style: outside none none; max-height:220px; overflow:scroll;
       margin:0px;
       left:0px;
       right:0px;
       
     }

     ul.ecm-options li {
       float: none;
       display: block;
       clear: both;
       position: relative;
     }

     ul.ecm-options li a {
       padding: .9em 1em .9em .8em;
       position: relative;
       clear: both;
       cursor: pointer;
       display: block;
       white-space: nowrap;
       text-overflow: ellipsis;
       overflow: hidden;
       color: #4c4c4c;
       text-decoration: none;
       outline: 0;
     }
          ul.ecm-options li[data-ecm-selected] a {
     background: none repeat scroll 0 0 #eff4f6;
     cursor: pointer;
     text-decoration: underline;
	color: #1e87f0;
    }

 [data-ecm-select-display]  {
   position: absolute;
   top: 0px; right:0px; left: 0px; bottom: 0px;
   background: #f8f8f8;
   color: #666;
   display: none;
   padding-left: 1em;
 } 
 [data-ecm-select-display] a {
    float: right; 
	-webkit-appearance: none;
	-moz-appearance: none;
	width: 1em;
	height: 100%;
	margin: auto;
	margin-right: 0.5em;
        background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 14 14' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(25,25, 25, 1)' stroke-width='1' stroke-linecap='round' stroke-miterlimit='10' d='M1 1 L14 14 M1 14 L14 1'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-position: 100% 50%;
  }

  [data-ecm-select-display] a:hover {
     cursor: pointer;
     text-decoration: underline;
     color: #1e87f0; width: 1.33em;
    }

`;

EcmAutoComplete.prototype.appendStyle = function (replace = false) {
    const existing = $(document.head).data('ecm-autocomplete-style')
    if (existing && !replace) { return existing }
    
    const style = document.createElement('style')
    style.append(this.elementCss)
    $(document.head).append(style)
    $(document.head).data('ecm-autocomplete-style', style)
    return style;
}
 
          

      


EcmSPA.prototype.currentScript = document.currentScript;

EcmSPA.prototype.pathExpand = function (postfix = '', path = false) {
    const uri = path || this.currentScript.src.split('?')[0],
	  dir = path || uri.split('/').slice(0, -1).join('/')+'/'
    
    return dir + postfix;
}

 EcmSPA.prototype.fixScriptsSoTheyAreExecuted = (el) => {
var scripts = el.querySelectorAll('script'),
    script, fixedScript, i, len;

for (i = 0, len = scripts.length; i < len; i++) {
  script = scripts[i];

  fixedScript = document.createElement('script');
  // console.log(script)
  fixedScript.type = script.type;
  fixedScript.innerHTML = script.innerHTML;
  script.src ? fixedScript.src = script.src : false;
  script.onload ? fixedScript.onload = script.onload : false;
  fixedScript.async = false;

  script.parentNode.replaceChild(fixedScript, script);
}
}

window.addEventListener("load", (event) => {
    const ECM =  new EcmSPA();
    globalThis.ECM = ECM

    ECM.body = document.querySelector("#EcmSPA")

    ECM.loadScript(ECM.pathExpand('EcmSelect.js')).then(_ => {
 	ECM.loadElement(ECM.body.dataset.uri).then(main => {
            // console.log('fix scripts really means inner html', main);
	    //ECM.body.replaceChildren(main)
            //ECM.fixScriptsSoTheyAreExecuted(main)

            ECM.setInnerHTML(ECM.body, main.outerHTML);
          
	})
    })
});

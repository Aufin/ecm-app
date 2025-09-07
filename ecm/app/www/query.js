globalThis._debug_ = globalThis._debug_ || {}

function QueryDataTable(parent) {
    const editor = parent.querySelector('[data-query-editor]'),
	  results = parent.querySelector('[data-query-results]'),
	  spinner = parent.querySelector('[data-query-spinner]'),
	  code = makeEditorView({parent: editor}, this),
	  submit = document.createElement('button')

    // console.log("Opening query datatable:", parent, editor)
    submit.innerHTML = 'Submit'

    editor.append(submit)

    submit.onclick = _ => this.submitOnClick();
	      
    Object.assign(this, {
	parent,
	code, editor,
	submit, spinner,
	results})

    globalThis._debug_.qdt = this;
    return this;

}


EcmElement.define(QueryDataTable, 'data-query-datatable')



QueryDataTable.prototype.submitOnClick = async function () {
    UIkit.modal(this.spinner).show()
    let ret = {}
    try {
    	const obj = await this.submitQuery(),
	      tbl = (obj && !obj.error) ? this.renderTable(obj.result) : false
         // console.log('Sumbit Query Done', obj)
         ret = obj
    } catch (e) {
	// console.log('Err:',e)
	ret = { error: e }
    }


    UIkit.modal(this.spinner).hide()
    if (ret.error && ret.error.message
	&& typeof ret.error.message == "string")
    {
	const msg = ret.error.message,
	      txt = msg.startsWith('syntax error') ? "Syntax Error" : msg
	UIkit.notification(txt, {status:'warning', timeout: 1500})
    }
    
    return ret;
}


QueryDataTable.prototype.submitQuery = async function (query) {
    const q = (query || this.code.state.doc.toString()).replace(/[\n\r\s;]*$/g, ''),
	  response = await fetch(
	      '/rpc/query',
	      {
		  body: JSON.stringify({query: q}),
		  method: "POST"
	      }).catch(e => {
		  // console.log('Post Failed:', e)
		  return false;
	      })
    // console.log('Got return qeruy result', response)

    if (response.status == 200) {
        try {
	      const json = await response.json()
	      // console.log("Got Result!", json)
	      return json;
	    } catch (e) { console.log('error parsing json:', e)
              return { error: e } }
    } else {
	 const errmsg = await response.text()
         console.log("not good", errmsg)
	return { error: errmsg }
    }
					      

     //console.log(q, json)
   // return json

}


QueryDataTable.prototype.renderTable = function (obj) {
    const tbl = document.createElement('table'),
	  tr = () => document.createElement('tr'),
	  td = () => document.createElement('td'),
	  th = (txt) => {
	      const th = document.createElement('th');
	      if (txt) { (th.innerHTML = txt) };
	      return th
	  },
	  thead = document.createElement('thead'),
	  thr = tr();

    thead.append(thr); tbl.append(thead)

    tbl.classList.add('display')
    

    obj.columns.forEach(({name}) => {
	    thr.append(th(name))
    })
	    
	
    // console.log("Rendering Table", obj, tbl)

    this.results.append (tbl)
    if (this.table) {
       $(this.table).DataTable().destroy(true)
       }
    this.table = tbl;

    $(tbl).DataTable({ data: obj.data })

    return tbl;

}

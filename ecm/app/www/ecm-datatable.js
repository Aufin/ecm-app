DataTable.feature.register('interval', function (settings, opts) {

  container = document.createElement('div');

   container.innerHTML= `<div class="uk-form-small">
    <label class="uk-float-left uk-form-label">At least</label>
    <input class="uk-input" type="text" value="">
      <label class="uk-float-left uk-form-label"> old </label>
    
    <div>`;
    
   const Interval = new EcmInterval(container.querySelector('input'), opts);
   // console.log('interval', settings, opts, Interval);

  // window.FooDate = start;

   return container;
});

DataTable.feature.register('dateRange', function (settings, opts) {

  let container = document.createElement('div');

   container.innerHTML= '<input class="uk-input" type="text" value="">';

    const start = new EcmDateTime(
	container.firstChild,
	{ format: "yyyy-MM-dd" }
    );
   
   // console.log('datetime', start);

  window.FooDate = start;

   return container;
});

const EcmDataTable_map = new WeakMap();

function EcmDataTable (...args) {

    if (!new.target) {
	// console.log("Find EcmDataTable", args[0])
    } else {
        const [sel, query, opts] = args,
	      parent = (typeof sel == "string") ? document.querySelector(sel) : sel,
	      table = parent.tagName == "TABLE" ? parent : (_ => {
		  const tbl = document.createElement('table')
		  parent.append(tbl)
		  return tbl;
	      })(),
	      parameters = this.sentParameters(opts)
	Object.assign(this, {
	    parent, table, parameters, opts, query,
	    pageRedrew: false})

	// console.log("Make EcmDataTable from", sel, this)
	EcmDataTable_map.set(parent, this);
	EcmDataTable_map.set(table, this);

        

	this.promise = this.submitQuery(query).then((ret) => {
            const { result } = ret;
	    // console.log('Got Query Result', ret)
          this.datatable = new DataTable(
	      table,
	      Object.assign(
		  opts, {columns: this.result2columns(result) },
		  opts.ajax ? { ajax: this.ajax() } : { data: result.data }
	      )
	  );
	    
	    // this helps to redraw the paging which is not accurate
	    // with our ajax yet
	    
           this.datatable.columns.adjust()
            this.table.onmouseover = (e) => {
	       this.datatable.columns.adjust();
	       this.table.onmouseover = null
	   } ;

            return result;
          
	}).catch(e => {
	    console.error('Error on query sumbit', e)
	})


     
    }

}

EcmElement.define(EcmDataTable, 'data-ecm-datatable')


EcmDataTable.prototype.result2columns = function (result) {
    return result.columns.map(col => Object.assign({}, { title: col.name }, col))
}


    
EcmDataTable.submitQuery = async function (query, args, opts) {
    function encodeString(str, key = 42) {
	const int = (() => {
	    const n = parseInt(key)
	    if (isNaN(n)) {
	    return 42
	    }
	    
	    return n
	})(),
	      vector = Array.from(str, char => char.charCodeAt(0));
	return vector.map(n => n + int)
    }
    
    const a = args,
	  qstr = query.replace(/[\n\r\s;]*$/g, ''),
	  q = encodeString(qstr, 42)
    // Doing it server side, only get the col names.
    if (opts && opts.serverSide && !a['draw']) {
	a.length = 0
        a.order = []
    }
    
    // console.log("submit", query, a)
    const response = await fetch(
	      '/rpc/query.ss',
	      {
		  body: JSON.stringify({query: q, args: a }),
		  method: "POST"
	      }).catch(e => {
		  console.log('Post Failed:', e)
		  return { error: e } ;
	      })
    // console.log('Got return qeruy result', response)

    if (response.status == 200) {
        try {
	      const json = await response.json()
	    //  console.log("Got Result!", json)
	      return json;
	} catch (e) {
	     // console.log('error parsing json:', e)
              return { error: e } }
    } else {
	 const errmsg = await response.text()
        // console.log("not good", errmsg)
	return { error: errmsg }
    }
					      
}



EcmDataTable.prototype.submitQuery = function (query, args) {
    const a = args || this.parameters, o = this.opts
    return EcmDataTable.submitQuery(query, a, o)
}

EcmDataTable.prototype.reload = function () {
    return this.promise.then(_ => {
	return this.submitQuery(this.query).then((ret) => {
	    this.datatable.clear()
            this.datatable.rows.add(ret.result.data).draw()
	    // console.log('Reloaded', ret)
	})
    })
}

EcmDataTable.prototype.sentParameters = function (opts) {
    const params = {},
	  opt = (name) => { if (name in opts) { params[name] = opts[name] } };
    ['draw', 'start', 'length', 'search', 'order', 'columns'].forEach(opt);

    if (opts.pageLength) { params.length = opts.pageLength };

    
    return params
}

EcmDataTable.prototype.ajax = function () {
   const that = this, finished =  ev => {
       	  console.log('ajaxx finished', ev, this)
      }
   return (data, callback, settings) => {
     console.log("DOing Ajax:", that, data, callback, settings)
      // thi.datatable.on('xhr.dt',)
       this.submitQuery(this.query, data).then(({result}) => {
	   // console.log('Got Result:', result)
	   callback(result)
           that.datatable.columns.adjust()
           that.table.onmouseover = (e) => {
	       that.datatable.columns.adjust();
	       that.table.onmouseover = null
	   } ;
           // console.log('Callback', result, that, that.datatable)
         
       })
   }
}

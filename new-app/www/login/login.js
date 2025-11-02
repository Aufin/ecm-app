const ready = fn => document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);
 // Example POST method implementation:

async function getEntraRequest() {
 const res = await fetch('/rpc/entra.ss'), 
       jso = await res.json()
 return jso
}

async function getEntraURL() {
    const obj = await getEntraRequest(),
	  url = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize")
	 //  url = new URL("https://login.microsoftonline.com/" + obj.tenant + "/oauth2/v2.0/authorize")
    for (const key in obj) {
	const val = obj[key]
	if (!!val) {
	    url.searchParams.append(key, val)
	}
    }

    return url.toString();
    
}

function decodeJwtManually(token) {
  try {
      const parts = token.split('.');
      if (parts.length !== 3) {
          throw new Error("Invalid JWT format.");
      }

      const base64UrlPayload = parts[1];
      const base64Payload = base64UrlPayload.replace(/-/g, '+').replace(/_/g, '/'); // Convert Base64Url to Base64
      const decodedPayload = decodeURIComponent(atob(base64Payload).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(decodedPayload);
  } catch (error) {
      console.error("Error decoding JWT manually:", error);
      return null;
  }
}
    
async function postDataReset(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
	method: "POST", // *GET, POST, PUT, DELETE, etc.
	mode: "cors", // no-cors, *cors, same-origin
	cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
	//credentials: "same-origin", // include, *same-origin, omit
	headers: {
	    "Content-Type": "application/json",
	    // 'Content-Type': 'application/x-www-form-urlencoded',
	},
	//redirect: "follow", // manual, *follow, error
	//referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
	body: JSON.stringify(data), // body data type must match "Content-Type" header
    });

    if (response.ok) {
	return response.json();
    } else {
	return {
	    error: response.statusText,
	    status: response.status,
	    response: response
	}
    }
}

function raiseUnknownError(obj) {
    const ue = document.getElementById("UnknownError")

    ue.hidden = false 
    document.getElementById("resetForm").hidden = true
    document.getElementById("resetSpinner").hidden = true

    if (obj) {
	try {
	    ue.getElementsByTagName("code")[0].innerHTML = JSON.stringify(obj)
	} catch (e) {
	    console.error("Error in Raise:", e)
	}
    }
}

function notifySuccess() {
    document.getElementById("UnknownError").hidden = true
    document.getElementById("resetForm").hidden = true
    document.getElementById("resetSpinner").hidden = true

    document.getElementById("resetSuccess").hidden = false
}

function send_reset_mail() {
    const email = document.getElementById("recoverInput").value 
    return fetch(`/ecm/login/reset.json?email=${encodeURIComponent(email)}`)
	.then(e => e.json())
}



function addRecoverListener() {
    const form = document.getElementById("recoverForm");
    if (!form) return;

    const spin = document.getElementById("recoverSpinner"),
	  done = document.getElementById("recoverSuccess"),
	  nope = document.getElementById("recoverNotFound"),
	  ue = document.getElementById("UnknownError")

    
    form.addEventListener("submit", (e) => {
	e.preventDefault();

	spin.hidden = false
	form.hidden = true
	done.hidden = true
	nope.hidden = true
	
	try {
	    send_reset_mail().then(res => {
		console.log("Get results", res)
		spin.hidden = true
		res ? done.hidden = false : nope.hidden = false 
		
	    }).catch(e => {
		console.log("unknown error", e)
		spin.hidden = true
		ue.hidden = false
	    })
	    
	} catch(e) {
	    spin.hidden = true
	    ue.hidden = false
            console.warn('caught', e)
	}
         
    })
}
	
ready(function() {
    addRecoverListener()
    
    const form = document.getElementById("resetForm");
    if (form) {
	
	console.log('reset form here')

	
        form.addEventListener("submit", function (event) {
  	    event.preventDefault();
            const args = new FormData(form),
  		  p = args.get("p"),
  		  rp = args.get("rp"),
  		  tok = args.get('token')

            document.getElementById("Invalid").style.display =  (p !== rp) ? "block" : "none";

  	    console.log('tok', tok, p, rp); 

  	    if (p === rp) {
		const spin = document.getElementById("resetSpinner")
		spin.hidden=false
		form.hidden=true
		
		postDataReset("#", {
		    token: tok,
		    pw: p
		}).then(res => {
		    if (res.error) {
			raiseUnknownError(res)
		    } else {
			console.log("get legit object", res)
			notifySuccess()
			setTimeout(() => document.location.href='/', 3500)
		    }
		}).catch(e => {
		    raiseUnknownError()
		    console.error("Unknown:", e)
		})

		
            }   
            
        })
    }

    const failure = new URLSearchParams(window.location.search).get("_f")
    if (typeof failure == "string") {
	document.getElementById("Invalid").style.display = "block"
    }
})

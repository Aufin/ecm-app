(import :std/net/httpd :std/net/uri
        :std/format :std/db/dbi :std/text/utf8
	:std/text/json :std/sugar
	"../db" "../req" "../user")

(export handle-request)

(def client-id "8fdd452d-a798-4f40-b2af-2fd2e7023d51")
(def tenant "21687e5e-cd21-49ee-95c3-e8abb6ed30a6")

(def (get-openID-request (json "{}"))
  (car (ecm-sql
	sql-eval-query
	"SELECT openID_request($1)" 
	json)))

(def (make-request-args)
  (json-object->string
   (hash ; ("tenant" tenant)
	 ("client_id" client-id))))

(def (entra-jwt-page params)
  (format 
  #<<EOF
  <html>
  <head>
   <script src="/login/login.js"></script>
   <script src="/extern.js"></script>
  </head>
  <body> ~a 
  <script defer>
  ready(function() {
  const tok = "~a"
  console.log("got it", )
  		       
  })
		</script> </body> </html>
EOF
(with-output-to-string "" (cut write params))
(aget "id_token" params)
))
  
		

(def (handle-request req res)
  (def method (http-request-method req))
  (def body (let (bdy (http-request-body req))
	      (and bdy (utf8->string bdy))))
  (def params (and body (form-url-decode body)))
  (def url (http-request-url req))
  
   (if (eq? method 'GET)
  (http-response-write
   res 200 '(("Content-Type" . "application/json"))
   (get-openID-request (make-request-args)))
  (http-response-write
   res 200 '(("Content-Type" . "text/html"))
     (entra-jwt-page params))))

#;(json-object->string (hash ("body" )))
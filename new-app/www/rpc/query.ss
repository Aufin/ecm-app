(import
  :std/net/httpd :std/net/uri :std/sugar
  :std/format :std/db/dbi :std/interactive
  "../db.ss" "../req" "../user"
  :std/text/json :std/error
  :std/actor-v18/message :std/text/utf8)

(export handler-init! handle-request)

(def (handler-init! . args) args)

(def (eval-query query args)
  (car
   (ecm-sql
    sql-eval-query "SELECT DataTables_eval_query($1::text, $2::json)"
    query args)))

(def (error->json e)
  (json-object->string
   (hash ("error" 
	 (hash ("message" (error-message e))
		("irritants" (format "~a" (error-irritants e)))
		("trace" (format "~a" (error-trace e))))))))

(def (decode-vector u8v (key 42))
  (utf8->string (list->u8vector (map (cut - <> key) (u8vector->list u8v)))))

(def handle-request
  (user-request-handler
   (lambda (req res)
     (def jres "{\"error\": \"No Run\"}")
     
     (try
      ;; (def params (form-url-decode (or (http-request-params req) "")))
      (def method (http-request-method req))
      (def body (http-request-body req))
      (def json (and body (utf8->string body)))
      (def jso (and json (string->json-object json)))
      (def maybe-query (and jso (hash-get jso "query")))
      (def query (if (string? maybe-query) maybe-query
		     (decode-vector (list->u8vector maybe-query))))
      (def args-hash (and query (hash-get jso "args")))
      (def args (if args-hash (json-object->string args-hash) "{}"))
      (def result (and query (eval-query query args)))
      (set! jres
	(format "{ \"method\": \"~a\", \"query\": ~s, \"result\": ~a }"
		method (or query 'false) (or result 'false)))
      (catch (e)
	(set! jres (error->json e))))
	  
   (http-response-write
    res 200 '(("Content-Type" . "application/json"))
    jres))))

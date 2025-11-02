;; The =RPC= handlers



;; [[file:../../Bordereau.org::*The =RPC= handlers][The =RPC= handlers:1]]
(import
  :std/net/httpd :std/net/uri :std/sugar
  :std/format :std/db/dbi :std/interactive
  "../db.ss" "../req" "../user"
  :std/actor-v18/message :std/text/utf8
  :std/text/json)

(export handler-init! handle-request)

(def (handler-init! cfg) #t)

(def (bordereau-defs)
  (car
   (ecm-sql sql-eval-query #<<EOF
--SELECT to_json(bdx_def) FROM
 SELECT json_build_object(
 'types', (SELECT json_agg(tt) FROM report_bdx_type tt),
 'froms', (SELECT json_agg(f) FROM report_bdx_from f),
 'col_defs', (SELECT json_agg(cd) FROM report_bdx_col_def cd),
 'cols', (SELECT json_agg(col) FROM report_bdx_col col))

EOF
)))

(def (create-bordereau json)
  (car (ecm-sql sql-eval-query "SELECT
  json_build_object('ps', to_json(ps), 'table_name', ps.table_name,
   'status', ps.status, 
       'timeEstimate',COALESCE((select sum(ip.\"end\" - ip.start) / count(*)
                 FROM report_bdx_ps ip WHERE ip.for::jsonb @> ps.for::jsonb
                  AND ip.end IS NOT NULL), '00:15:00'))
    FROM report_create_bdx(
       $1::json->>'type', $1::json->'for',
       daterange(CAST($1::json->>'start' as date),CAST($1::json->>'end' as date))) ps"
	     json)))

(def (get-bordereau-status table-name)
  (car (ecm-sql sql-eval-query "SELECT
     json_build_object('status', to_json(status))
   FROM report_bdx_ps rb WHERE table_name = $1::text"
    table-name)))
		
(def bordereau-threads (make-hash-table))
(def (spawn-bordereau-thread table-name)
  (let ((pool (current-db-conpool))
        (con (current-db-conpool-constructor)))
    (def (run-bdx)
     (parameterize ((current-db-conpool pool)
		    (current-db-conpool-constructor
		     con))
       (ecm-sql sql-eval-query
		"call report_run_bdx($1::text, NULL::report_bdx_ps)"
		table-name)))
    (def thread (spawn run-bdx))
    (hash-put! bordereau-threads table-name thread)
    thread
    ;;(run-bdx)
    ))

(def handle-request
  (user-request-handler
   (lambda (req res)
     (def method (http-request-method req))
      ;; (def params (form-url-decode (or (http-request-params req) "")))
      ;; (def upsert (assget "upsert" params 'nope))
      (def body (http-request-body req))
      (def json (and body (utf8->string body)))
      (def jso (and json (string->json-object json)))
      (def status (and jso (hash-get jso "status")))
      (def get (and jso (hash-get jso "get")))
      (def ret (if (eq? method 'GET)
		 (bordereau-defs)
		 (if status
		   (get-bordereau-status status)
		   (create-bordereau json))))
      
       
      
      (begin0
	  (http-response-write
	   res 200 '(("Content-Type" . "application/json"))
	   ret)
	
	(when (and (eq? method 'POST) (not status))
	  (let ((table-name (hash-get (string->json-object ret) "table_name")))
					;(error "Ttable Name" table-name)
	     (spawn-bordereau-thread table-name)))
	
	
   ))))
;; The =RPC= handlers:1 ends here

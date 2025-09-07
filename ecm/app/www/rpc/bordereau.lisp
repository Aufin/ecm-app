;; The =RPC= handlers



;; [[file:../Bordereau.org::*The =RPC= handlers][The =RPC= handlers:1]]
(import
  :std/net/httpd :std/net/uri :std/sugar
  :std/format :std/db/dbi :std/interactive
  "../db.ss" "../req" "../user"
  :std/actor-v18/message :std/text/utf8)

(export handler-init! handle-request)

(def (handler-init! cfg) #t)

(def (bordereau-defs)
  (car
   (ecm-sql sql-eval-query #<<EOF
SELECT to_json(bdx_def) FROM
 (SELECT json_agg(colds) AS "col_defs", json_agg(frm) AS "froms",
       json_agg(typ) AS types, json_agg(col) AS cols
 FROM report_bdx_from frm, report_bdx_col_def colds,
      report_bdx_type typ, report_bdx_col col) bdx_def;
EOF
)))
	    
		

(def handle-request
  (user-request-handler
   (lambda (req res)
      ;; (def params (form-url-decode (or (http-request-params req) "")))
      ;; (def upsert (assget "upsert" params 'nope))
      ;; (def body (http-request-body req))
      ;; (def json (and body (utf8->string body)))

      ;; ;; (error "Upsert" upsert json)

      ;; (def results
      ;; 	  (cond
      ;; 	   ((not (eq? upsert 'nope))
      ;;     (upsert-diary json))
      ;; 	   (else (diary (or json "{}")))))

   (http-response-write
    res 200 '(("Content-Type" . "application/json"))
    (bordereau-defs)))))
;; The =RPC= handlers:1 ends here

(export #t)

(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19 :std/format
  "../../db" "../../req" "../../user")

(export handle-request)

(def (esql q . args)
  (apply ecm-sql sql-eval-query q args))

(def (json-object<-sql-eval-query db query . args)
  (def stmt (sql-prepare db query))
  (def cols (sql-columns stmt))
  (when (pair? args) (apply sql-bind stmt args))
  (def rows (sql-query stmt))
  (when (and (pair? rows)
             (not (vector? (car rows))))
    (set! rows (map vector rows)))
  (hash (query query)
        (args args)
        (cols cols)
        (rows rows)))

(def (json-object<-syndicate-mi id month year)
  (ecm-sql json-object<-sql-eval-query
   "SELECT (tmhcc_monthly_mi_report(person,
                    (make_date($3, $2, 1) + INTERVAL '1 Month')::date)).*
                    FROM person WHERE person_id = $1"
   id month year))

(def (contract-mi id month year)
  (car (esql
    "SELECT (tmhcc_monthly_mi_report(contract,
             make_date($3, $2, 1) + INTERVAL '1 Month')).*
      FROM contract WHERE contract_id = $1"
   id month year)))

(def (pmi/POST req res)
  (def body (http-request-body req))
  (def json (utf8->string body))
  (def jso (string->json-object json))
  (def ret
    (let-hash jso
      (let ((month .$month)
            (year .$year)
            (syn  .$syndicate_id))
	year
	(json-object<-syndicate-mi syn month year)
	#;(json-object->string )
        )))
     (http-response-write
      res 200 '(("Content-Type" . "application/json"))
      (json-object->string ret)))

(def handle-request
  (user-request-handler
   (lambda (req res)
     (pmi/POST req res))))

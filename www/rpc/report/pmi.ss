(export #t)

(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19 :std/format
  "../../db" "../../req" "../../user")

(export handle-request)

(def (esql q . args)
  (apply ecm-sql sql-eval-query q args))

(def (pmi/GET res)
  (def syns (esql "
SELECT json_build_object('syndicates', syna)
 FROM (SELECT json_agg(row_to_json(syns)) AS syna
     FROM (SELECT
            person_name(syndicate_id) AS name,
            syndicate_id,
            max(effective_date) AS latest_effective,
            count(*) AS number_of_contracts
            FROM contract
            WHERE syndicate_id IS NOT NULL
           GROUP BY syndicate_id
           ORDER BY number_of_contracts DESC,
           latest_effective DESC, name) syns) moresyns"))
  
     (http-response-write
      res 200 '(("Content-Type" . "application/json"))
       (car syns)))


(def (syndicate-pmi id start end lob risk-codes include-risk-codes)
  (let ((res (esql
              "SELECT mi_report_spreadsheet(mi_report($1, $2, $3::int, $4, $5, $6))"
              start end id lob
              risk-codes include-risk-codes)))
    (if (pair? res)
      (car res)
      (error "No Result for syndicate pmi"))))

(def (contract-pmi id start end lob)
  (car (esql "SELECT mi_report_spreadsheet(mi_report($1, $2, contract, $4))
   FROM contract WHERE contract_id = $3::int"
   start end id lob)))

(def (pmi/POST req res)
  (def body (http-request-body req))
  (def json (utf8->string body))
  (def jso (string->json-object json))
  ;(error (hash-ref jso start_date))
  (def ret
    (let-hash jso
      ;;(error "Hey now" .line_of_business .syndicate_id (substring .start_date 0 10))
      (let ((start  (substring .$start_date 0 10))
            (end (substring .$end_date 0 10))
            (syn  .$syndicate_id)
            (con .$contract_id)
            (lob (and (not (void? .$line_of_business))
                      .$line_of_business))
            (risk-codes .$risk_codes)
            (inc .$include_risk_codes))
        (displayln "RC's" risk-codes inc)
        (if con
          (contract-pmi con start end lob)
          (syndicate-pmi syn start end lob risk-codes inc)))))
  
     (http-response-write
      res 200 '(("Content-Type" . "application/json")) ret))

(def handle-request
  (identity #;user-request-handler
   (lambda (req res)
     (def method (http-request-method req))
     (def body (and (eq? method 'POST)
		    (http-request-body req)))
     (def json (and body (utf8->string body)))
     (def jso (and json (string->json-object json)))
     (def ret
       (if (not jso)
	 (let (syns (esql "
SELECT json_build_object('syndicates', syna)
 FROM (SELECT json_agg(row_to_json(syns)) AS syna
     FROM (SELECT
            person_name(syndicate_id) AS name,
            syndicate_id,
            max(effective_date) AS latest_effective,
            count(*) AS number_of_contracts
            FROM contract
            WHERE syndicate_id IS NOT NULL
           GROUP BY syndicate_id
           ORDER BY number_of_contracts DESC,
           latest_effective DESC, name) syns) moresyns"))
	   (car syns))
	 (let-hash jso
      ;;(error "Hey now" .line_of_business .syndicate_id (substring .start_date 0 10))
      (let ((start  (substring .$start_date 0 10))
            (end (substring .$end_date 0 10))
            (syn  .$syndicate_id)
            (con .$contract_id)
            (lob (and (not (void? .$line_of_business))
                      .$line_of_business))
            (risk-codes .$risk_codes)
            (inc .$include_risk_codes))
        #;(displayln "RC's" risk-codes inc)
        (if con
          (contract-pmi con start end lob)
          (syndicate-pmi syn start end lob risk-codes inc))
	#;(json-object->string
	 (hash (start start)
	       (end end)
	       (syndicate syn)
	       (contract con)
	       (line_of_business lob)
	       (risk-codes risk-codes)
	       (use-risk-codes inc)))

	))))
     (http-response-write
		res 200 '(("Content-Type" . "application/json"))
		ret)))
  #;(user-request-handler
   (lambda (req res)
     (if (eq? (http-request-method req) 'GET)
       (pmi/GET res)
       (pmi/POST req res)))))

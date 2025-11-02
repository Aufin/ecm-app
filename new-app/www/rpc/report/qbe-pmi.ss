(export #t)

(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19
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

(def (syndicate-qbe-pmi id start end)
  ;(displayln "Running prod syndicate QBE-PMI" id start end)
  ;(begin0
      (let ((res
             (esql
              "SELECT mi_report_qbe_spreadsheet($1::int, $2, $3)"
              id start end)))
	(car res)))
      
					;(displayln "Finisged Syn QBE-PMI"))


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
        ;;(displayln "RC's" risk-codes inc)
	(syndicate-qbe-pmi syn start end))))
  
     (http-response-write
      res 200 '(("Content-Type" . "application/json")) ret))

(def handle-request
  (user-request-handler
   (lambda (req res)
     (if (eq? (http-request-method req) 'GET)
       (pmi/GET res)
       (pmi/POST req res)))))

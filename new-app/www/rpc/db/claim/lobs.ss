(export #t)
(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/json
  "../../../db" "../../../req" "../../../user")

(export handle-request)


(def lobs-text "
SELECT json_build_object('lines_of_business', lobs)
 FROM (SELECT json_agg(DISTINCT (claim).line_of_business) AS lobs
       FROM claim_view
        WHERE (claim).line_of_business IS NOT NULL
         AND ($1::int IS NULL OR (contract).syndicate_id = $1)
              AND ($2::int IS NULL OR (contract).contract_id = $2)
      ) c
    ")

(def handle-request
  (user-request-handler
   (lambda (req res)
     (def body (http-request-body req))
     (def jso (and body (bytes->json-object body)))
  (def ret
    (let-hash jso
      (let ((syndicate-id .?syndicate_id)
            (contract-id .?contract_id))
     (match 
	 (ecm-sql
	  sql-eval-query 
	  lobs-text syndicate-id contract-id)
       ([obj] obj) (else "false")))))
     
  (http-response-write
   res 200 '(("Content-Type" . "application/json")) ret))))

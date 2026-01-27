(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19

  :std/format
  "../../db" "../../req" "../../user")

(export handle-request)

(def (fetch-examiners) 
  (def (esql q . args)
	(apply ecm-sql sql-eval-query q args))


  (def exam-text "
    SELECT json_agg(ex) FROM examiner ex
    ")

  (car (esql exam-text)))

(def (fetch-movements claim-id)
  (def (esql q . args)
	(apply ecm-sql sql-eval-query q args))
  (car (esql "SELECT COALESCE(js, '[]'::json) FROM (
      SELECT json_agg(cm ORDER BY time) AS js
      FROM claim_movement($1::int) cm) cmjs" claim-id)))

(def handle-request
  (user-request-handler
   (lambda (req res)

     (def body (http-request-body req))
     (def json (and body (string->json-object (utf8->string body))))
	 (def claim-id (and json (hash-get json "claim_id")))
     (def examiners (fetch-movements claim-id))

     (http-response-write
      res 200 '(("Content-Type" . "application/json"))
	  examiners))))

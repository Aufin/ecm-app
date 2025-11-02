(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19
  "../../../db" "../../../req" "../../../user")

(export handle-request)


(def (esql q . args) (apply ecm-sql sql-eval-query q args))



(def (find-interims claim_id)
  (def c (esql "SELECT json_agg(timecard_interim_view_to_json(ctiv.*)) FROM (SELECT * FROM claim_timecard_interim_view($1::int) ctiv ORDER BY date) ctiv;
" claim_id))
  (car c))

(def (find-interim-report interim-id)

   ;; (error interim-id)
  (json-object->string
   (ecm-sql json-object<-sql-eval-query
   "SELECT * FROM timecard_report WHERE timecard_interim_id = $1 ORDER BY date;"
   interim-id)))

(def handle-request
  (user-request-handler
   (lambda (req res)
     (def body (http-request-body req))
     (def json (utf8->string body))
     (def jso (string->json-object json))
     (def is (let-hash jso
               (if .?claim_id
		 (find-interims .$claim_id)
		 (find-interim-report .$interim_id))))
     (http-response-write
      res 200 '(("Content-Type" . "application/json"))
      is))))

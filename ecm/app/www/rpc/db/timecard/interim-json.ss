(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19
  "../../../db" "../../../req" "../../../user")

(export handle-request)


(def (esql q . args) (apply ecm-sql sql-eval-query q args))

(def (find-interim-json interim-id)
  (def ijs (esql "
SELECT timecard_interim_view_to_json(tciv)
 FROM timecard_interim_view tciv WHERE timecard_interim_id = $1;
" interim-id))
  (car ijs))

(def handle-request
  (user-request-handler
   (lambda (req res)
     (def body (http-request-body req))
     (def json (utf8->string body))
     (def jso (string->json-object json))
     (def ij (let-hash jso
               (find-interim-json .$interim_id)))
     
     (http-response-write
      res 200 '(("Content-Type" . "application/json"))
      ij))))

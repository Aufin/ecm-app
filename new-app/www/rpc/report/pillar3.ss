(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19
  "../../db" "../../req" "../../user"
  (only-in "../../db"
	   json-object<-sql-eval-query))

(export handle-request)

(def pillar3-query-text "SELECT * from pillar_3(
  $1::int,
  $2::timestamp without time zone,
  $3::timestamp without time zone)")

(def (json-object<-pillar3 syndicate-id start-date end-date)
  (ecm-sql json-object<-sql-eval-query
   pillar3-query-text syndicate-id start-date end-date))

(def (pillar3/POST req res)
  (def body (http-request-body req))
  (def json (utf8->string body))
  (def jso (string->json-object json))
  ;(error (hash->list jso))
  (def ret
    (let-hash jso
      (json-object<-pillar3
       .$syndicate_id
       (substring .$start_date 0 10)
       (substring .$end_date 0 10))))

     (http-response-write
      res 200 '(("Content-Type" . "application/json"))
      (json-object->string ret)))


(def handle-request
  (user-request-handler pillar3/POST))

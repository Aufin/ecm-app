(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19
  "../../db" "../../req" "../../user"
  (only-in "../../db"
	   json-object<-sql-eval-query))

(export handle-request)

(def d-text
  "SELECT * FROM diary_report($1, $2, $3, $4)")

(defmethod {:json date}
  (lambda (self) (date->string self "~4"))
  rebind: #t)

(def (json-object<-diary deadline user-id overdue start-date)
  (ecm-sql json-object<-sql-eval-query
	   d-text deadline user-id overdue start-date))

(def (diary/POST req res)
  (def body (http-request-body req))
  (def json (utf8->string body))
  (def jso (string->json-object json))
  (def ret (let-hash jso
	     (json-object<-diary
              .$deadline .$user_id .$overdue .$start_date)))
  (http-response-write
   res 200 '(("Content-Type" . "application/json"))
   (json-object->string ret)))


(def handle-request
  (user-request-handler diary/POST))
(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19
  "../../db" "../../req" "../../user"
  (only-in "../../db"
	   json-object<-sql-eval-query)
  )

(export handle-request)

(def q-text
  "SELECT * FROM claim_generic_report($1::json) g")

(defmethod {:json date} (lambda (self) (date->string self "~4"))
  rebind: #t)


(def handle-request
  (user-request-handler
   (lambda (req res)
     (def body (http-request-body req))
     (def jso (utf8->string body))
     (def ret (ecm-sql json-object<-sql-eval-query
		       q-text jso))

     (http-response-write
      res 200 '(("Content-Type" . "application/json"))
      (json-object->string ret)))))
     
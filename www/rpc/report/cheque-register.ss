(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19
  "../../db" "../../req" "../../user"
  (only-in "../../db"
	   json-object<-sql-eval-query))

(export handle-request)

(def cr-text "SELECT * FROM cheque_register_report($1)")

(def (json-object<-cheque-register json)
  (ecm-sql json-object<-sql-eval-query
	   cr-text json))

;; TODO: Restart and delete this def
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

(def (cheque-register/POST req res)
  (def body (http-request-body req))
  (def json (utf8->string body))
  ;(def jso (string->json-object json))
  ;(error (hash->list jso))
  (def ret (json-object<-cheque-register json))
  (http-response-write
   res 200 '(("Content-Type" . "application/json"))
   (json-object->string ret)))


(def handle-request (user-request-handler cheque-register/POST))

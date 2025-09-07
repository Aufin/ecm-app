(import
  :std/net/httpd :std/net/uri :std/sugar
  :std/format :std/db/dbi :std/interactive
  "../db.ss" "../req" "../user"
  :std/actor-v18/message)

(export handler-init! handle-request)

(def (handler-init! cfg)
  #t)

(def handle-request
  (user-request-handler
   (lambda (req res)
      (def params (form-url-decode (or (http-request-params req) "")))
      (def user-id (assget "user-id" params))
      (def draw (assget "draw" params))
      (def limit (assget "length" params))
      (def offset (assget "start" params))
      (def results '(diary user-id (or limit 10) (or offset 0) (or draw 1))))
   (http-response-write
    res 200 '(("Content-Type" . "application/json"))
    "{data: []}")))

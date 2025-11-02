(import :std/net/httpd
	:gerbil/tools/gxhttpd
        :std/format  :std/db/dbi :std/interactive
	:std/actor "../../www/db" "dyn"
	#;(prefix-in "../../www/login/login" L.))

(export handler-init! handle-request)

(def state "not initialized")

(def (handler-init! cfg)
  (set! state 'initialized))


(def (handle-request req res)
  (http-response-write
   res 200 '(("Content-Type" . "text/plain"))
   (format "Here again now! ~a ~a" state (make-display-string))))
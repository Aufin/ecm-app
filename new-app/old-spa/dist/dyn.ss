(import :std/net/httpd
	:gerbil/tools/gxhttpd 
        :std/format  :std/db/dbi :std/interactive
	:std/actor "../../www/db"
	:std/sugar
	(prefix-in "./servlet.ss" S.))

(export handler-init! handle-request make-display-string)

(def state "not initialized")

(def (handler-init! cfg)
  (set! state 'initialized))

(def (make-display-string)
  (format "display-string: ~a" state))

(def (handle-request req res)
  (try 
   (ecm/gui/dist/servlet#handle-request req res)
   (catch (e) (error "Dyn failed"))))
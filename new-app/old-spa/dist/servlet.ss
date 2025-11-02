(import :std/net/httpd
	:gerbil/tools/gxhttpd
        :gerbil/expander
        :gerbil/core
        :gerbil/gambit
        :std/format  :std/db/dbi :std/interactive
	:std/actor #;"../../www/db"
	#;(prefix-in "../../www/login/login" L.))

(export handler-init! handle-request)

;; (extern namespace: gerbil/main
;;   find-runtime-symbol)

(extern namespace: gerbil/tools/gxhttpd
   find-servlet-handler)

(def state "not initialized")

(def (handler-init! cfg)
  (set! state 'initialized))

(def handler-alist
  `(("/rpc/login" . "./login.ss")
    ("/dyn.ss" . "./login.ss")
    ("/servlet.ss" . "./login.ss")))

(def mx (make-mutex 'ecm-servlet))
(def cache (make-hash-table-string)) 

(def (find-serv-handler req)
   (let* ((path (http-request-path req))
 	  (file-path (or (aget path handler-alist)
			 "./login.ss")))
     (find-servlet-handler cache mx file-path)))

(def (handle-request req res)
  (or (let (h (find-serv-handler req))
	(and h (h req res)))
      (http-response-write
       res 404 '(("Content-Type" . "text/plain"))
       "asd")))
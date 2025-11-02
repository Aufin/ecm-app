(import :std/logger :std/error)
(export server-init!)

(def (server-init! . args)
  (def logfile
	(open-output-file
	 [path:
	  "/srv/ecm/var/log/ecm-appd/httpd.log"
	  append: #t]))
  (current-logger #f) 
  (start-logger! logfile)
  ;(current-logger-options 2)

  (infof "Started HTTPD: ~a " args))

  
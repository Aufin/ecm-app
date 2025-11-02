(import :std/net/httpd
        :std/format  :std/db/dbi :std/interactive
		:std/actor
		:std/logger
		:std/sugar
		:std/markup/html
		:ecm/www/db
		:ecm/www/conf
		:ecm/www/user)

(export #;handler-init! handle-request)

(def (handler-init! cfg) 42)

(def (handle-request req res)
  (http-response-write
      res 200
	  '(("Content-Type" . "text/html"))
	  (try
	   (format "REPL will be here as html! formatted and log started <hr> imported? ~a ~a"
			   (current-log-directory)
			   (html-escape (with-output-to-string (cut display (current-error-port) ))))
	   (catch (e)
		(format "Error: ~a" html-escape)))))
  
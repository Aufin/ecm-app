(import :std/net/httpd
	:gerbil/tools/gxhttpd
        :std/format  :std/db/dbi :std/interactive
	:std/actor "../../www/db")

(export handler-init! handle-request)

(def state "not initialized")

(def (handler-init! cfg)
  (set! state 'initialized))

(def (handle-request req res)
  (gx#import-module "dyn.ss" #t #t) 
  (gx#import-module "login.ss" #t #t) 
  (http-response-write
      res 200 '(("Content-Type" . "text/plain"))
      (format "In Fake for Old SPA: ~a\n~a\n~a\n~a"
	      (ecm-sql sql-eval-query "
Select  max(claim_id), pg_read_file('/etc/hostname') as hostname FROM claim")
	      (current-http-server) (load-path) (current-directory))))
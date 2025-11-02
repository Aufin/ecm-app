;; This is for the old-spa

;;All it does is look for the cookie and give the older user json back
;;if it's there, redirect to other login if not.

;; The real one in ../login/login.ss

(import :std/net/httpd :std/net/uri
        :std/format :std/db/dbi :std/text/utf8
	:std/text/json :std/sugar
	"../db" "../req" "../user")

(export handler-init! handle-request)

(module JSON-METHODS
  (import :std/srfi/19)
  (defmethod {:json date}
    (lambda (self) (date->string self "~4"))
  rebind: #t))
(def state "not initialized")

(def (handler-init! cfg) (set! state 'initialized))

(def (token->user tok)
  (match 
      (ecm-sql
       sql-eval-query "
       SELECT json_build_object(
				
        'uuid', $1::text,
	'name', username,
	'id', user_id,
	'role', login.token_role(($1::text)::uuid),
	'json', user_to_json(user_id)
       )
      FROM login.login
      RIGHT JOIN login.active USING (id)
      RIGHT JOIN app_user ON (user_id = app_user_id)
      WHERE until > now() AND id = ($1::text)::uuid"

       tok)
    ([obj] obj)
    (else #f)))
			   
       
	       
  

;; (defstruct ecm-user (id name role json))

;; (def (role<-username username)
;;   (def un 
;;     (ecm-sql sql-eval-query
;;              "SELECT usename FROM app_user
;;             LEFT JOIN pg_shadow ON (username = usename::text)
;;             WHERE username = $1" username))
;;   (or (car un)
;;       (car 
;;        (ecm-sql sql-eval-query
;; 		"SELECT usename FROM app_user
;;              LEFT JOIN pg_shadow ON (usename = 'mu_' || app_user_id::text)
;;              WHERE username = $1" username))))

;; (def username->role role<-username)


;; (def (ecm-user<-username username)
;;   (def id
;;     (try
;;      (car
;;       (ecm-sql
;;        sql-eval-query
;;        "SELECT app_user_id FROM app_user WHERE username = $1" username))
;;      (catch _ #f)))
;;   (def json
;;     (and id (car
;; 	     (ecm-sql sql-eval-query

;;               "SELECT user_to_json($1::int)" id))))
;;   (when (and json (not (null? json)))
;;     (set! json (string->json-object json)))

;;   (def role (and id (role<-username username)))
;;   (and role (make-ecm-user id username role json)))

;; (def default-ecm-user-table (make-hash-table))
;; (def current-ecm-user-table (make-parameter default-ecm-user-table))

;; (begin
;;   (def (ecm-user<-uuid uuid)
;;     (hash-get (current-ecm-user-table) uuid))

;;   (def uuid->ecm-user ecm-user<-uuid))

(def (handle-request req res)
  (def tok (assget "ecm-login" (http-request-cookies req)))
  
  (http-response-write
   res 200 '(("Content-Type" . "application/json"))
   (token->user tok)))
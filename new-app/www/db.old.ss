(import
  :std/db/conpool
  :std/db/postgresql
  :std/db/dbi
  :std/sugar
  :std/os/error
  :std/actor
  "conf")

(export #t)

(set-default-reply-timeout! 601)

;; (update-conf)

(def ecm-conpool-start-times-table
  (make-hash-table weak-keys: #t))


(def (make-pgpool user: (role "maxclaims") (max #f))
  (def host (let (host (conf-value ["database" "master" "host"] #f))
	      (or host "db.ecm.lan")))
  (def port (let (port (conf-value ["database" "master" "port"] #f))
	      (or port 5432)))
  (def pool 
    (make-conpool
     (cut sql-connect postgresql-connect
          host: host ;"maxbakuntu.lan" ;host
	  port: port
	  ssl: #f user: role
	  db: "maxclaims" timeout: 60)
     max))

  (hash-put! ecm-conpool-start-times-table
	     pool
	     (time->seconds (current-time)))

  pool)

(def ecm-conpool (make-pgpool))

(def current-db-conpool-timeout (make-parameter 600))

(def (ecm-conpool-timeout? pool)
  (def start-secs (hash-ref ecm-conpool-start-times-table
			    pool 0))
  (def now-secs (time->seconds (current-time)))
  (> (- now-secs start-secs) (current-db-conpool-timeout)))

(def current-db-conpool (make-parameter ecm-conpool))
(def current-db-conpool-constructor (make-parameter make-pgpool))

(def (ecm-sql sql-fn . args)
  (def err #f)
  (def conn #f)
  (def current-pool (current-db-conpool))

  ;; Check for timeout

  (when (ecm-conpool-timeout? current-pool)
    (try
     (conpool-close current-pool)
     (finally
      (set! current-pool ((current-db-conpool-constructor)))
      (current-db-conpool current-pool))))
  
  (def pool current-pool)
  
  (def (try-sql (retry #f))
    (def con (conpool-get pool 5))
    (try
     (set! conn con)
     (apply sql-fn con args)
     (catch (e)
       ;; If this is an OSError it could also be a connection timed
       ;; out. If that's the case let's try again with a new pool.
       (cond ((and (OSError? e) retry)
	      (conpool-close pool)
	      (set! pool ((current-db-conpool-constructor)))
	      (current-db-conpool pool)
	      (try-sql #f))
	     (else 
	      (set! err e))))))
  (try 
   (try-sql #f)
   (finally
    (if err
      (begin
	(try (conpool-release pool conn)
	     (catch (e) #f)
	     (finally (raise err))))
      (conpool-put pool conn)))))

  
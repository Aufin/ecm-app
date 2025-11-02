(import
  :std/format
  :std/misc/walist
  :std/text/json
  :std/sugar
  :std/srfi/1
  :std/srfi/13
  :std/text/base64
  :std/interactive
  "conf"
  "jwt")
(export make-jwt)

(def +jwt-key+ #f)
(def +jwt-email+ #f)

(def (jwt-key (try-conf? #t))
  (or +jwt-key+
      (cond (try-conf?
	     (set! +jwt-key+
	       (conf-value "firebase.auth.private_key"))
	     (jwt-key +jwt-key+))
	    (else (error "Cannot find firebase.auth.private_key")))))

(def (jwt-email (try-conf? #t))
  (or +jwt-email+
      (cond (try-conf?
	     (set! +jwt-email+
	       (conf-value "firebase.auth.client_email" #f))
	     (jwt-email +jwt-email+))
	    (else (error "Cannot find firebase.auth.client_email" conf)))))

(def (key->b64 key)
  (let* ((lst (string-split key #\newline))
         (slst (drop-right (cdr lst) 1))  
         (b64 (string-concatenate slst)))
    (base64-string->u8vector b64)))

(def (conf-value
      key (not-found #f)
      conf: (conf conf) reload: (r? #f))
  
  (when (or (not conf) r?)
    (set! conf (update-conf)))

  (when (and (string? key)
	     (string-contains key "."))
    (set! key (string-split key #\.)))
  
  (let cval ((keys (if (pair? key) key [key]))
 	     (ht conf))
    (with ([key . rest] keys)
      (and ht
	 (let ((res (hash-ref ht key not-found)))
	   (if (and (not (null? rest)) (hash-table? res))
	     (cval rest res)
	     res))))))
    
(def (make-jwt user-id username)
  (update-conf "/srv/ecm/etc/ecm/ecm.json")
  (let* ((iat (inexact->exact (truncate (time->seconds (current-time)))))
	 (alist
	 `(("alg" . "RS256")
	   ("iss" . ,(jwt-email))
	   ("sub" . ,(jwt-email))
	   ("aud" . "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit")
	   ("iat" . ,iat)
	   ("exp" . ,(+ iat 120))
	   ("uid" . ,user-id)
	   ("claims" ,(hash ("username" username)))))
	 (json-token (make-json-web-token
		      (make-walist alist)
		      key: (key->b64 (jwt-key)))))

    (json-web-token->string json-token)))
	  
    

	
	
		   
  







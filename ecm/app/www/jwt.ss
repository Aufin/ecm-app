(import
  :std/text/base64
  :std/text/json
  :std/crypto
  :std/values
  :std/misc/walist
  :std/format)
(export #t)

;;;: * Converters, names based on RFC 7515 specs
(def BASE64URL
  (cut u8vector->base64-string
       <> urlsafe?: #t
       padding?: #f))

(def (BASE64-decode str)
  (base64-string->u8vector str urlsafe?: #t))

(def (JSON input walist?: (read-walist? #t)
	   key-as-symbol?: (key-as-symbol? #t))
  (cond
   ((or (string? input) (u8vector? input))
    (parameterize ((read-json-key-as-symbol? key-as-symbol?)
		   (read-json-object-as-walist? read-walist?))
      ((if (string? input) string->json-object bytes->json-object) input)))
   ((or (walist? input) (hash-table? input))
    input)))

;;;; The struct `json-web-token`      
(def default-jws-protected-header
  (JSON "{\"typ\":\"JWT\", \"alg\":\"HS256\"}"))
      
(defstruct json-web-token
  (header payload key json?)
  constructor: :init! final: #t)

(defmethod {:init! json-web-token}
  (lambda (self (payload "{}")
	   key: (key #f)
	   json?: (json? #t))
    (set! self.header default-jws-protected-header)
    (unless (not payload)
      (set! self.payload ((if json? JSON identity) payload))
      (set! self.json? json?)
      (set! self.key key))))

;;;; * Signatures
(def (json-web-token-signing-input-string jwt)
  (def (->string thing json?)
    (if json?
      (json-object->string thing)
      (if (string? thing) thing
	  (error "Cannot json web tokenize" thing))))
  (using (jwt :- json-web-token)
    (let* ((head jwt.header)
	   (pay jwt.payload)
	   (json? jwt.json?)
	   (hstr (->string head json?))
	   (pstr (->string pay json?)))
      (format "~a.~a"
	      (BASE64URL (string->utf8 hstr))
	      (BASE64URL (string->utf8 pstr))))))

(def (sign-signing-input-string sis key)
  (let* ((u8 (string->utf8 sis))
	 (b64key (if (u8vector? key) key (BASE64-decode key)))
	 (sigu8 (hmac-sha256 b64key u8)))
    (BASE64URL sigu8)))

(def (sign-serialized-header-and-payload head pay key)
  (sign-signing-input-string (format "~a.~a" head pay) key))

(def (sign-json-web-token jwt key)
  (let ((sis (json-web-token-signing-input-string jwt)))
    (sign-signing-input-string sis key)))

(def (validate-token str key)
  (with ([head pay sig] (string-split str #\.))
    (let (sigu8 (sign-serialized-header-and-payload head pay key))
      (string=? sig sigu8))))

;;;; * To/From string

(def (json-web-token->string jwt (key #f))
  (let* ((sis (json-web-token-signing-input-string jwt))
	 (key (or key (json-web-token-key jwt)))
	 (sig (sign-signing-input-string sis key)))
  (format "~a.~a" sis sig)))


(def (string->json-web-token
      jwt jso?: (json? #t)
      walist?: (walist? #t)
      key-as-symbol?: (key-as-symbol? #t))
  (let (tok (make-json-web-token #f))
    (let lp ((alist
	      (map cons [json-web-token-header-set!
			 json-web-token-payload-set!
			 cons]
		   (string-split jwt #\.))))
      (with ((cons item rest) alist)
        (with ((cons setter b64) item)
	  (parameterize((read-json-key-as-symbol? key-as-symbol?)
			(read-json-object-as-walist? walist?))
	    (setter
	     tok
	     (let (val (base64-decode b64 urlsafe?: #t))
	       (if (null? rest) val
		   (string->json-object
		    (utf8->string val)))))))
	  
        (if (null? rest) #f
            (lp rest))))
    tok))




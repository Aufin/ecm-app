;;; -*- Gerbil -*-
;;; (C) me at drewc.ca
;;; :std/parsec/prim unit-tests

(import :std/test
        :std/error
        :std/format
        :std/iter
	:std/values
        :std/crypto :std/misc/walist
        :std/interactive
        :std/srfi/13
        :std/text/base64
        :std/text/json
        "jwt"
        (only-in :std/sugar hash try)
        (only-in :gerbil/core error-object? with-catch))
(export jwt-test)

(defsyntax (test-inline stx)
  (syntax-case stx (>)
    ((_ test-case: name rest ...)
     #'(test-case name (test-inline rest ...)))
    ((_ > form > rest ...)
     #'(begin (when std/test#*test-verbose*
		  (displayln "... "
			     (with-output-to-string (cut write 'form))))
		form (test-inline > rest ...)))
    ((_ > test result rest ...)
     #'(begin (check test => 'result) (test-inline rest ...)))
    ((empty ...) #!void)))

(def jwt-test
  (test-suite "Test JSON Web Token"
 (test-inline
   test-case: "Test Make Token"
   > (def user-claim
       (make-walist
        '((uid . 1234)
          (username "drewc")
          (displayName "Drew Crampsie"))))
   > (def key (BASE64URL (string->utf8 "Private Key")))
   > (def jwt (make-json-web-token user-claim key: key))
   > (def token (json-web-token->string jwt))
   > token
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjEyMzQsInVzZXJuYW1lIjpbImRyZXdjIl0sImRpc3BsYXlOYW1lIjpbIkRyZXcgQ3JhbXBzaWUiXX0.DeMhpTyMg12KIWJLAyJ8yiNxny7DFTZ21O0QIQvJd44")


 (test-inline
   test-case: "Test Token Encode"
> (def payload "
{
  \"iss\":\"joe\",
  \"exp\":1300819380,
  \"http://example.com/is_root\":true
}")
> (def key "AyM1SysPpbyDfgZld3umj1qzKObwVMkoqQ-EstJQLr_T-1qS0gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr1Z9CAow")
> (def jwt (make-json-web-token payload key: key))
> (def jload (json-web-token-payload jwt))
> (walist-get jload 'iss)
"joe"
> (walist-get jload '|http://example.com/is_root|)
#t
;> (json-web-token-signh
> (def token (json-web-token->string jwt))
> token
"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2UiLCJleHAiOjEzMDA4MTkzODAsImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.lliDzOlRAdGUCfCHCPx_uisb6ZfZ1LRQa0OJLeYTTpY"
> (validate-token token key)
#t
)

 (test-inline
   test-case: "Test Token Decode"
   ;; From RFC7515
   ;; https://www.rfc-editor.org/rfc/rfc7515.html#appendix-A.1.1
     > (def token "eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")
   > (defvalues (head payload signature)
       (list->values (string-split token #\.)))
   > head
   "eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9"
   
   ;; The octets representing UTF8(JWS Protected Header) in this example
   ;: (using JSON array notation) are:
   
    ; [123, 34, 116, 121, 112, 34, 58, 34, 74, 87, 84, 34, 44, 13, 10,
    ; 32, 34, 97, 108, 103, 34, 58, 34, 72, 83, 50, 53, 54, 34, 125]
   > (def oct-head (base64-decode head urlsafe?: #t))
   > oct-head
   #u8(123 34 116 121 112 34 58 34 74 87 84 34 44 13 10 32 34 97 108 103
    34 58 34 72 83 50 53 54 34 125)
   > (def |JWS Protected Header| (utf8->string oct-head))
   > |JWS Protected Header|
   "{\"typ\":\"JWT\",\r\n \"alg\":\"HS256\"}"
   
   ;; Encoding this JWS Protected Header as BASE64URL(UTF8(JWS Protected
   ;; Header)) gives this value:
   
   ;;    eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9
   > (def UTF8 string->utf8)
   > (def newhead (BASE64URL(UTF8 |JWS Protected Header|)))
   > newhead
   "eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9"
   > (string=? head newhead)
   #t
   ;; The payload:
   ;; {"iss":"joe",
   ;;  "exp":1300819380,
   ;;  "http://example.com/is_root":true}
   
   > (def joken (string->json-web-token token))
   > (walist-get (json-web-token-header joken) 'alg)
   "HS256"
   > (walist-get (json-web-token-payload joken) 'iss)
   "joe"
   > (walist-get (json-web-token-payload joken) 'exp)
   1300819380
   ;{"kty":"oct",
    ;   "k":"AyM1SysPpbyDfgZld3umj1qzKObwVMkoqQ-EstJQLr_T-1qS0gZH75
    ;        aKtMN3Yj0iPS4hcgUuTwjAzZr1Z9CAow"
   ;}
   
   > (def key "AyM1SysPpbyDfgZld3umj1qzKObwVMkoqQ-EstJQLr_T-1qS0gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr1Z9CAow")
   > (validate-token token key)
   #t
   > (def b64u-key (base64-string->u8vector key  urlsafe?: #t))
   > (def signing-string (with ([header body _] (string-split token #\.))
                           (format "~a.~a" header body)))
   > (def signing-input (string->utf8 signing-string))
   
   ;; The resulting JWS Signing Input value, which is the ASCII
   ;; representation of above string, is the following octet sequence (using
   ;; JSON array notation):
   
   ;; [101, 121, 74, 48, 101, 88, 65, 105, 79, 105, 74, 75, 86, 49, 81,105,
   ;;  76, 65, 48, 75, 73, 67, 74, 104, 98, 71, 99, 105, 79, 105, 74,73, 85,
   ;;  122, 73, 49, 78, 105, 74, 57, 46, 101, 121, 74, 112, 99, 51,77, 105,
   ;;  79, 105, 74, 113, 98, 50, 85, 105, 76, 65, 48, 75, 73, 67,74, 108,
   ;;  101, 72, 65, 105, 79, 106, 69, 122, 77, 68, 65, 52, 77, 84,107, 122,
   ;;  79, 68, 65, 115, 68, 81, 111, 103, 73, 109, 104, 48, 100,72, 65, 54,
   ;;  76, 121, 57, 108, 101, 71, 70, 116, 99, 71, 120, 108, 76,109, 78, 118,
   ;;  98, 83, 57, 112, 99, 49, 57, 121, 98, 50, 57, 48, 73,106, 112, 48, 99,
   ;;  110, 86, 108, 102, 81]
   
   > signing-input
   #u8(101 121 74 48 101 88 65 105 79 105 74 75 86 49 81 105 76 65 48 75
    73 67 74 104 98 71 99 105 79 105 74 73 85 122 73 49 78 105 74 57 46
    101 121 74 112 99 51 77 105 79 105 74 113 98 50 85 105 76 65 48 75 73
    67 74 108 101 72 65 105 79 106 69 122 77 68 65 52 77 84 107 122 79 68
    65 115 68 81 111 103 73 109 104 48 100 72 65 54 76 121 57 108 101 71
    70 116 99 71 120 108 76 109 78 118 98 83 57 112 99 49 57 121 98 50 57
    48 73 106 112 48 99 110 86 108 102 81)
   ;; Running the HMAC SHA-256 algorithm on the JWS Signing Input with this
   ;; key yields this JWS Signature octet sequence:
   
   ;; [116, 24, 223, 180, 151, 153, 224, 37, 79, 250, 96, 125, 216, 173,
   ;; 187, 186, 22, 212, 37, 77, 105, 214, 191, 240, 91, 88, 5, 88, 83,
   ;; 132, 141, 121]
   ;;
   > (hmac-sha256 b64u-key signing-input)
   #u8(116 24 223 180 151 153 224 37 79 250 96 125 216 173 187 186 22 212
    37 77 105 214 191 240 91 88 5 88 83 132 141 121)
   > (string=? (BASE64URL (hmac-sha256 b64u-key signing-input)) signature)
   #t)))

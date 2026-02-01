(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19

  :std/format
  "../../db" "../../req" "../../user")

(export handle-request)

(def (fetch-complaints)
  (def (esql q . args)
	(apply ecm-sql sql-eval-query q args))
  (car (esql "SELECT COALESCE(js, '[]'::json) FROM (
      SELECT json_agg(cm ORDER BY date DESC) AS js
      FROM complaint cm) cmjs")))

(def handle-request
  (user-request-handler
   (lambda (req res)
     (def out (fetch-complaints))
     (http-response-write
      res 200 '(("Content-Type" . "application/json"))
	  out))))

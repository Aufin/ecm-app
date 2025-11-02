(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19
  "../../db" "../../req" "../../user")

(export handle-request)
(def (esql q . args) (apply ecm-sql sql-eval-query q args))

(def handle-request
  (user-request-handler
   (lambda (req res)
     (def risk-types (esql "
SELECT json_build_object('risk_types', rt)
 FROM (SELECT json_agg(t.*) rt
       FROM (SELECT * FROM
        (select risk_type_name AS name, count(*)
        FROM risk GROUP BY risk_type_name) ts
    ORDER BY count DESC) t) tst
"))

     (http-response-write
      res 200 '(("Content-Type" . "application/json"))
      (car risk-types)))))
(export #t)
(import
  :std/sugar :std/db/dbi :std/srfi/13
  "../../db" "../../req" "../../user")

(export handle-request)

(def handle-request
  (user-request-handler
   (lambda (req res)
  (http-response-write
   res 200 '(("Content-Type" . "application/json"))
     (match 
      (ecm-sql
       sql-eval-query "
SELECT json_build_object('examiners', exea)
 FROM (SELECT json_agg(row_to_json(ex)) AS exea
     FROM (SELECT
            person_short_name(person_id) AS name,
            person_id AS examiner_id,
            app_adjuster_id,
            person_id,
            full_time
            FROM app_adjuster
            ORDER BY person_short_name(person_id)
          ) ex) exe
")
      ([obj] obj)
      (else #f))))))

(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19
  "../../db" "../../req" "../../user")

(export handle-request)
(def (esql q . args) (apply ecm-sql sql-eval-query q args))

(def handle-request
  (user-request-handler
   (lambda (req res)
      (def agencies (esql "
SELECT json_build_object('agencies', aga)
 FROM (SELECT json_agg(row_to_json(ags)) AS aga
     FROM (SELECT
            person_name(agency_id) AS name,
            agency_id,
            max(effective_date) AS latest_effective,
            count(*) AS number_of_contracts
            FROM contract
            WHERE agency_id IS NOT NULL
           GROUP BY agency_id
           ORDER BY number_of_contracts DESC,
           latest_effective DESC, name) ags) moreagents"))
     

     (http-response-write
      res 200 '(("Content-Type" . "application/json"))
      (car agencies)))))
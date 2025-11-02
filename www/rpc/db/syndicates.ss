(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19
  "../../db" "../../req" "../../user")

(export handle-request)


(def (esql q . args) (apply ecm-sql sql-eval-query q args))

(def handle-request
  (user-request-handler
   (lambda (req res)
     (def syns (esql "
SELECT json_build_object('syndicates', syna)
 FROM (SELECT json_agg(row_to_json(syns)) AS syna
     FROM (SELECT
            person_name(syndicate_id) AS name,
            syndicate_id,
            max(effective_date) AS latest_effective,
            count(*) AS number_of_contracts
            FROM contract
            WHERE syndicate_id IS NOT NULL
           GROUP BY syndicate_id
           ORDER BY number_of_contracts DESC,
           latest_effective DESC, name) syns) moresyns"))

     (http-response-write
      res 200 '(("Content-Type" . "application/json"))
      (car syns)))))

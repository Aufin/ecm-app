(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19
  "../../db" "../../req" "../../user")

(export handle-request)


(def (esql q . args) (apply ecm-sql sql-eval-query q args))


(def contracts-text "
SELECT json_build_object('contracts', contracts)
 FROM (SELECT json_agg(row_to_json(cs)) AS contracts
       FROM
      (SELECT contract_id, contract_number, effective_date, expiry_date,
           agency_id, person_name(agency_id) AS agency,
           syndicate_id, person_name(syndicate_id) AS syndicate,
           london_broker_id, person_name(london_broker_id) AS london_broker,
           insurance_company_id, person_name(insurance_company_id) AS insurance_company

           FROM contract WHERE contract_number IS NOT NULL
             ORDER BY effective_date IS NOT NULL DESC,
               effective_date DESC) cs
      ) c
    ")

(def handle-request
  (user-request-handler
   (lambda (req res)
     (def contracts (esql contracts-text))

     (http-response-write
      res 200 '(("Content-Type" . "application/json"))
      (car contracts)))))

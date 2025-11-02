(import
   :std/net/httpd :std/net/uri :std/sugar
   :std/format :std/db/dbi :std/interactive
   "../db.ss" "../req" "../user"
   :std/actor-v18/message)

 (export handler-init! handle-request)

 (def (handler-init! cfg)
   (set-httpd-max-token-length! (* 100 1024))
   (set! std/net/httpd/handler#max-token-length (* 100 1024))
   #t)

(begin
   (set-httpd-max-token-length! (* 100 1024))
   (set! std/net/httpd/handler#max-token-length (* 100 1024)))


 (def (diary (user-id #f) (limit 10) (offset 0) (draw 0))
   (def ds (ecm-sql sql-eval-query
		 #;"
SELECT json_agg(diary) AS data, $1 as foo
        -- ,n AS recordsTotal
  FROM
 (SELECT
       d.diary_entry_id
       d.claim_id,
       d.app_user_id,
       d.note,
       person_name(( SELECT a.person_id
                   FROM app_user a
                  WHERE a.app_user_id = d.app_user_id
                 LIMIT 1)),
            COALESCE(max(defer_diary_entry.defer_date), d.action_date),
            d.title,
            NOT d.processed 
           -- ,COUNT(*) OVER() A n
           FROM diary_entry d
             LEFT JOIN defer_diary_entry USING (diary_entry_id)
WHERE ($1::int IS NULL OR d.app_user_id = $1::int)
          GROUP BY d.diary_entry_id
          LIMIT ($2) OFFSET ($3)) diary
" "SELECT json_build_array(42)"
 		 #;user-id #;limit #;offset #;draw))
   (if (pair? ds) (car d) "[]"))

;; 	  "SELECT to_json(payme) FROM (
;;  SELECT $4::int as draw, 
;;         -- n AS count, $2 AS \"limit\", $3 as \"offset\", 
;;         n AS \"recordsTotal\",      
;;         n AS \"recordsFiltered\",      
;;         json_agg(t) as data 
;;  FROM
;; (SELECT json_build_array(
;;           transactions, claim_id, (claim).status, ((claim).date_of_loss::date),
;;           jsi.policy_summary((policy)),
;;           jsi.contract_summary((contract)),
;;           jsi.corpus_summary((claim).adjuster_id)) AS t,
;;         COUNT(*) OVER() AS n
;;    FROM (SELECT payee_id, claim_id, transaction as transactions
         
;;           FROM
;;  	 (SELECT
;;  	  claim_id, payee_id, max(transaction_date) AS date,
;;  	  json_agg(json_build_object('date', transaction_date::date, 'amount', amount, 'type', type)) as transaction
;;  	 FROM claim_transaction GROUP BY claim_id, payee_id ORDER BY date DESC)
;;        ct) tr RIGHT JOIN claim_view USING (claim_id)
;;               WHERE payee_id = $1
;;               LIMIT ($2) OFFSET ($3)) tranny
;;        GROUP BY n 



;; ) payme"

 (def handle-request
   (user-request-handler
    (lambda (req res)
      ;;(http-response-timeout-set! res 1200)
      ;;(set-default-reply-timeout! 1200)
      (try 
       (def params (form-url-decode (or (http-request-params req) "")))
       (def user-id (assget "user-id" params))
       (def draw (assget "draw" params))
       (def limit (assget "length" params))
       (def offset (assget "start" params))
       (def results
	 "[46]" #;(diary user-id (or limit 10) (or offset 0) draw))
       (http-response-write res 200 '(("Content-Type" . "application/json"))
 			    results)
       (catch (e)
        (displayln e)
	(http-response-write
	 res 500 '(("Content-Type" . "text/plain"))
	 (with-output-to-string "ERROR oh wow this is inline and should be lol: "
     (cut display-exception e)))
	(error e))))))

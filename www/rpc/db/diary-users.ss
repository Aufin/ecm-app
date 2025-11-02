(import
  :std/sugar :std/db/dbi :std/srfi/13 :std/text/utf8
  :std/text/json :std/srfi/19
  "../../db" "../../req" "../../user"
  (only-in "../../db"
	   json-object<-sql-eval-query))

(export handle-request)

(def di-query"SELECT json_build_object('diary_users', json_agg(di))
 FROM (SELECT * FROM
       (SELECT user_id, person_short_name(person_id) AS name
         FROM (select distinct app_user_id AS user_id FROM diary_entry) de
         JOIN app_user ON(user_id = app_user_id)) du ORDER BY name) di;
")

(def (diary-users/GET req res)
  (def dis (ecm-sql sql-eval-query di-query))
  (http-response-write
   res 200 '(("Content-Type" . "application/json"))
   (car dis)))

(def handle-request (user-request-handler diary-users/GET))
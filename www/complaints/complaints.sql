CREATE OR REPLACE VIEW complaint AS (
SELECT claim_id, complaint->>'date' AS date, complaint->>'reason' AS reason, person_name(agency_id) AS agency, person_name(syndicate_id) AS syndicate, person_name(london_broker_id) AS broker FROM (SELECT (claim).*, (contract).* FROM claim_view) claim WHERE complaint IS NOT NULL ORDER BY (complaint->>'date')::date DESC);
GRANT ALL PRIVILEGES ON complaint TO mr_read;

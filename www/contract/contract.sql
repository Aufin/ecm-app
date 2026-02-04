ALTER TABLE IF EXISTS contract ADD COLUMN IF NOT EXISTS loss_fund NUMERIC(10,2);

  CREATE OR REPLACE FUNCTION contract_loss_fund_balance(contract_id int)
  RETURNS numeric(10,2) LANGUAGE SQL AS $$
  SELECT (contract).loss_fund - sum(amount)
    FROM claim_view LEFT JOIN claim_transaction ct USING (claim_id)
    WHERE (contract).contract_id = $1 AND (contract).loss_fund IS NOT NULL
    AND claim_transaction_is_paid(ct)
   GROUP BY (contract)
  $$;

 CREATE OR REPLACE FUNCTION contract_loss_fund_balance(contract)
  RETURNS numeric(10,2) LANGUAGE SQL AS $$
  SELECT contract_loss_fund_balance($1.contract_id)
  $$;

 
CREATE OR REPLACE FUNCTION contract_loss_fund_balance(claim)
 RETURNS numeric(10,2) LANGUAGE SQL AS $$
 SELECT contract_loss_fund_balance((contract).contract_id)
  FROM claim_view WHERE claim_id = $1.claim_id
 $$;

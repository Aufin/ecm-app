function EcmPayeeTable (parent, payee_id) {
    this.dataTable = new EcmDataTable(parent, "SELECT 42 AS answer")

}

function EcmPayeeTable.prototype.makePayeeQuery = id => `SELECT
 claim_id AS "Claim",
 t.amount 
 FROM claim_transaction WHERE payee_id = ` + id + '';

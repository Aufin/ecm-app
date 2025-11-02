function Claim(obj, args) {
    // const obj = typeof init == "number" ? { claim_id: init } : init
     console.log('Called Claim', obj)
    return Entity.call(this, Claim, 'claim_id', obj)
}

Entity.define(Claim);

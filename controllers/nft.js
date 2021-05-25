
const authQueries = require('../services/authQueries');
var fetch = require("node-fetch");
exports.nftCreate = async (
    db, req, res) => {
    var immutable_artwork      = req.body.immutable_artwork;
    var creator     = req.body.creator;
    var description = req.body.description;
    var amount      = req.body.amount;
    var address     = req.body.address;
    var category    = req.body.category;
    var ipfsImage   = req.body.ipfsImage;
    var image =  (!req.files['image'])?null:req.files['image'][0].filename;
    try {
        if (!immutable_artwork) {
            return res.status(400).send({
                success: false,
                msg: "Immutable artwork required"
            });
        }

        if (!creator) {
            return res.status(400).send({
                success: false,
                msg: "creator required"
            });
        }

        if (!description) {
            return res.status(400).send({
                success: false,
                msg: "Description required"
            });
        }

        var request = {
            "immutable_artwork"  : immutable_artwork,
            "creator"       : creator,
            "description"   : description,
            "amount"        : amount,
            "address"       : address,
            'category'      : category,
            'image'         : image,
            'ipfsImage'     : ipfsImage
        }    

        await db.query(authQueries.insertNft, [request], async function (error1, orderResult) {
            if (error1) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error1
                });
            }
            if(orderResult){
                // console.log(orderResult);
                return res.status(200).send({
                    success: true,
                    msg: "NFT created successfully.", 
                    "nftid" : orderResult.insertId
                });                
            }else{
                res.status(200).send({
                    success: false,
                    msg: "Something went wrong! Please try again."
                });
            }
        });        

    } catch (err) {
        return res.status(500).send({
            success: false,
            msg: "Request not send due to internal error"
        });
    }
}

exports.nftgetTransactions = async (
    db, req, res) => {   
        var id  = req.body.id;
    try {
        db.query(authQueries.getLastNft, id , async function (error, nftData) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    message: "unexpected error occured",
                    error
                });
            } else {
                var address         = nftData[0].address
                var amount          = nftData[0].amount
                // var amount          = "996.170172"
                var immutable_artwork = nftData[0].immutable_artwork;
                var description     = nftData[0].description;
                var ipfsImage       = nftData[0].ipfsImage;
                var creator         = nftData[0].creator;

                var trxurl = "https://cardano-testnet.blockfrost.io/api/v0/addresses/"+address+"/txs"
                const trackTransaction = await fetch(trxurl ,{ method:'GET', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'project_id' : 'uHMnsN1ZwOZ1abZfIqTnQX8tnB7q7u6V'
                },
                });
                const trackTransactionRes = await trackTransaction.json();
                const trackTransactionRes1 = trackTransactionRes.reverse();
                //  console.log(trackTransactionRes1);
                if(trackTransactionRes1.status_code != 404){
                    for(var i = 0; i < trackTransactionRes1.length; i++){
                        var transactionHash = trackTransactionRes1[i];
                        var trxhashurl = "https://cardano-testnet.blockfrost.io/api/v0/txs/"+transactionHash+"/utxos"
                        const trackHash = await fetch(trxhashurl,{ method:'GET', headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'project_id' : 'uHMnsN1ZwOZ1abZfIqTnQX8tnB7q7u6V'
                        },
                        });
                        const trackHashRes = await trackHash.json();
                        // var getAmtArr = trackHashRes.outputs[1].amount[0].quantity
                        
                        if(trackHashRes.outputs[1].amount[0].quantity){
                            var block = trackHashRes.block;
                            var getAmt = trackHashRes.outputs[1].amount[0].quantity;
                            var trx_amount = getAmt/1000000
                            console.log(trx_amount);
                            if(amount == trx_amount){
                                const response1 = await fetch('http://52.253.94.149:3000/cardano-nft/testnet/mint',{ method:'POST', headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({
                                        "wallet_name" : "ADAPI",
                                        "asset_name" : immutable_artwork,
                                        "asset_description" : description,
                                        "asset_image_url" : "ipfs://"+ipfsImage,
                                        "asset_metadata_url": "ipfs://"+ipfsImage,
                                        "author_name" : creator
                                    })
                                });
                                const mintResponse = await response1.json();
                                console.log(mintResponse);
                                if(mintResponse.code == 200){
                                    var request = {
                                        'txHash'        : mintResponse.txHash,
                                        'policy_id'     : mintResponse.policy_id,
                                        'asset_id'      : mintResponse.asset_id,
                                        'mind_address'  : mintResponse.address,
                                        'blockHash'     : block,
                                        'status'        : 1
                                    }
                                    let updateData = await db.query(authQueries.updateNft, [request, id]);
                                    if (updateData) {
                                        try {
                                            var trxStatus = 1
                                            return res.status(200).send({
                                                success: true,
                                                msg: "NFT created successfully."
                                            });
                                        } catch (e) {
                                            return res.status(500).send({
                                                success: false,
                                                msg: e
                                            });
                                        }
                                    } else {
                                        return res.status(400).send({
                                            success: false,
                                            msg: "Request not send due to internal error"
                                        });
                                    }
                                                
                                }else{
                                    var trxStatus = 0         
                                }

                            }else{
                                var trxStatus = 0   
                            }

                        }else{
                            var trxStatus = 0 
                        }
                    }
                }else{
                    var trxStatus = 0  
                }    
                
                if(trxStatus == 0){
                    return res.status(200).send({
                        success: false,
                        'nftid' : id,
                        msg: "Request not send due to internal error"
                    });                    
                }
            }
        })
    } catch (err) {
        return res.status(400).send({
            success: false,
            message: "unexpected internal error",
            err
        });
    }
}

exports.getNftList = async (
    db, req, res) => {   
    var category_id = req.body.category_id;
    var whr = '';    
    var qry ="SELECT * FROM nft WHERE status = 1 ";
    if(category_id){
        qry=qry+` AND category=${category_id}`+ ` ORDER BY id DESC`
    }else{
        qry = qry+` ORDER BY id DESC`
    }
    console.log(qry);
    try {
        db.query(qry , async function (error, nftlist) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    message: "unexpected error occured",
                    error
                });
            } else if (nftlist.length == 0) {
                return res.status(400).send({
                    success: false,
                    message: "No data found"
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: "data get successfully",
                    response : nftlist
                });
            }
        })
    } catch (err) {
        return res.status(400).send({
            success: false,
            message: "unexpected internal error",
            err
        });
    }
}

exports.getNftDetails = async (
    db, req, res) => {   
        var id  = req.body.id;    
    try {
        db.query(authQueries.getNftDetails, id , async function (error, nftlist) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    message: "unexpected error occured",
                    error
                });
            } else if (nftlist.length == 0) {
                return res.status(400).send({
                    success: false,
                    message: "No data found"
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: "data get successfully",
                    response : nftlist[0]
                });
            }
        })
    } catch (err) {
        return res.status(400).send({
            success: false,
            message: "unexpected internal error",
            err
        });
    }
}

exports.searchNFTValue = async (
    db, req, res) => {   
        var getSearchData  = req.body.searchValue;
        var get_category_id  = req.body.category_id;
        if(getSearchData){
            var searchValue = '%'+getSearchData+'%'
        }else{
            var searchValue = ''
        }

        if(get_category_id){
            var category_id = get_category_id
        }else{
            var category_id = ''
        }        

    try {
        db.query(authQueries.getNftSearchData, [searchValue, searchValue, searchValue, category_id] , async function (error, nftlist) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    message: "unexpected error occured",
                    error
                });
            } else if (nftlist.length == 0) {
                return res.status(400).send({
                    success: false,
                    message: "No data found"
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: "data get successfully",
                    response : nftlist
                });
            }
        })
    } catch (err) {
        return res.status(400).send({
            success: false,
            message: "unexpected internal error",
            err
        });
    }
}
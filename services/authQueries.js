var db = require('../utils/connection');

module.exports = {
    insertNft: "INSERT INTO nft SET ?",
    getNftList : "SELECT * FROM nft ? ORDER BY id DESC",
    getNftDetails : "SELECT nft.*, DATE_FORMAT(nft.created_date, '%Y-%m-%d' ) as createdDate, category.name as categoryName FROM nft LEFT JOIN category ON nft.category = category.id WHERE nft.id = ?",
    getNftSearchData : "SELECT * FROM nft WHERE (immutable_artwork LIKE ? OR creator LIKE ? OR description LIKE ? ) OR category LIKE ? ",
    getCategory : "SELECT * FROM category",
    getHomeImagesQry : "SELECT * FROM homepage_images",
    getPaymentDetailsQry : "SELECT * FROM payment_details",
    getLastNft : "SELECT * FROM nft WHERE id = ? ",
    updateNft : "UPDATE nft SET ? where id =?",
    getAlreadyTransaction : "SELECT * FROM nft WHERE blockHash = ? "
}

var db = require('../utils/connection');

module.exports = {
    getUsersEmail: "SELECT * FROM admin WHERE email = ?",
    getProfile :  "Select profile_pic from admin where email=? ",
    updateProfile : "update admin SET profile_pic=? where email=?",
    getPassword : "Select password from admin where email =? ",
    getSettingDataQry : "Select * FROM payment_details",
    updateSettingQry : "update payment_details SET ? where id =?",
    




    
    getFooter : "SELECT * FROM web_footer",
    getWebContent : "SELECT * FROM web_content",
    updateFooter : "update web_footer SET description=?,email=?,contact=?", 
    updateWebContent : "update web_content SET ?",
    getUsers : "Select id,first_name,last_name,email,phone,countryid,is_email_verify from users WHERE deactivate_account = 0",
    getSingleUser : "Select * from users where id =?",
    getOrderDetail : "SELECT u.*,o.* FROM users as u LEFT JOIN  orders as o ON u.id=o.user_id  where ? ",
    insertMarketPlace : "insert into marketplace SET ?",
    getMarketPlace : "Select title,author,price,item_image,price from marketplace",
    insertCategory : "insert into item_category SET ?",
    deleteCategory : "DELETE FROM item_category WHERE id =?",
    updateCategory : "update item_category SET ? where id =?",
    Category : "Select id,name from item_category",
    singleCategory : "Select id,name from item_category where id =?",
    insertItem : "insert into item SET ?",
    deleteItem : "DELETE FROM item WHERE id =?",
    updateItem : "update item SET ? where id =?",
    getItem : "Select item.id, type,item_category.name as category_name,item.name,item.description,item.image,item.owner,item.item_category_id,item.token_id,item.price from item LEFT JOIN item_category ON item.item_category_id = item_category.id",
    dashItem : "select sum(category_count) as category_count,sum(user_count) as user_count,sum(item_count) as item_count,sum(sold_item) as sold_item,sum(trending_item) as trending_item,sum(telent_count) as telent_count from ( select count(id) as category_count,0 as user_count,0 as item_count, 0 as sold_item, 0 as trending_item,0 as telent_count from item_category UNION ALL select 0 as category_count,count(id) as user_count,0 as item_count, 0 as sold_item, 0 as trending_item,0 as telent_count from users where deactivate_account=0 UNION ALL select 0 as category_count,0 as user_count,count(id) as item_count, sum(is_sold) as sold_item, sum(is_trending) as trending_item,0 as telent_count from item union all select 0 as category_count,0 as user_count,0 as item_count,0 as sold_item, 0 as trending_item,count(id) as telent_count from telent ) as dashboard_data",

    getTelentUsers : "Select * FROM users",

    deleteUser : "Update users set deactivate_account=1,email=concat(email,'_Deleted') WHERE id =?",

    
    
    updatepassword : "update admin SET password=? where email=?",
    

}   
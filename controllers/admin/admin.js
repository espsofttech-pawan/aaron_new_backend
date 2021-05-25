const CryptoJS = require("crypto-js");

const config = require('../../config');
const adminQueries = require("../../services/adminQueries");
var validator = require("email-validator");
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const { response } = require("express");

exports.login = async (db, req, res) => { 
    var email = req.body.email;
    var password = req.body.password;
    try {
        if (email=='') {
            return res.status(400).send({
                success: false,
                msg: "Email required "
            });
        }
        if (password=='') {
            return res.status(400).send({
                success: false,
                msg: "password required"
            });
        }
        if (!validator.validate(email)) {
            return res.status(400).send({
                success: false,
                msg: "Email is not validate"
            });
        }
     
    db.query(adminQueries.getUsersEmail,email, async function (error, user) {
            
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "unexpected error occured",
                error
            });
        } else if (user.length == 0) {
            return res.status(400).send({
                success: false,
                msg: "No User found"
            });
            }
        
            else {
            var hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
            if (user[0].password === hash){                  
                return res.status(200).send({
                    success: true,
                        msg: "Login Successfully",
                    data : {
                        id : user[0].id,
                        user_email : user[0].email,
                        username : user[0].username,
                        }
                });
            } else {
                return res.status(400).send({
                    success: false,
                    msg: "Password does not match"
                });
            }

        }
    })
    } catch (err) {
        console.log(err)
        return res.status(400).send({
            success: false,
            msg: "unexpected internal error",
            err
        });
    }

}

exports.getProfilePic = async (db,req,res)=>{
    var email = req.body.email;
    
    await db.query(adminQueries.getProfile,[email],function(error,data){
        if(error){
        return res.status(400).send({
            success: false,
            msg: "error occured",
            error
        });
    }
        if(data.length > 0){
    res.status(200).send({
        success:true,
        msg : "Profile Pic",
        response : data[0]
    });
        }else{
            res.status(400).send({
                success:false,
                msg:"No Data"
            });            
        }
    });
 }

 exports.insertProfilePic = async (db, req, res) => {
  
    try {
    var form = new formidable.IncomingForm();
    form.parse(req, async  function (err, fields, files) {
     
        if (profile_pic=='') {
            return res.status(400).send({
                success: false,
                msg: "Profile Pic required"
            });
        }
        var profile_pic_upload = (!files.profile_pic)?null:(!files.profile_pic.name)?null:files.profile_pic; 
       
 if(!profile_pic_upload)
 {
    var profile_pic ='';
    
 }else{
    var oldpath = files.profile_pic.path;
   
    var filePath = "./uploads/"
    let newfilename = filePath +files.profile_pic.name
 
  // Read the file
 await fs.readFile(oldpath,async function (err, data) {
    if (err) throw err;
        // Write the file
    await  fs.writeFile(newfilename, data, function (err) {
            if (err) throw err;
 
        });
    });
    var profile_pic = files.profile_pic.name;
    
 }
 var email = fields.email;
 
    db.query(adminQueries.updateProfile,[profile_pic,email],function(error,result){
        if(error){
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if(result){
        res.status(200).send({
            success:true,
            msg : "Update Profile Successfully",
         });
        }else{
            res.status(200).send({
                success:true,
                msg : "update Profile Failed",
             });
        }               
    })
    });       
 
    } catch (err) {
       // console.log(err)
        return res.status(400).send({
            success: false,
            msg: "unexpected internal error",
            err
        });
    }
 
 }

 exports.changePassword = async (db, req, res) => {

    var email = req.body.email;
    var currentPassword = req.body.currentPassword;
    var password = req.body.password;
    var password2 = req.body.password2;   
 
    try {
        if (currentPassword=='') {
            return res.status(200).send({
                success: false,
                msg: "Current Password required "
            });
        }
 
        if (password=='') {
          return res.status(200).send({
              success: false,
              msg: "New Password required "
          });
      }
      if (password2=='') {
       return res.status(200).send({
           success: false,
           msg: "Re-Type Password required "
       });
   }
   if (password!=password2) {
    return res.status(200).send({
        success: false,
        msg: "New Password and Re-type Password not Match"
    });
 }
 
 db.query(adminQueries.getPassword,[email],function(error,result){
  
    if (error) {
       return res.status(400).send({
           success: false,
           msg: "error occured",
           error
       });
   }
  // console.log('result',result);
   const hashpassword = CryptoJS.SHA256(currentPassword).toString(CryptoJS.enc.Hex);
    if(result[0].password==hashpassword){
  
       const newpassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  
       db.query(adminQueries.updatepassword,[newpassword,email],function(error,result){
          if (error) {
             return res.status(400).send({
                 success: false,
                 msg: "error occured",
                 error
             });
         }
         if(result){
            return res.status(200).send({
               success: true,
               msg : "Password Changed Successfully"
            })
         }else{
          return res.status(400).send({
             success: false,
             msg : "Password Changed Failed due to Error"
          })
         }
        });
    }else{
       return res.status(200).send({
          success: false,
          msg : "Current Password Wrong"
       })
    
    }
 });
 }
     catch (err) {
      //  console.log(err)
        return res.status(400).send({
            success: false,
            msg: "unexpected internal error",
            err
        });
    }
 
 }  

 exports.getSettingData = async (db,req,res)=>{
    await db.query(adminQueries.getSettingDataQry,function(error,data){
        if(error){
        return res.status(400).send({
            success: false,
            msg: "error occured",
            error
        });
    }
        if(data.length>0){
    res.status(200).send({
        success:true,
        msg : "Payment Data get successfully",
        response:data[0]
     });
        }else{
            res.status(200).send({
                success:false,
                msg:"No Data"
            });            
        }
    });
    }


    exports.updateSetting = async (db,req,res)=>{

        var id = req.body.id;
        var address = req.body.address;
        var amount = req.body.amount;

        if (address=='') {
            return res.status(400).send({
                success: false,
                msg: "Address required "
            });
        }

        if (amount=='') {
            return res.status(400).send({
                success: false,
                msg: "Amount required "
            });
        }        

        var arr = {
           "address" : address,
            "amount" : amount
        }

        await db.query(adminQueries.updateSettingQry,[arr,id],function(error,data){
            if(error){
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
            if(data){
        res.status(200).send({
            success:true,
            msg : "Category Item Updated Successfully "
         });
            }else{
                res.status(200).send({
                    success:false,
                    msg:"Updation Failed"
                });            
            }
        });
        }





























exports.getFooter = async (db,req,res)=>{
   
    await db.query(adminQueries.getFooter, function(error,data){
        if(error){
        return res.status(400).send({
            success: false,
            msg: "error occured",
            error
        });
    }
        if(data.length > 0){
    res.status(200).send({
        success:true,
        msg : "Footer Details",
        response : data[0]
    });
        }else{
            res.status(400).send({
                success:false,
                msg:"No Data"
            });            
        }
    });
}


exports.updateFooter = async (db,req,res)=>{

        var description = req.body.description;
        var email = req.body.email;
        var contact = req.body.contact;
        
        if (description=='') {
            return res.status(400).send({
                success: false,
                msg: "description required"
            });
        }
        
        if (email=='') {
            return res.status(400).send({
                success: false,
                msg: "email required"
            });
        }
        if (!validator.validate(email)) {
            return res.status(400).send({
                success: false,
                msg: "Email is not validate"
            });
        }
        if (contact=='') {
            return res.status(400).send({
                success: false,
                msg: "contact required"
            });
        }
        if(contact.length=='') {
            return res.status(400).send({
                success: false,
                msg: "Contact Number Length Must be 10 digit"
            });
        }
       

    await db.query(adminQueries.updateFooter,[description,email,contact],function(error,data){
        if(error){
        return res.status(400).send({
            success: false,
            msg: "error occured",
            error
        });
    }
        if(data){
    res.status(200).send({
        success:true,
        msg : "Footer Updated",
     
    });
        }else{
            res.status(400).send({
                success:false,
                msg:"No Data"
            });            
        }
    });
}


exports.getWebContent = async (db,req,res)=>{
   
    await db.query(adminQueries.getWebContent, function(error,data){
        if(error){
        return res.status(400).send({
            success: false,
            msg: "error occured",
            error
        });
    }
        if(data.length > 0){
    res.status(200).send({
        success:true,
        msg : "Web Content Details",
        response : data[0]
    });
        }else{
            res.status(400).send({
                success:false,
                msg:"No Data"
            });            
        }
    }); 
}

exports.updateWebContent = async (db,req,res)=>{


        var form = new formidable.IncomingForm();
        form.parse(req, async  function (err, fields, files) {
 
            if (logo=='') {
                return res.status(400).send({
                    success: false,
                    msg: "logo required"
                });
            }
            var favicon_upload = (!files.favicon)?null:(!files.favicon.name)?null:files.favicon; 
            var logo_upload = (!files.logo)?null:(!files.logo.name)?null:files.logo;
            if (title=='') {
                return res.status(400).send({
                    success: false,
                    msg: "title required"
                });
            }
            if (description=='') {
                return res.status(400).send({
                    success: false,
                    msg: "description required"
                });
            }
        
    if(!favicon_upload)
    {
        var favicon ='';
        
    }else{
        var oldpath = files.favicon.path;
       
        var filePath = "./uploads/"
        let newfilename = filePath +files.favicon.name
 
      // Read the file
     await fs.readFile(oldpath,async function (err, data) {
        if (err) throw err;
            // Write the file
        await  fs.writeFile(newfilename, data, function (err) {
                if (err) throw err;
    
            });
        });
        var favicon = files.favicon.name;
        
    }
    if(!logo_upload)
    {
        var logo ='';
    }else{
        var oldpath = files.logo.path;
            var filePath = "./uploads/"
          let newfilename = filePath +files.logo.name
     
          // Read the file
      await   fs.readFile(oldpath, async function (err, data) {
            if (err) throw err;
                // Write the file
             await   fs.writeFile(newfilename, data, function (err) {
                    if (err) throw err;
                   
                })
            });   
            var logo = files.logo.name;
    }      
    
   
    var title = fields.title;
    var description = fields.description;

   db.query(adminQueries.getWebContent,function(error,result){
    if(error){
        return res.status(400).send({
            success: false,
            msg: "error occured",
            error
        });
    }
    var webContent = {
        "favicon" : favicon,  
        "logo" : logo,
        "title" : title,
        "description" : description
    }
    if(!favicon)
    {
    webContent.favicon = result[0].favicon;
    }
if(!logo)
    {
    webContent.logo = result[0].logo;
    }
    
 db.query(adminQueries.updateWebContent,webContent,function(error,data){
    if(error){
    return res.status(400).send({
        success: false,
        msg: "error occured",
        error
    });
}
    if(data){
res.status(200).send({
    success:true,
    msg : "Web Content Updated",
 
});
    }else{
        res.status(400).send({
            success:false,
            msg:"No Data"
        });            
    }
});
});
          });
        
}


exports.getUserDetail = async (db,req,res)=>{

await db.query(adminQueries.getUsers,function(error,data){
    if(error){
    return res.status(400).send({
        success: false,
        msg: "error occured",
        error
    });
}
    if(data.length>0){
res.status(200).send({
    success:true,
    msg : "All Users Details",
    response : data
 });
    }else{
        res.status(200).send({
            success:false,
            msg:"No Data"
        });            
    }
});
}

exports.getSingleUserDetail = async (db,req,res)=>{

    var id = req.body.id

    if (id=='') {
        return res.status(400).send({
            success: false,
            msg: "UserID required"
        });
    }
    
    await db.query(adminQueries.getSingleUser,[id],function(error,data){
        if(error){
        return res.status(400).send({
            success: false,
            msg: "error occured",
            error
        });
    }
        if(data.length>0){
    res.status(200).send({
        success:true,
        msg : "All Users Details",
        response : data[0]
     });
        }else{
            res.status(400).send({
                success:false,
                msg:"No Data"
            });            
        }
    });
    }
    
    
    
exports.getOrderDetail = async (db,req,res)=>{

    var user_id = req.body.user_id;
    var whr='';
    if(user_id>0){
    whr = user_id 
    } 
   
    await db.query(adminQueries.getOrderDetail,[whr],function(error,data){
        if(error){
        return res.status(400).send({
            success: false,
            msg: "error occured",
            error
        });
    }
        if(data.length>0){
    res.status(200).send({
        success:true,
        msg : "All orders Details",
        response : data
     });
        }else{
            res.status(400).send({
                success:false,
                msg:"No Data"
            });            
        }
    });
    }


 exports.insertMarketPlace = async (db, req, res) => {

        try {
     
        var form = new formidable.IncomingForm();
        form.parse(req, async  function (err, fields, files) {
 
            if (item_image=='') {
                return res.status(400).send({
                    success: false,
                    msg: "Item Image required"
                });
            }
            var item_image_upload = (!files.item_image)?null:(!files.item_image.name)?null:files.item_image; 
            if (fields.title=='') {
                return res.status(400).send({
                    success: false,
                    msg: "title required"
                });
            }
            if (fields.price=='') {
                return res.status(400).send({
                    success: false,
                    msg: "Price required"
                });
            }
    if(!item_image_upload)
    {
        var item_image ='';
        
    }else{
        var oldpath = files.item_image.path;
       
        var filePath = "./uploads/"
        let newfilename = filePath +files.item_image.name
 
      // Read the file
     await fs.readFile(oldpath,async function (err, data) {
        if (err) throw err;
            // Write the file
        await  fs.writeFile(newfilename, data, function (err) {
                if (err) throw err;
    
            });
        });
        var item_image = files.item_image.name;
        
    }
    var title = fields.title;
    var description = fields.description;
    var author = fields.author;
    var web_link = fields.web_link;
    var price = fields.price;
    var datetime = new Date();   
 
            var users = {
               "title" : title,
               "author" : author,
              "description" : description,
             "item_image" : item_image,
              "web_link" : web_link,
              "price" :price,
              "datetime" : datetime
            }
        db.query(adminQueries.insertMarketPlace,[users],function(error,result){
            if(error){
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
            if(result){
            res.status(200).send({
                success:true,
                msg : "Inserted Successfully",
             });
            }else{
                res.status(200).send({
                    success:true,
                    msg : "Insertion Failed",
                 });
            }               
        })
        });       

        } catch (err) {
           // console.log(err)
            return res.status(400).send({
                success: false,
                msg: "unexpected internal error",
                err
            });
        }
     
     }
     
exports.getMarketPlace = async (db,req,res)=>{
   
    await db.query(adminQueries.getMarketPlace, function(error,data){
        if(error){
        return res.status(400).send({
            success: false,
            msg: "error occured",
            error
        });
    }
        if(data.length > 0){
    res.status(200).send({
        success:true,
        msg : "Market Places",
        response : data
    });
        }else{
            res.status(400).send({
                success:false,
                msg:"No Data"
            });            
        }
    });
}

exports.insertCategory = async (db,req,res)=>{

    var name = req.body.name;
    var ip = null;
    var datetime = new Date();
    
    if (name=='') {
        return res.status(400).send({
            success: false,
            msg: "name required "
        });
    }
    var users = {
       "name" : name,
        "ip" : ip,
        "datetime" : datetime
    }

    await db.query(adminQueries.insertCategory,[users],function(error,data){
        if(error){
        return res.status(400).send({
            success: false,
            msg: "error occured",
            error
        });
    }
        if(data){
    res.status(200).send({
        success:true,
        msg : "Insert Item in Category Successfully "
     });
        }else{
            res.status(200).send({
                success:false,
                msg:"Insertion Failed"
            });            
        }
    });
    }

exports.getCategory = async (db,req,res)=>{

        await db.query(adminQueries.Category,function(error,data){
            if(error){
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
            if(data.length>0){
        res.status(200).send({
            success:true,
            msg : "Category Item Details",
            response:data
         });
            }else{
                res.status(200).send({
                    success:false,
                    msg:"No Data"
                });            
            }
        });
        }


 exports.singleCategory = async (db,req,res)=>{

        var id = req.body.id;

    await db.query(adminQueries.singleCategory,[id],function(error,data){
                if(error){
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
                if(data.length>0){
            res.status(200).send({
                success:true,
                msg : "Category Single Item Details",
                response:data[0]
             });
                }else{
                    res.status(200).send({
                        success:false,
                        msg:"No Data"
                    });            
                }
            });
            }
            
exports.updateCategory = async (db,req,res)=>{

        var id = req.body.id;
        var name = req.body.name;
        var ip = null;
        var datetime = new Date();
        
        if (name=='') {
            return res.status(400).send({
                success: false,
                msg: "name required "
            });
        }
        var users = {
           "name" : name,
            "ip" : ip,
            "datetime" : datetime
        }
        
        await db.query(adminQueries.updateCategory,[users,id],function(error,data){
            if(error){
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
            if(data){
        res.status(200).send({
            success:true,
            msg : "Category Item Updated Successfully "
         });
            }else{
                res.status(200).send({
                    success:false,
                    msg:"Updation Failed"
                });            
            }
        });
        }
            

exports.deleteCategory = async (db,req,res)=>{

    var id = req.body.id;

    await db.query(adminQueries.deleteCategory,[id],function(error,data){
        if(error){
        return res.status(400).send({
            success: false,
            msg: "error occured",
            error
        });
    }
        if(data){
    res.status(200).send({
        success:true,
        msg : "Category Item Deleted Successfully "
     });
        }else{
            res.status(200).send({
                success:false,
                msg:"Deletion Failed"
            });            
        }
    });
    }
    
/* -------------------Insert Item -------------------------*/ 
exports.insertItem = async (db,req,res)=>{

        var name = req.body.name;
        var description = req.body.description;
        var image =  req.body.image;
        var owner = req.body.owner;
        var item_category_id = req.body.item_category_id;
        var token_id = req.body.token_id;
        var price = req.body.price;
        var ip = null;
        var datetime = new Date();
        
        if (name=='') {
            return res.status(400).send({
                success: false,
                msg: "name required "
            });
        }
        if (image=='') {
            return res.status(400).send({
                success: false,
                msg: "image required "
            });
        }
        if (owner=='') {
            return res.status(400).send({
                success: false,
                msg: "owner required "
            });
        }
        if (token_id=='') {
            return res.status(400).send({
                success: false,
                msg: "token_id required "
            });
        }
        if (price=='') {
            return res.status(400).send({
                success: false,
                msg: "Price required "
            });
        }
        var users = {
           "name" : name,
           "description":description,
           "image" : image,
           "owner": owner,
           "item_category_id":item_category_id,
           "token_id" : token_id,
           "price" : price,
            "ip" : ip,
            "datetime":datetime
        }

        await db.query(adminQueries.insertItem,[users],function(error,data){
            if(error){
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
            if(data){
        res.status(200).send({
            success:true,
            msg : "Insert Item in Category Successfully "
         });
            }else{
                res.status(200).send({
                    success:false,
                    msg:"Insertion Failed"
                });            
            }
        });
        }

 exports.getItem= async (db,req,res)=>{

            await db.query(adminQueries.getItem,function(error,data){
                if(error){
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
                if(data.length>0){
            res.status(200).send({
                success:true,
                msg : "Item Details",
                response:data
             });
                }else{
                    res.status(200).send({
                        success:false,
                        msg:"No Data"
                    });            
                }
            });
            }
    
exports.updateItem = async (db,req,res)=>{

        var id = req.body.id;    
        var name = req.body.name;
        var description = req.body.description;
        var image =  req.body.image;
        var owner = req.body.owner;
        var item_category_id = req.body.item_category_id;
        var token_id = req.body.token_id;
        var price = req.body.price;
        var type = req.body.type;
        var ip = null;
        var datetime = new Date();
        
        if (name=='') {
            return res.status(400).send({
                success: false,
                msg: "name required "
            });
        }
        if (image=='') {
            return res.status(400).send({
                success: false,
                msg: "image required "
            });
        }
        if (owner=='') {
            return res.status(400).send({
                success: false,
                msg: "owner required "
            });
        }
        if (token_id=='') {
            return res.status(400).send({
                success: false,
                msg: "token_id required "
            });
        }
        if (price=='') {
            return res.status(400).send({
                success: false,
                msg: "Price required "
            });
        }
        if (type=='') {
            return res.status(400).send({
                success: false,
                msg: "Type required "
            });
        }        
        await db.query(adminQueries.getItem,async function(error,result){
            if(error){
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
        var users = {
           "name" : name,
           "description":description,
           "image" : image,
           "owner": owner,
           "item_category_id":item_category_id,
           "type" : type,
        //    "token_id" : token_id,
           "price" : price,
            // "ip" : ip,
            "datetime":datetime
        }
        console.log(users);
        if(!image)
        {
        users.image = result[0].image;
        }
            console.log(id);
            await db.query(adminQueries.updateItem,[users,id],function(error,data){
                if(error){
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
                if(data){
            res.status(200).send({
                success:true,
                msg : "Item Updated Successfully "
             });
                }else{
                    res.status(200).send({
                        success:false,
                        msg:"Updation Failed"
                    });            
                }
            });
        });
}                
    
exports.deleteItem = async (db,req,res)=>{
 
            var id = req.body.id;
            if (id=='') {
                return res.status(400).send({
                    success: false,
                    msg: "ID required "
                });
            }

            await db.query(adminQueries.deleteItem,[id],function(error,data){
                if(error){
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
                if(data){
            res.status(200).send({
                success:true,
                msg : "Item Delete Successfully"
             });
                }else{
                    res.status(200).send({
                        success:false,
                        msg:"Deletion Failed"
                    });            
                }
            });
            }

            exports.dashboardItem= async (db,req,res)=>{

                await db.query(adminQueries.dashItem,function(error,data){
                    if(error){
                    return res.status(400).send({
                        success: false,
                        msg: "error occured",
                        error
                    });
                }
                    if(data.length>0){
                res.status(200).send({
                    success:true,
                    msg : "Item Details",
                    response:data[0]
                 });
                    }else{
                        res.status(200).send({
                            success:false,
                            msg:"No Data"
                        });            
                    }
                });
                }            
        

                exports.getTelentUsers= async (db,req,res)=>{

                    await db.query(adminQueries.getTelentUsers,function(error,data){
                        if(error){
                        return res.status(400).send({
                            success: false,
                            msg: "error occured",
                            error
                        });
                    }
                        if(data.length>0){
                    res.status(200).send({
                        success:true,
                        msg : "Telent User Details",
                        response:data
                     });
                        }else{
                            res.status(200).send({
                                success:false,
                                msg:"No Data"
                            });            
                        }
                    });
                }      
                
                exports.getUsers= async (db,req,res)=>{
                    await db.query(adminQueries.getUsers,function(error,data){
                        if(error){
                        return res.status(400).send({
                            success: false,
                            msg: "error occured",
                            error
                        });
                    }
                        if(data.length>0){
                    res.status(200).send({
                        success:true,
                        msg : "Users Details",
                        response:data
                     });
                        }else{
                            res.status(200).send({
                                success:false,
                                msg:"No Data"
                            });            
                        }
                    });
                }                

                exports.deleteUser = async (db,req,res)=>{
 
                    var id = req.body.id;
                    if (id=='') {
                        return res.status(400).send({
                            success: false,
                            msg: "ID required "
                        });
                    }
                
                    await db.query(adminQueries.deleteUser,[id],function(error,data){
                        if(error){
                        return res.status(400).send({
                            success: false,
                            msg: "error occured",
                            error
                        });
                    }
                        if(data){
                    res.status(200).send({
                        success:true,
                        msg : "User Delete Successfully"
                     });
                        }else{
                            res.status(200).send({
                                success:false,
                                msg:"Deletion Failed"
                            });            
                        }
                    });
                    }



                   
                    


                                           
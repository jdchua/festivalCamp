var express = require("express");
var router = express.Router({mergeParams: true});
var Festival = require("../models/festival");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    //find festival by id
    Festival.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
   //lookup festival using ID
   Festival.findById(req.params.id, function(err, campground){
      if (err){
          console.log(err);
          res.redirect("/festivals");
      } else {
          Comment.create(req.body.comment, function(err, comment){
              if (err){
                  req.flash("error", "Something went wrong");
                  console.log(err);
              } else {
                  //add username and id to comment
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  //save comment
                  comment.save();
                  campground.comments.push(comment);
                  campground.save();
                  console.log();
                  req.flash("success", "Successfully added comment");
                  res.redirect("/festivals/" + campground._id);
              }
          });
      }
   });
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if (err){
            res.redidirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
});

//COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if (err){
            res.redirect("back");
        } else {
            res.redirect("/festivals/" + req.params.id);
        }
    }) 
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if (err){
           res.redirect("back");
       } else {
           Festival.findByIdAndUpdate(req.params.id, {$pull: {comments: req.params.comment_id}}, function(err, data){
               if (err){
                   console.log(err);
               } else {
                    req.flash("success", "Comment Deleted");
                    res.redirect("/festivals/" + req.params.id);
               }
           });
       }
    });
});


module.exports = router;
var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var methodOverride=require("method-override");
var expressSanitizer=require("express-sanitizer");

mongoose.connect("mongodb://localhost:27017/blog_app",{useNewUrlParser:true,useUnifiedTopology: true});
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
mongoose.set('useFindAndModify', false);

var blogSchema=new mongoose.Schema({
	title:String,
	image:String,
	body:String,
	created:{type: Date,default: Date.now}
});

var Blog=mongoose.model("Blog",blogSchema);

/*Blog.create({
	title:"Test Blog",
	image:"https://images.unsplash.com/photo-1588167056547-c183313da47c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
	body:"Hello this is a blog post!!"
})*/
app.get("/",function(req,res){
	res.redirect("/blogs");
});

app.get("/blogs",function(req,res){
	Blog.find({},function(err,blogs){
		if(err)
			console.log("ERROR!");
		else{
			res.render("index",{blogs:blogs});
		}
	});
});

app.get("/blogs/new",function(req,res){
	res.render("new");
});

app.post("/blogs",function(req,res){
	var newBlog=req.body.blog;
	//console.log(newBlog.body);
	newBlog.body=req.sanitize(newBlog.body);
	//console.log(newBlog.body);
	Blog.create(newBlog,function(err,newBlog){
		if(err){
			res.render("error");
		}else{
			res.redirect("/blogs");
		}
	});
});

app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show",{blog:foundBlog});
		}
	});
});

app.get("/blogs/:id/edit",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit",{blog:foundBlog});
		}
	});
});

app.put("/blogs/:id",function(req,res){
	var newBlog=req.body.blog;
	//console.log(newBlog.body);
	newBlog.body=req.sanitize(newBlog.body);
	Blog.findByIdAndUpdate(req.params.id,newBlog,function(err,updatedBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/"+req.params.id);
		}
	})
});

app.delete("/blogs/:id",function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	});
});

app.listen(3000,function(){
	console.log("Server listening!!");
});
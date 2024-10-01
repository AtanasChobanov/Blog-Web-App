import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 3000;
var blogs = [];

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.render("index.ejs", {list: blogs});
});

app.get("/new", (req, res) => {
    res.render("create.ejs");
});

app.post("/post-blog", (req, res) =>{
    blogs.push(req.body);
    console.log(`Blog posted. Blogs count: ${blogs.length}`);
    res.redirect('/');
});

app.get(`/edit/:id`, (req, res) => {
    res.render("edit.ejs", {post: blogs[req.params.id], id: req.params.id});
});

app.post("/edit-blog/:id", (req, res) => {
    blogs[req.params.id] = req.body;
    console.log(`Blog ${req.params.id} edited.`);
    res.redirect("/");
});

app.post("/delete/:id", (req, res) => {
    console.log("Deleted post: "+blogs.splice(req.params.id, 1));
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});

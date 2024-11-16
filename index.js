import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import pg from "pg";

const app = express();
const port = 3000;
var channels = [{
  name: "Biology",
  admin: "Atanas",
  dateOfCreation: '19-10-2024',
  posts: [{
    title: "Test",
    content: "smth",
    dateOfCreation: "20-10-2024, 00:00",
    author: "Atanas Chobanov",
  }],
}];

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));

// Home route - veiws all channels
app.get("/", async (req, res) => {
  let channels = await readChannels();
  res.render("view-channels.ejs", { channels });
});

// READ all posts in a channel
app.get("/view/:channel_id", async (req, res) => {
  try {
    const posts = await readPosts(req.params.channel_id);
    console.log(posts);
    if (posts == []) {
      throw "Каналът не е намерен";
    }
    res.render("view-posts.ejs", {
      posts: posts,
      channel_id: req.params.channel_id,
    });
  } catch (err) {
    console.log("Error executing query: " + err);
    res.status(404).render("error-message.ejs", { errorMessage: err });
  }
});

// READ form for creating new channel
app.get("/new-channel", (req, res) => {
  res.render("new-channel.ejs");
});

// READ form for creating new post in a channel
app.get("/:channel_id/new-post", async (req, res) => {
  try {
    const channel = await readChannel(req.params.channel_id);
    res.render("new-post.ejs", {
      channel_id: channel.channel_id,
    });
  } catch (err) {
    res
      .status(404)
      .render("error-message.ejs", { errorMessage: "Channel not found" });
  }
});

// READ searched channel
app.post("/search-channel", async (req, res) => {
  const result = await db.query(
    "SELECT channel_id, channels.name, date_of_creation, admin_id, " +
      "users.name AS admin FROM channels JOIN users " +
      "ON channels.admin_id = users.user_id WHERE LOWER(channels.name) LIKE '%' || $1 || '%';",
    [req.body.searchedName]
  );
  
  console.log(result.rows);
  let channels = result.rows;
  res.render("search-channels-result.ejs", { channels });
});

// CREATE new channel
app.post("/create-channel", async (req, res) => {
  try {
    await db.query("INSERT INTO channels (name, admin_id) VALUES ($1, 1);", [
      req.body.name,
    ]);
    console.log(`New channel created.`);
    res.redirect("/");
  } catch (err) {
    console.log("Error executing query: " + err);
    res.render("new-channel.ejs", {
      name: req.body.name,
      errorMessage: "Това име на канал вече съществува!",
    });
  }
});

// CREATE new post in a channel
app.post("/:channel_id/create-post", async (req, res) => {
  try {
    await db.query(
      "INSERT INTO posts (title, content, author_id, channel_id) VALUES ($1, $2, 1, $3);",
      [req.body.title, req.body.content, req.params.channel_id]
    );
    console.log(`New post published.`);
    res.redirect("/view/" + req.params.channel_id);
  } catch (err) {
    console.log("Error executing query: " + err);
    res
      .status(500)
      .render("error-message.ejs", { errorMessage: "Error publishing post" });
  }
});

// READ form for upating a channel
app.get("/:channel_id/edit", async (req, res) => {
  try {
    const channel = await readChannel(req.params.channel_id);
    res.render("edit-channel.ejs", {
      channel: channel,
    });
  } catch (err) {
    res
      .status(404)
      .render("error-message.ejs", { errorMessage: "Channel not found" });
  }
});

// READ form for updating a post in a channel
app.get("/:channel_id/edit/:post_id", async (req, res) => {
  try {
    const post = await findPost(req.params.post_id);
    res.render("edit-post.ejs", {
      post: post,
      channel_id: req.params.channel_id,
    });
  } catch (err) {
    console.log("Error executing query: " + err.stack);
    res.status(404).render("error-message.ejs", {
      errorMessage: `Post in channel ${post.name} not found`,
    });
  }
});

// UPDATE a channel
app.patch("/:channel_id/edit", async (req, res) => {
  try {
    await db.query("UPDATE channels SET name = $1 WHERE channel_id = $2;", [
      req.body.name,
      req.params.channel_id,
    ]);
    console.log(`Updated channel with id: ${req.params.channel_id}.`);
    res.redirect("/");
  } catch (err) {
    console.log("Error executing query: " + err.stack);
    res
      .status(500)
      .render("error-message.ejs", { errorMessage: "Error updating channel" });
  }
});

// UPDATE a post in a channel
app.patch("/:channel_id/edit-post/:post_id", async (req, res) => {
  try {
    await db.query(
      "UPDATE posts SET title = $1, content = $2, date_of_last_edit = CURRENT_TIMESTAMP WHERE post_id = $3;",
      [req.body.title, req.body.content, req.params.post_id]
    );
    console.log(`Updated post with id: ${req.params.post_id}.`);
    res.redirect("/view/" + req.params.channel_id);
  } catch (err) {
    console.log("Error executing query: " + err.stack);
    res
      .status(500)
      .render("error-message.ejs", { errorMessage: "Error updating post" });
  }
});

// READ form for deleting a channel
app.get("/:channel_id/delete", async (req, res) => {
  try {
    const channel = await readChannel(req.params.channel_id);
    res.render("delete-channel.ejs", {
      channel: channel,
    });
  } catch (err) {
    res
      .status(404)
      .render("error-message.ejs", { errorMessage: "Channel not found" });
  }
});

// READ form for deleting a post in a channel
app.get("/:channel_id/delete-post/:post_id", async (req, res) => {
  try {
    const post = await findPost(req.params.post_id);
    res.render("delete-post.ejs", {
      post: post,
      channel_id: req.params.channel_id,
    });
  } catch (err) {
    console.log("Error executing query: " + err.stack);
    res.status(404).render("error-message.ejs", {
      errorMessage: `Post in channel ${post.name} not found`,
    });
  }
});

// DELETE a channel
app.delete("/:channel_id/delete", async (req, res) => {
  try {
    await db.query("DELETE FROM channels WHERE channel_id = $1;", [
      req.params.channel_id,
    ]);
    console.log(`Deleted channel with id: ${req.params.channel_id}.`);
    res.redirect("/");
  } catch (err) {
    console.log("Error executing query: " + err.stack);
    res
      .status(500)
      .render("error-message.ejs", { errorMessage: "Error deleting channel" });
  }
});

// DELETE a post in a channel
app.delete("/:channel_id/delete-post/:post_id", async (req, res) => {
  try {
    await db.query("DELETE FROM posts WHERE post_id = $1;", [
      req.params.post_id,
    ]);
    console.log(`Deleted post with id: ${req.params.post_id}.`);
    res.redirect("/view/" + req.params.channel_id);
  } catch (err) {
    console.log("Error executing query: " + err.stack);
    res
      .status(500)
      .render("error-message.ejs", { errorMessage: "Error deleting post" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}...`);
});

import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";

const app = express();
const port = process.env.PORT || 3000;
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
app.use(methodOverride('_method'));

app.get("/", (req, res) => {
  res.render("view-channels.ejs", { channels });
});

app.get('/view/:channel', (req, res) => {
  var searchChannelIndex = channels.findIndex(
    (channel) => channel.name == req.params.channel
  );
  if (searchChannelIndex === -1) {
    res.status(404).render("error-message.ejs", { errorMessage: "Channel not found" });
  } else {
    res.render("view-posts.ejs", { channel: channels[searchChannelIndex] });
  }
});

app.get("/new-channel", (req, res) => {
  res.render("new-channel.ejs");
});

app.get("/:channel/new-post", (req, res) => {
  var searchChannelIndex = channels.findIndex(
    (channel) => channel.name == req.params.channel
  );
  if (searchChannelIndex === -1) {
    res.status(404).render("error-message.ejs", { errorMessage: "Channel not found" });
  } else {
    res.render("new-post.ejs", {
      channelName: channels[searchChannelIndex].name,
    });
  }
});

app.post("/create-channel", (req, res) => {
  const currentDate = new Date();
  let fullDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
  const newChannel = {
    name: req.body.name,
    admin: req.body.username,
    dateOfCreation: fullDate,
    posts: [],
  };
  channels.push(newChannel);
  console.log(channels);
  console.log(
    `Channel ${newChannel.name} created. Channels count: ${channels.length}`
  );
  // res.json(newChannel);
  res.redirect('/');
});

app.post("/:channel/create-post", (req, res) => {
  var searchIndex = channels.findIndex(
    (channel) => channel.name == req.params.channel
  );
  if (searchIndex === -1) {
    res.status(404).render("error-message.ejs", { errorMessage: "Channel not found" });
  } else {
    const currentDate = new Date();

    // Помощна функция за добавяне на водеща нула при необходимост
    const pad = (number) => number.toString().padStart(2, "0");

    let fullDateAndTime = `${pad(currentDate.getDate())}-${pad(currentDate.getMonth() + 1)}-${currentDate.getFullYear()}, 
    ${pad(currentDate.getHours())}:${pad(currentDate.getMinutes())}`;

    const newPost = {
      title: req.body.title,
      content: req.body.content,
      dateOfCreation: fullDateAndTime,
      author: req.body.username,
    };
    channels[searchIndex].posts.push(newPost);
    console.log(
      `Post created. Posts count in channel ${channels[searchIndex].name}: ${channels[searchIndex].posts.length}`
    );
    // res.json(newPost);
    res.redirect("/view/" + channels[searchIndex].name);
  }
});

app.get("/:channel/edit", (req, res) => {
  var searchIndex = channels.findIndex(
    (channel) => channel.name == req.params.channel
  );
  if (searchIndex === -1) {
    res.status(404).render("error-message.ejs", { errorMessage: "Channel not found" });
  } else {
    // res.json({
    //   channel: channels[searchIndex],
    //   id: req.params.channel,
    // });
    res.render("edit-channel.ejs", {
      channel: channels[searchIndex],
    });
  }
});

app.get("/:channel/edit/:id", (req, res) => {
  var searchChanelIndex = channels.findIndex(
    (channel) => channel.name == req.params.channel
  );
  if (searchChanelIndex === -1) {
    res.status(404).render("error-message.ejs", { errorMessage: "Channel not found" });
  } else {
    var searchedPost = channels[searchChanelIndex].posts[req.params.id];
    if (typeof searchedPost !== "undefined") {
      // res.json({ post: searchedPost, id: req.params.id });
      res.render("edit-post.ejs", { channel: channels[searchChanelIndex], id: req.params.id });
    } else {
      res.status(404).render("error-message.ejs", {
        errorMessage: `Post in channel ${channels[searchChanelIndex].name} not found`,
      });
    }
  }
});

app.patch("/:channel/edit", (req, res) => {
  var searchChannelIndex = channels.findIndex(
    (channel) => channel.name == req.params.channel
  );
  var editChannel = {
    name: req.body.name || channels[searchChannelIndex].name,
    admin: channels[searchChannelIndex].admin,
    dateOfCreation: channels[searchChannelIndex].dateOfCreation,
    posts: channels[searchChannelIndex].posts,
  };
  channels[searchChannelIndex] = editChannel;
  console.log(
    `Channel "${req.params.channel}" edited to "${editChannel.name}".`
  );
  // res.json(editChannel);
  res.redirect("/");
});

app.patch("/:channel/edit-post/:id", (req, res) => {
  var searchChannelIndex = channels.findIndex(
    (channel) => channel.name == req.params.channel
  );
  var searchPost = channels[searchChannelIndex].posts[req.params.id];
  var date = new Date();
  let fullDateAndTime = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`;
  var editPost = {
    title: req.body.title || searchPost.title,
    content: req.body.content || searchPost.content,
    author: searchPost.author,
    dateOfCreation: searchPost.dateOfCreation,
    dateOfLastEdit: fullDateAndTime,
  };
  channels[searchChannelIndex].posts[req.params.id] = editPost;
  console.log(
    `Post #${req.params.id} in channel ${channels[searchChannelIndex].name} edited.`
  );
  // res.json(editPost);
  res.redirect("/view/" + channels[searchChannelIndex].name);
});

app.get("/:channel/delete", (req, res) => {
  var searchChannelIndex = channels.findIndex(
    (channel) => channel.name == req.params.channel
  );
  if (searchChannelIndex === -1) {
    res.status(404).render("error-message.ejs", { errorMessage: "Channel not found" });
  } else {
    res.render("delete-channel.ejs", {
      channel: channels[searchChannelIndex],
    });
  }
});

app.get("/:channel/delete-post/:id", (req, res) => {
  var searchChannelIndex = channels.findIndex(
    (channel) => channel.name == req.params.channel
  );
  if (searchChannelIndex === -1) {
    res.status(404).render("error-message.ejs", { errorMessage: "Channel not found" });
  } else {
    var searchedPost = channels[searchChannelIndex].posts[req.params.id];
    if (typeof searchedPost !== "undefined") {
      // res.json({ post: searchedPost, id: req.params.id });
      res.render("delete-post.ejs", { post: searchedPost, channelName:channels[searchChannelIndex].name, id: req.params.id });
    } else {
      res.status(404).render("error-message.ejs", {
        errorMessage: `Post in channel ${channels[searchChannelIndex].name} not found`,
      });
    }
  }
});

app.delete("/:channel/delete", (req, res) => {
  var searchChannelIndex = channels.findIndex(
    (channel) => channel.name == req.params.channel
  );
  channels.splice(searchChannelIndex, 1);
  console.log("Deleted channel.");
  // res.json(channels[searchChannelIndex].posts);
  res.redirect("/");
});

app.delete("/:channel/delete-post/:id", (req, res) => {
  var searchChannelIndex = channels.findIndex(
    (channel) => channel.name == req.params.channel
  );
  channels[searchChannelIndex].posts.splice(req.params.id, 1);
  console.log("Deleted post.");
  // res.json(channels[searchChannelIndex].posts);
  res.redirect("/view/" + channels[searchChannelIndex].name);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

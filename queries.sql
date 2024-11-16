CREATE DATABASE knowspacedb;

CREATE TABLE users(
	user_id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE channels(
	channel_id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL UNIQUE,
	date_of_creation DATE DEFAULT CURRENT_DATE,
	admin_id INTEGER NOT NULL,
	CONSTRAINT fk_channels_users
	FOREIGN KEY (admin_id)
	REFERENCES users(user_id)
);

INSERT INTO users (name)
VALUES ('Atanas Ch');

INSERT INTO channels (name, admin_id)
VALUES ('Biology', 1);

SELECT channel_id, channels.name, date_of_creation, admin_id, users.name AS admin FROM channels
JOIN users
ON channels.admin_id = users.user_id;

SELECT * FROM channels WHERE channel_id = 1;

UPDATE channels 
SET name = 'History'
WHERE channel_id = 1;

DELETE FROM channels
WHERE channel_id = 1;

CREATE TABLE posts(
	post_id SERIAL PRIMARY KEY,
	title VARCHAR(100) NOT NULL,
	content VARCHAR(500) NOT NULL,
	author_id INTEGER NOT NULL,
	date_of_creation DATETIME DEFAULT GETDATE(),
	date_of_last_edit DATETIME,
	channel_id INTEGER NOT NULL,
	CONSTRAINT fk_posts_users
	FOREIGN KEY (author_id)
	REFERENCES users(user_id)
	  ON DELETE CASCADE
	  ON UPDATE CASCADE,
	CONSTRAINT fk_posts_channels
	FOREIGN KEY (channel_id)
	REFERENCES channels(channel_id)
	  ON DELETE CASCADE
	  ON UPDATE CASCADE
);

INSERT INTO posts (title, content, author_id, channel_id)
VALUES ('Hello', 'This is my first post!', 1, 1);

SELECT ch.name, post_id, title, content, u.name AS author, p.date_of_creation, date_of_last_edit
FROM posts p
JOIN channels ch 
ON ch.channel_id = p.channel_id 
JOIN users u 
ON p.author_id = u.user_id
WHERE ch.channel_id = $1
ORDER BY date_of_creation DESC;

UPDATE posts
SET title = $1, content = $2, date_of_last_edit = CURRENT_TIMESTAMP
WHERE post_id = $3;

DELETE FROM posts
WHERE post_id = $1;

CREATE TABLE members_of_channels(
	user_id INTEGER,
	channel_id INTEGER,
	PRIMARY KEY(user_id, channel_id),
	CONSTRAINT fk_members_of_channels_users
	FOREIGN KEY (user_id)
	REFERENCES users(user_id),
	CONSTRAINT fk_members_of_channels_channels
	FOREIGN KEY (channel_id)
	REFERENCES channels(channel_id)
);

INSERT INTO members_of_channels
VALUES (1, 1);
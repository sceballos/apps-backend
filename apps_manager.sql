SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET default_tablespace = '';
SET default_with_oids = false;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS applications;

CREATE TABLE IF NOT EXISTS users (
    user_id serial PRIMARY KEY,
	username VARCHAR ( 50 ) UNIQUE NOT NULL,
	password VARCHAR ( 50 ) NOT NULL,
	created_on TIMESTAMP NOT NULL,
    last_login TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS applications (
    app_id serial PRIMARY KEY,
	name VARCHAR ( 50 ) UNIQUE NOT NULL,
	description VARCHAR ( 500 ) NOT NULL,
	created_on TIMESTAMP NOT NULL,
    modified_on TIMESTAMP 
);

INSERT INTO users (username, password, created_on, last_login) VALUES
('superadminthatisnotactuallyanadmin', 'supersecretpassword', CURRENT_TIMESTAMP, NULL),
('layla', 'password1', CURRENT_TIMESTAMP, NULL),
('roger', 'rogeristhebest', CURRENT_TIMESTAMP, NULL),
('carlos', 'isthisreal', CURRENT_TIMESTAMP, NULL),
('marco', 'michaelbestspirit', CURRENT_TIMESTAMP, NULL);

INSERT INTO applications (name, description, created_on, modified_on) VALUES
('TEST-APP', 'Description of app that is going to be modified by the unit test.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Facebook', 'Social media to make friends. Is free! Unless you value your privacy!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Netflix', 'Looking for the most talked about TV shows and movies from the around the world? They’re all on Netflix.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Instagram', 'Connect with friends, share what youre up to, or see whats new from others all over the world. Explore our community where you can feel free to be yourself and share everything from your daily moments to lifes highlights.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Spotify: Music and Podcasts', 'With Spotify, you can listen to music and play millions of songs and podcasts for free. Stream music and podcasts you love and find music - or your next favorite song - from all over the world.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Telegram', 'Pure instant messaging — simple, fast, secure, and synced across all your devices. One of the worlds top 10 most downloaded apps with over 500 million active users.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Disney+', 'Disney+ is the streaming home of your favorite stories. With unlimited entertainment from Disney, Pixar, Marvel, Star Wars and National Geographic, theres always something to explore. Watch the latest releases, Original series and movies, classic films, and TV shows with new stories added every week.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Pinterest', 'New year, new inspiration. Explore billions of ideas to turn your dreams into reality.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('TikTok', 'TikTok is THE destination for mobile videos. On TikTok, short-form videos are exciting, spontaneous, and genuine. Whether youre a sports fanatic, a pet enthusiast, or just looking for a laugh, there’s something for everyone on TikTok.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
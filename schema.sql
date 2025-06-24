DROP TABLE IF EXISTS leaderboard;
DROP TABLE IF EXISTS users;


CREATE TABLE users
(
    user_id TEXT PRIMARY KEY,
    password TEXT NOT NULL
);

CREATE TABLE leaderboard
(
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    lap_time TEXT NOT NULL,
    map TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- SELECT *
-- FROM leaderboard;
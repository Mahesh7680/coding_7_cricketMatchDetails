const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

module.exports = app;

//get                       API - 1

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT player_id as playerId,
    player_name as playerName
    FROM player_details;
    `;
  const dbResponse = await db.all(getPlayersQuery);
  response.send(dbResponse);
});

//GET                       API - 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
    SELECT player_id as playerId,
    player_name as playerName
    FROM player_details
    WHERE
    player_id = ${playerId}
    `;
  const dbResponse = await db.get(getPlayersQuery);
  response.send(dbResponse);
});
// PUT                          API - 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updateQuery = `
  UPDATE player_details
  SET
    player_name = '${playerName}'
  `;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

// get                          API - 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersQuery = `
    SELECT match_id as matchId, match as match, year as year
    FROM match_details
    WHERE match_id = ${matchId}
    `;
  const dbResponse = await db.get(getPlayersQuery);
  response.send(dbResponse);
});

// get                      API - 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
    SELECT match_details.match_id as matchId, 
    match_details.match,
    match_details.year
    FROM  player_match_score NATURAL JOIN match_details
    WHERE
    player_id = ${playerId}
    `;
  const dbResponse = await db.all(getPlayersQuery);
  response.send(dbResponse);
});

// get                      API - 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersQuery = `
    SELECT player_details.player_id as playerId,
            player_details.player_name as playerName
    FROM 
        player_match_score NATURAL JOIN player_details
    WHERE
        match_id=${matchId};`;
  const dbResponse = await db.all(getPlayersQuery);
  response.send(dbResponse);
});

// get                      API - 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
  SELECT
    player_details.player_id as playerId,
    player_details.player_name as playerName,
    SUM(player_match_score.score) as totalScore,
    SUM(fours) as totalFours,
    SUM(sixes) as totalSixes

  FROM player_details INNER JOIN player_match_score ON 
    player_details.player_id = player_match_score.player_id

  WHERE
    player_details.player_id = ${playerId};`;
  const dbResponse = await db.get(getPlayersQuery);
  response.send(dbResponse);
});

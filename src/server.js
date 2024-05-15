const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const shortId = require("shortid");
const fs = require("fs/promises");
const path = require("path");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const dbLocation = path.resolve("src", "db.json");

/**
 * Player Misroservice
 * CURD     -       Create Read Update Delete
 * GET      - /     - find all users
 * POST     - /     - create a new player and save into db
 * GET      - /:id  - find a single player by id
 * PUT      - /:id  - update or create player
 * PATCH    - /:id  - update player
 * DELETE   - /:id  - delete player from db
 */

// =============== Patch Player Request ===============
app.patch("/:id", async (req, res) => {
  const data = await fs.readFile(dbLocation);
  const players = JSON.parse(data);

  // Find Player By Id
  const player = players.find((player) => player.id === req.params.id);

  if (!player) {
    return res.status(404).json({
      message: "Player not found",
    });
  }

  player.name = req.body.name || player.name;
  player.country = req.body.country || player.country;
  player.rank = req.body.rank || player.rank;

  await fs.writeFile(dbLocation, JSON.stringify(players));

  res.status(200).json(player);
});

// =============== Put Single Player Request ===============
app.put("/:id", async (req, res) => {
  const data = await fs.readFile(dbLocation);
  const players = JSON.parse(data);

  let player = players.find((player) => player.id === req.params.id);

  if (!player) {
    player = {
      ...req.body,
      id: shortId.generate(),
    };

    players.push(player);
  } else {
    player.name = req.body.name;
    player.country = req.body.country;
    player.rank = req.body.rank;
  }

  await fs.writeFile(dbLocation, JSON.stringify(players));

  res.status(200).json(player);
});

// =============== Single Player Delete Request ===============
app.delete("/:id", async (req, res) => {
  const data = await fs.readFile(dbLocation);
  const players = JSON.parse(data);

  // Find Player By Id
  const player = players.find((player) => player.id === req.params.id);

  if (!player) {
    return res.status(404).json({
      message: "Player not found",
    });
  }

  const newPlayers = players.filter((player) => player.id !== req.params.id);

  await fs.writeFile(dbLocation, JSON.stringify(newPlayers));

  res.status(200).json(player);
});

// =============== Single Player Find Request ===============
app.get("/:id", async (req, res) => {
  const data = await fs.readFile(dbLocation);
  const players = JSON.parse(data);

  // Find Player By Id
  const player = players.find((player) => player.id === req.params.id);

  if (!player) {
    return res.status(404).json({
      message: "Player not found",
    });
  }

  res.set("Cache-control", "public, max-age=300");
  res.status(200).json(player);
});

// =============== Player Post Request ===============
app.post("/", async (req, res) => {
  const player = {
    ...req.body,
    id: shortId.generate(),
  };

  const data = await fs.readFile(dbLocation);
  const players = JSON.parse(data);
  players.push(player);

  await fs.writeFile(dbLocation, JSON.stringify(players));
  res.status(201).json(player);
});

// =============== Player Get Request ===============
app.get("/", async (req, res) => {
  const data = await fs.readFile(dbLocation);
  const players = JSON.parse(data);

  res.set("Cache-control", "public, max-age=300");
  res.status(201).json(players);
});

// Define PORT
const port = process.env.PORT || 4000;

// Listen application
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`localhost:${port}`);
});

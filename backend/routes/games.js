var express = require('express');
var router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

/* =============================================================================
   PLAYERS API
============================================================================= */
router.get('/players', async function(req, res, next) {
    try {
        const result = await pool.query('SELECT name FROM players ORDER BY id');
        const playerNames = result.rows.map(row => row.name);
        res.status(200).json({ players: playerNames });
    } catch (err) {
        next(err);
    }
});

router.post('/players', async function(req, res, next) {
    if (!req.body.name) return res.status(400).json({ error: 'Required fields: name' });
    try {
        await pool.query('INSERT INTO players (name) VALUES ($1) ON CONFLICT DO NOTHING', [req.body.name]);
        res.status(201).json({ name: req.body.name });
    } catch (err) {
        next(err);
    }
});

/* =============================================================================
   ACTIVE GAME API
============================================================================= */
router.get('/games/active', async function(req, res, next) {
    try {
        const gameRes = await pool.query("SELECT * FROM games WHERE status = 'active' LIMIT 1");
        if (gameRes.rows.length === 0) return res.status(404).json({ error: 'No active game found' });
        
        const game = gameRes.rows[0];

        const roundsRes = await pool.query("SELECT scores FROM rounds WHERE game_id = $1 ORDER BY id", [game.id]);
        const rounds = roundsRes.rows.map(r => r.scores);
        
        res.status(200).json({ id: game.id, players: game.players, rounds: rounds });
    } catch (err) {
        next(err);
    }
});

router.post('/games/active', async function(req, res, next) {
    if (!req.body.players || req.body.players.length < 2) {
        return res.status(400).json({ error: 'Required fields: players (array of at least 2)' });
    }
    try {
        await pool.query("UPDATE games SET status = 'abandoned' WHERE status = 'active'");
        
        const result = await pool.query(
            "INSERT INTO games (status, players) VALUES ('active', $1) RETURNING id, players",
            [JSON.stringify(req.body.players)]
        );

        req.app.get('publishEvent')('game:create');

        res.status(201).json({ id: result.rows[0].id, players: result.rows[0].players, rounds: [] });
    } catch (err) {
        next(err);
    }
});

router.put('/games/active/rounds', async function(req, res, next) {
    try {
        const gameRes = await pool.query("SELECT id, players FROM games WHERE status = 'active' LIMIT 1");
        if (gameRes.rows.length === 0) return res.status(404).json({ error: 'No active game found' });
        const game = gameRes.rows[0];

        await pool.query("INSERT INTO rounds (game_id, scores) VALUES ($1, $2)", [game.id, JSON.stringify(req.body)]);

        const roundsRes = await pool.query("SELECT scores FROM rounds WHERE game_id = $1 ORDER BY id", [game.id]);
        const rounds = roundsRes.rows.map(r => r.scores);

        req.app.get('publishEvent')('round:create');

        res.status(200).json({ id: game.id, players: game.players, rounds: rounds });
    } catch (err) {
        next(err);
    }
});

router.delete('/games/active', async function(req, res, next) {
    try {
        await pool.query("UPDATE games SET status = 'abandoned' WHERE status = 'active'");

        req.app.get('publishEvent')('game:end');

        res.status(204).send(); 
    } catch (err) {
        next(err);
    }
});

/* =============================================================================
   PAST GAMES (HISTORY) API
============================================================================= */
router.get('/games', async function(req, res, next) {
    try {
        const gamesRes = await pool.query("SELECT id, players FROM games WHERE status = 'completed' ORDER BY id DESC");
        const games = [];

        for (let g of gamesRes.rows) {
            const roundsRes = await pool.query("SELECT scores FROM rounds WHERE game_id = $1 ORDER BY id", [g.id]);
            games.push({
                id: g.id,
                players: g.players,
                rounds: roundsRes.rows.map(r => r.scores)
            });
        }
        res.status(200).json({ games: games });
    } catch (err) {
        next(err);
    }
});

router.post('/games', async function(req, res, next) {
    try {
        await pool.query("UPDATE games SET status = 'completed' WHERE status = 'active'");

        req.app.get('publishEvent')('game:end');

        res.status(201).json(req.body);
    } catch (err) {
        next(err);
    }
});

router.delete('/games/:id', async function(req, res, next) {
    try {
        await pool.query("DELETE FROM games WHERE id = $1", [req.params.id]);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
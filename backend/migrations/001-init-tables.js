/* Initial migration: create players, games, rounds tables */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('players', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true, unique: true }
  });

  pgm.createTable('games', {
    id: { type: 'serial', primaryKey: true },
    status: { type: 'varchar(50)', notNull: true },
    players: { type: 'jsonb', notNull: true }
  });

  pgm.createTable('rounds', {
    id: { type: 'serial', primaryKey: true },
    game_id: { type: 'integer', notNull: true, references: 'games(id)', onDelete: 'cascade' },
    scores: { type: 'jsonb', notNull: true }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('rounds');
  pgm.dropTable('games');
  pgm.dropTable('players');
};

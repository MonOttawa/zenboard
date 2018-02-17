/** 
 * This module is responsible for card-related route handlers.
 */
'use strict';
const Card = require('../models/Card');
const Row = require('../models/Row');
const RouteUtil = require('./RouteUtil')
const EventsUtil = require('../modules/EventsUtil');
const debug = require('debug')('zenboard:routes:cards');

module.exports = function(io) {
  let module = {};

  module.save = async (req, res) => {
    let body = req.body;
    try {
      let card = await Card.saveCard(body);
      res.sendStatus(200);

      let rows = await Row.fetchRowsDeep(false);
      EventsUtil.emitBoardRefreshWithRows(io, rows);
    } catch (error) {
      RouteUtil.sendError(res, error, 'Error saving card');
    }
  }

  module.fetchById = async (req, res) => {
    try {
      let card = await Card.fetchCardById(req.params.id);
      res.send(card);
    } catch(error) {
      RouteUtil.sendError(res, error);
    }
  }

  module.move = async (req, res) => {
    let body = req.body;
    try {
      const card = await Card.moveCard(body);
      res.sendStatus(200);

      const rows = await Row.fetchRowsDeep();
      EventsUtil.emitBoardRefreshWithRows(io, rows);
    } catch(error) {
      RouteUtil.sendError(res, error);
    }
  }

  module.create = async (req, res) => {
    let body = req.body;

    try {
      const card = await Card.createCard(body);
      await Card.updateDestinationAndSourceCells(card);
      res.sendStatus(200);

      const rows = await Row.fetchRowsDeep();
      EventsUtil.emitBoardRefreshWithRows(io, rows);
      io.emit('cardCreate', card);
    } catch(error) {
      RouteUtil.sendError(res, error);
    }
  }

  /** TODO: Test */
  module.fetchArchive = async (req, res) => {
    try {
      let archivedCards = await Card.fetchArchive();
      RouteUtil.sendArray(res, archivedRows);
    } catch(error) {
      RouteUtil.sendError(res, error);
    }
  }

  return module;
}
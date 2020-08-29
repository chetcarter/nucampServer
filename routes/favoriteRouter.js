const express = require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
	.route('/')
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		Favorite.findOne({ user: req.user._id })
			.populate('user')
			.populate('campsites')
			.then((favorites) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.send(favorites);
			})
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorite.findOne({ user: req.user._id }).then((favorites) => {
			if (favorites) {
				req.body.forEach((campsite) => {
					if (!favorites.campsites.includes(campsite._id)) {
						favorites.campsites.push(campsite._id);
					}
				});
				favorites.save().then((favorites) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorites);
				});
			} else {
				Favorite.create({ user: req.user._id, campsites: req.body })
					.then((favorites) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favorites);
					})
					.catch((err) => next(err));
			}
		});
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /favorites');
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorite.findOne({ user: req.user._id })
			.then((favorites) => {
				if(favorites) {
					favorites.remove();
				}
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(favorites);
			})
			.catch((err) => next(err));
	});

favoriteRouter
	.route('/:campsiteId')
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end(
			`GET operation not supported on /favorites/${req.params.campsiteId}`
		);
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		const campsiteId = req.params.campsiteId;
		Favorite.findOne({ user: req.user._id }).then((favorites) => {
			if (favorites) {
					if (!favorites.campsites.includes(campsiteId)) {
						favorites.campsites.push(campsiteId);
						favorites.save().then((favorites) => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(favorites);
						});
					} else {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'text/plain');
						res.send("That campsite is already on the list of favorites!");
					}
			} else {
				Favorite.create({ user: req.user._id, campsites: [campsiteId] })
					.then((favorites) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favorites);
					})
					.catch((err) => next(err));
			}
		});
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end(
			`PUT operation not supported on /favorites/${req.params.campsiteId}`
		);
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		const campsiteId = req.params.campsiteId;
		Favorite.findOne({ user:req.user._id })
		.then((favorites) => {
			if (favorites) {
				if (favorites.campsites.includes(campsiteId)) {
					favorites.campsites.splice(favorites.campsites.indexOf(campsiteId),1);
					favorites.save().then((favorites) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favorites);
					});
				} else {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'text/plain');
					res.json(favorites);
				}
			}	
	});
})


module.exports = favoriteRouter;

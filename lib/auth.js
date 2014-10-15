var passport	= require("passport"),
	nconf		= require("nconf"),
	errorLogger	= require("edm-errorlogger");

/**
* if config.authCallback is a function, then it will be used as the callback of the localStrategy.
* if it is an object, then it is considered to be a mongoose model object.
*  - this model has to have the following fields:
*    - email
*    - password
*  + the schema behind the model should have a comparePasswords method
*/
module.exports = function(router, config) {
	if (typeof config !== "object") {
		throw "config should be an object!"
	}

	if (typeof config.pages !== "object") {
		throw "config.pagePaths should be an object!";
	}


	var loginPath = "./public/login.html";
	var loggedInIndex = "./user/index.html";
	var loggedOutIndex = null;

	if (typeof config.pages.login === "string") {
		loginPath = config.pages.login;
	}

	if (typeof config.pages.loggedIn === "string") {
		loggedInIndex = config.pages.loggedInIndex;
	}

	if (typeof config.pages.loggedOut === "string") {
		loggedOutIndex = config.pages.loggedOut;
	}



	function serveLogin(req, res) {
		res.sendfile(loginPath);
	}

	function serveIndex(req, res) {
		if (req.isAuthenticated()) {
			if (config.adminServer === true) {
				ensureAdmin(req, res, function() {
					res.sendfile(loggedInIndex);
				});
			} else {
				res.sendfile(loggedInIndex);
			}
		} else {
			if (loggedOutIndex === null) {
				res.redirect("/login");
			} else {
				res.sendfile(loggedOutIndex);
			}
		}
	}



	app.get("/", serveIndex);

	router.get("/login/", forwardToLogin);
	router.get("/login", serverLogin);
	router.post("/login", login);
	router.get("/logout", pass.ensureAuthenticated, logout);


	var localStrategyCallback = function(username, password, done) {
		done(username);
	};

	if (typeof config.authCallback === "funciton") {
		localStrategyCallback = config.authCallback;
	} else if (typeof config.authModel === "object") {
		userModel = config.authModel;
		localStrategyCallback = function(username, password, done) {
			userModel.findOne({username: username}, function(err, user) {
				if (err) {
					errorLogger.logError({
						statusCode: errorLogger.errorCodes.MONGO_DB_GENERAL_ERROR,
						statusText: "Error in MongoDb connection: " + err
					});
				
					return done(null, false, {
						message: errorLogger.errorCodes.MONGO_DB_GENERAL_ERROR
					});
				}

				if (!user) {
					return done(null, false, {
						message: errorLogger.errorCodes.LOGIN_USER_DOES_NOT_EXISTS
					});
				}

				if (user.active === false) {
					return done(null, false, {
						message: errorLogger.errorCodes.LOGIN_USER_DOES_NOT_COMFIRMED
					});
				}


				user.comparePassword(password, function(err, isMatch) {
					if (err) {
						errorLogger.logError({
							statusCode: errorLogger.errorCodes.MONGO_DB_GENERAL_ERROR,
							statusText: "Error in MongoDb connection when compare: " + err
						});
					
						return done(null, false, {
							message: errorLogger.errorCodes.MONGO_DB_GENERAL_ERROR
						});
					}
					
					if(isMatch) {
						return done(null, user);
					}
					
					return done(null, false, {
						message: errorLogger.errorCodes.LOGIN_WRONG_PASSWORD
					});
				});
			});
		};
	}

	passport.use(new LocalStrategy(localStrategyCallback));
};

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	res.send(403);
}

function ensureAdmin(req, res, next) {
	if(req.user && req.user.admin === true) {
		return next();
	}
	
	res.send(403);
}

function forwardToLogin(req, res) {
	res.redirect("/login");
}

function login(req, res, next) {
	passport.authenticate("local", function(err, user, info) {
		if (err) {
			res.json({message:info.message});
			return next(err);
		}

		if (!user) {
			res.json({message:info.message});
			return;
		}

		req.logIn(user, function(err) {
			if (err) {
				return next(err);
			}

			return res.redirect("/");
		});
	})(req, res, next);
}

function logout(req, res) {
	req.session.destroy();
	res.redirect("/");
}


exports.ensureAuthenticated = ensureAuthenticated;
exports.ensureAdmin = ensureAdmin;

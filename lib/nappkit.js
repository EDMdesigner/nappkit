var readConfig			= require("./readConfig"),
	createApp			= require("./createApp"),
	authRoutes			= require("./auth"),
	regRoutes			= require("./registration"),
	sendGridEmailer		= require("./sendGridEmailer"),
	sendFileIfExists	= require("./sendFileIfExists");

module.exports = {
	readConfig:			readConfig,
	createApp:			createApp,
	auth: 				authRoutes,
	registration:		regRoutes,
	sendGridEmailer:	sendGridEmailer,
	sendFileIfExists:	sendFileIfExists
};
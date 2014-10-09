var nconf			= require("nconf"),
	sendgrid		= require("sendgrid")(nconf.get("sendgrid:user", nconf.get("sendgrid:pass")),
	errorLogger		= require("edm-errorlogger");

module.exports = function() {
	return {
		sendEmail: sendEmail
	};
};


var CALLBACK_ERROR = "Wrong callback parameter given to SendgridEmailer.send.";
function sendEmail(sendVO, callBack){
	sendgrid.send(sendVO,function(err, json) {
		if(err) {
			errorLogger.logError({
				statusCode: errorLogger.errorCodes.SENDGRID_ERROR,
				statusText: "Error in @sendGridEmailer.sendMail: " + err,
				headers: req.headers,
				user: req.user._id
			});
		}
	
		if(typeof callBack === "function") {
			callBack(err,json);
		} else {
			throw(new Error(CALLBACK_ERROR));
		}
	});
}

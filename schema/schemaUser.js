const mongoose = require("mongoose");
const passwordHash = require("password-hash");
const jwt = require('jsonwebtoken');
const config = require("../config/config");
const Schema = mongoose.Schema;

let userSchema = new Schema({

		isAdmin: {
			type: Boolean,
			default: false
		},

		isModo: {
			type: Boolean,
			default: false
		},

		isValidate: {
			type: Boolean,
			default: false
		},

		firstname: {
			type: String,
			required: true
		},

		lastname: {
			type: String,
			required: true
		},

		idEntreprise: {
			type: Number,
			required: true,
		},

		waitingEntreprise: {
			type: Number,
			default: 0
		},

		validEmail: {
			type: Boolean,
			default: false
		},

		email: {
			type: String,
			lowercase: true,
			trim: true,
			unique: true,
			required: true
		},

		forgotPassword: {
			type: Number,
			default: 0
		},

		password: {
			type: String,
			required: true
		},

		weeklyMail: {
			type: Boolean,
			required: true
		},

		monthlyMail: {
			type: Boolean,
			required: true
		},

		cgu: {
			type: Boolean,
			required: true
		},

		// contacts: [{
		// 	firstname: {
		// 		type: String
		// 	},
		// 	lastname: {
		// 		type: String
		// 	},
		// 	email: {
		// 		type: String,
		// 		lowercase: true,
		// 		trim: true
		// 	},
		// 	phone: {
		// 		type: String
		// 	}
		// }],

		answerThisWeek: {
			type: Boolean,
			default: false
		},

		monthlyData: {
			divider: {
				type: Number,
				default: 0
			},
			dividerGroup1: {
				type: Number,
				default: 0
			},
			dividerGroup2: {
				type: Number,
				default: 0
			},
			dividerGroup3: {
				type: Number,
				default: 0
			},
			general: {
				type: Number,
				default: 0
			},
			group1: {
				type: Number,
				default: 0
			},
			group2: {
				type: Number,
				default: 0
			},
			group3: {
				type: Number,
				default: 0
			}
		},

		healthData: {
			general: {
				type: Number,
				default: 0
			},
			group1: {
				type: Number,
				default: 0
			},
			group2: {
				type: Number,
				default: 0
			},
			group3: {
				type: Number,
				default: 0
			},
			// taux: {
			//   type: Number
			// }
		},

		chart: {
			month: [],
			general: [],
			group1: [],
			group2: [],
			group3: []
		},

		archives: [{
			date: {
				type: String
			},
			general: {
				type: Number
			},
			group1: {
				type: Number
			},
			group2: {
				type: Number
			},
			group3: {
				type: Number
			}
		}],
	},

	{ timestamps: { createdAt: "created_at" } }
);

userSchema.methods = {
	authenticate: function(password) {
		return passwordHash.verify(password, this.password);
	},
	getUserToken: function() {
		const payload = {id: this._id};
		return jwt.sign(payload, config.secret);
	},
	getRefreshToken: function () {
		const payload = {id: this._id};
		return jwt.sign(payload, config.refreshSecret);
	}
};

module.exports = mongoose.model("User", userSchema);

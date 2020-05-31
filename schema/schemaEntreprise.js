const mongoose = require("mongoose");
const jwt = require("jwt-simple");
const config = require("../config/config");
const Schema = mongoose.Schema;

let entrepriseSchema = new Schema({
		_id: Number,

		name: {
			type: String,
			required: true
		},

		employeesToValidate: [{
			email: {
				type: String
			},
			firstname: {
				type: String
			},
			lastname: {
				type: String
			}
		}],

		validatedEmployees: [{
			uid: {
				type: String
			},
			email: {
				type: String
			},
			firstname: {
				type: String
			},
			lastname: {
				type: String
			},
			isAdmin: {
				type: Boolean
			},
			isModo: {
				type: Boolean
			}
		}],

		firstWeek: {
			type: Boolean,
			default: true
		},

		actualWeek: {
			type: Number,
			default: 1
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

		contacts: [{
			firstname: {
				type: String
			},
			lastname: {
				type: String
			},
			email: {
				type: String,
				lowercase: true,
				trim: true
			},
			phone: {
				type: String
			}
		}]
	},

	{ timestamps: { createdAt: "created_at" } }
);

module.exports = mongoose.model("Entreprise", entrepriseSchema);

//Définition des modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = process.env.PORT;

//On définit notre objet express
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.listen(PORT, 'localhost', function () {
    console.log("Server is running on Port: " + PORT);
});

// Pour afficher les logs sur pm2
let morgan = require('morgan');
app.use(morgan(":remote-addr - :remote-user [:date[clf]] \":method :url HTTP/:http-version\" :status :res[content-length]\n"));

//Connexion à la base de donnée
mongoose
    .connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("Connected to mongoDB");
    })
    .catch((e) => {
        console.log("Error while DB connecting");
        console.log(e);
    });

const security = require('./config/security');

// Définition du routeur
const appRoutes = express.Router();
app.use('/', appRoutes);

const signup = require('./controllers/users/auth/signup');
const login = require('./controllers/users/auth/login');
const logout = require('./controllers/users/auth/logout');
appRoutes.route('/signup').post(signup.signup);
appRoutes.route('/login').post(login.login);
appRoutes.route('/logout').post(security.checkAuth, logout.logout);

const forgotPassword = require('./controllers/users/auth/forgotPassword');
appRoutes.route('/forgotpassword').post(forgotPassword.forgotPassword);
appRoutes.route('/checkcoderesetpassword').post(forgotPassword.checkCodeResetPassword);
appRoutes.route('/resetpassword').post(forgotPassword.resetPassword);

const getInfos = require('./controllers/getInfos');
const getForm = require('./controllers/form/get/getForm');
const validEmail = require('./controllers/users/auth/validEmail');
appRoutes.route('/getinfos').get(security.checkAuth, getInfos.getInfos);
appRoutes.route('/getform').get(security.checkAuth, getForm.getform);
appRoutes.route('/validemail').post(security.checkAuth, validEmail.validEmail);

const waitingEntreprise = require('./controllers/entreprises/get/waitingEntreprise');
const changeID = require('./controllers/users/auth/changeID');
const changeRgpd = require('./controllers/users/auth/changeRgpd');
appRoutes.route('/waitingentreprise').get(security.checkAuth, waitingEntreprise.waitingEntreprise);
appRoutes.route('/changeentreprise').post(security.checkAuth, changeID.changeEntreprise);
appRoutes.route('/changeemail').post(security.checkAuth, changeID.changeEmail);
appRoutes.route('/changepassword').post(security.checkAuth, changeID.changePassword);
appRoutes.route('/changergpd').post(security.checkAuth, changeRgpd.changeRgpd);

const changeRole = require('./controllers/users/admin/changeRole');
appRoutes.route('/user/makeadmin').post(security.checkAuth, changeRole.makeAdmin);
appRoutes.route('/user/makemodo').post(security.checkAuth, changeRole.makeModo);
appRoutes.route('/user/makeuser').post(security.checkAuth, changeRole.makeUser);

const validation = require('./controllers/users/admin/validation');
appRoutes.route('/admin/validemployee').post(security.checkAuth, validation.validEmployee);
appRoutes.route('/admin/deletevalidatedemployee').post(security.checkAuth, validation.deleteValidatedEmployee);
appRoutes.route('/admin/deleteemployeetovalidate').post(security.checkAuth, validation.deleteToValidateEmployee);

// ---------------------------------------------------------------------------------------------- //
// Définition du routeur entreprise
const entrepriseRoutes = express.Router();
app.use('/entreprise', entrepriseRoutes);

const newEntreprise = require('./controllers/entreprises/post/newEntreprise');
entrepriseRoutes.route('/new').post(newEntreprise.newEntreprise);
entrepriseRoutes.route('/sendmail').post(newEntreprise.sendEntrepriseMail);

// ---------------------------------------------------------------------------------------------- //
// Définition du routeur formulaire
const formRoutes = express.Router();
app.use('/form', formRoutes);

const postData = require('./controllers/form/post/postData');
formRoutes.route('/postdata').post(security.checkAuth, postData.postData);


// Définition du routeur Admin
const adminSecurity = require('./config/adminSecurity');
const adminRoutes = express.Router();
app.use('/api', adminRoutes);

const changeWeek = require('./controllers/admin/changeWeek');
adminRoutes.route('/changeweek').get(adminSecurity.adminSecurity, changeWeek.changeWeek);

// Routeur de test
const testRoutes = express.Router();
app.use('/test', testRoutes);

const getTokenList = require('./controllers/tests/tokenList');
testRoutes.route('/tokenlist').get(getTokenList.getTokenList);

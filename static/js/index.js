"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var apee_router_1 = require("apee-router");
var home_1 = require("./route/home");
var login_1 = require("./route/login");
var user_1 = require("./route/user");
var add_1 = require("./route/add");
var list_1 = require("./route/list");
var template_1 = require("./template");
exports.router = new apee_router_1.Router();
exports.router.set(['home', 'add', 'list', 'tag', 'user', 'login']);
exports.router.set('home', home_1.home);
exports.router.set('login', login_1.login);
exports.router.set('user', user_1.user);
exports.router.set('add', add_1.add);
exports.router.set('list', list_1.list);
(0, login_1.checkLogin)();
(0, template_1.loadTemplate)(exports.router);
exports.router.start();

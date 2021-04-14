const express = require("express");
const homeController = require("./../controllers/homeController");
const chatFacebookController = require("./../controllers/chatFacebookController");

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", homeController.getHomepage);
    router.post("/webhook", chatFacebookController.postWebHook);
    router.get("/webhook", chatFacebookController.getWebHook);
    return app.use("/", router);
};
module.exports = initWebRoutes;
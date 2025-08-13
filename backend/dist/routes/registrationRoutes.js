"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registrationController_1 = require("../controllers/registrationController");
const router = (0, express_1.Router)();
router.post('/register', registrationController_1.register);
router.get('/udyam-fields', registrationController_1.getUdyamFields);
router.post('/udyam-fields/refresh', registrationController_1.refreshUdyamFields);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// TODO: Implementar com SQLite
router.get('/', async (req, res) => {
    res.json({ attendances: [] });
});
exports.default = router;

const express = require('express')
const {
  getSessions,
  createSession,
} = require('../controller/sessionController')

const router = express.Router()

router.get('/', getSessions)

router.post('/', createSession)

module.exports = router

'use strict'

const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')
const config = require('./env')
const mongoose = require('mongoose')

const passport = require('passport')
const facebookStatregy = require('./strategies/facebook')
const googleStatregy = require('./strategies/google')
const passportStatregy = require('./strategies/passport')
const passportConfig = require('./passport')

const routes = require('../routes')

module.exports.initPassport = function initPassport(app) {
  app.use(
    session({
      secret: 'b33d00',
      resave: false,
      saveUninitialized: false,
    })
  )
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use('facebook', facebookStatregy)
  passport.use('google', googleStatregy)
  passport.use('passport-local', passportStatregy)
  passport.serializeUser(passportConfig.serializeUser)
  passport.deserializeUser(passportConfig.deserializeUser)
}

module.exports.initRoutes = function initRoutes(app) {
  app.use('/api', routes)
}

module.exports.initDB = function initDB() {
  mongoose.Promise = global.Promise
  mongoose.connect(config.mongoURL, {
    socketTimeoutMS: 0,
    keepAlive: true,
    reconnectTries: 30,
    useMongoClient: true,
  })
  mongoose.connection.on('error', err => {
    console.error(`Unable to connect to database: ${config.mongoURL}`)
    console.error('Por favor verificar que Mongodb esta instalado y corriendo!')
    throw err
  })
}

module.exports.initMiddlewares = function initMiddlewares(app) {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
}

module.exports.initViewsEngine = function initViewsEngine(app) {
  app.set('view engine', 'ejs')
  app.set('views', './server/views')
  app.use(express.static('./server/public'))
}

module.exports.init = () => {
  const app = express()
  this.initMiddlewares(app)
  this.initDB()
  this.initPassport(app)
  this.initRoutes(app)
  this.initViewsEngine(app)
  app
    .listen(config.port, err => {
      console.log('**********************')
      console.log('beedoo-server online')
      console.log('**********************')
    })
    .on('error', err => {
      console.error(err)
    })
  return app
}

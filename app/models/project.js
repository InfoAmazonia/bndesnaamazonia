/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , Schema = mongoose.Schema
  , Financing = mongoose.model('Financing')  
  , _ = require('underscore')
  , allStates = ["Acre","Alagoas","Amapá","Amazonas","Bahia","Ceará","Distrito Federal","Espírito Santo","Goiás","Maranhão","Mato Grosso","Mato Grosso do Sul","Minas Gerais","Pará","Paraíba","Paraná","Pernambuco","Piauí","Rio de Janeiro","Rio Grande do Norte","Rio Grande do Sul","Rondônia","Roraima","Santa Catarina","São Paulo","Sergipe","Tocantins"]


/**
 * Project Schema
 */

var ProjectSchema = new Schema({
  title: {type : String, default : '', trim : true},
  description: {type : String, default : '', trim : true},
  financings: [{type : Schema.ObjectId, ref : 'Financing'}],
  financingTotal: {type: Number, default: 0},
  places: {
    states: [{type:String, enum: allStates}]
  },
  createdAt  : {type : Date, default : Date.now}
})

/**
 * Validations
 */

ProjectSchema.path('title').validate(function (title) {
  return (title.length > 10 && title.length <= 80) 
}, 'O título do projeto deve ter entre 10 e 80 caracteres')

ProjectSchema.path('description').validate(function (description) {
  return (description.length > 10 && description.length <= 500) 
}, 'A descrição do projeto deve ter entre 10 e 500 caracteres')

ProjectSchema.path('places.states').validate(function (states) {
  return (states.length > 0) 
}, 'Selecione ao menos 1 estado.')

/**
 * Methods
 */

ProjectSchema.methods = {

  updateFinancing: function (done) {
    var self = this
    
    Financing
      .find({'project': this._id})
      .exec(function(err,financings){
        self.financings = financings
        self.financingTotal = 0
        _.each(financings,function(financing){
          self.financingTotal = self.financingTotal + financing.amount
        })
        self.save(done)
      })
  }

}

/**
 * Statics
 */

ProjectSchema.statics = {


  load: function (id, done) {
    this
      .findOne({ _id : id })
      .populate('financings')
      .exec(done)
  },

  list: function (options, cb) {
    var criteria = options.criteria || {}

    this.find(criteria)
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb)
  }

}


mongoose.model('Project', ProjectSchema)
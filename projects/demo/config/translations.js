/**
 * @description :: Some custom translation keys for your project
 */

function ThisModule () {
  const self = this
  self.disabled = false // Enable /disable controller
  self.identity = 'demo-translations' // Unique controller id used in routes, policies and followups
  self.version = '1.0' // Version number of service
  self.created = '2015-07-14T12:00:00' // Creation date of controller
  self.modified = '2020-03-16T15:00:00' // Last modified date of controller
  self.group = 'demo' // Group this service to a origin

  self.translations = {
    SomethingHappend: {
      de: 'Ups, irgendwas ist schief gelaufen',
      en: 'Ups something strange happend'
    },
    NothingToRemove: {
      de: 'Id existiert nicht und konnte daher nicht gelöscht werden',
      en: 'Id does not exists so there is nothing to delete'
    }
  }

  return self
}

module.exports = new ThisModule()

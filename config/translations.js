module.exports = {

  /* List of translations.
     Available in all controllers using:
     req.miajs.translator('system', 'ExternalDataRequestError')

     Allowed Syntax:

     key: {
     language1: {
     region1: value, //Valid for key with language1 and region1
     region2: value, //Valid for key with language1 and region2
     }
     language2: value   //Valid for all regions with language 2 and key
     }

     Example:
     simple:{
     de: 'Auf Wiedersehen',
     en: 'Bye bye'
     },
     withRegionalSetting: {
     de: {
     de: 'Auf Wiedersehen',
     at: 'Baba'
     },
     en: 'Bye Bye'
     },
     withReplacementsInValue: {
     de: 'Heute ist ein [0] Tag und der Himmel ist [1]' // Placeholders will be replaced with given arguments list
     }
     */

  Gone: {
    de: 'Diese Ressource gibt es nicht mehr oder hat nie gegeben. Versuche es mit einer anderen.',
    en: 'This resource is gone or never was there. Try another one.'
  },
  ExternalDataRequestError: {
    de: 'Unerwartetes Datenformat von externer API erhalten',
    en: 'Unexpected data structure received from external API'
  },
  InternalServerError: {
    de: 'Oops - irgendwas ist schief gelaufen',
    en: 'Oops - I\'m sorry but something went wrong'
  },
  BadRequest: {
    de: 'Irgendwas stimmt nicht mit der Anfrage',
    en: 'Something is not ok with your request'
  },
  Forbidden: {
    de: 'Du bist nicht berechtigt diesen Service zu verwenden',
    en: 'You are not allowed to access this service'
  },
  NotFound: {
    de: 'Nach was auch immer du suchst, hier ist es leider nicht',
    en: 'Whatever you are looking for it is not here'
  },
  RateLimitExceeded: {
    de: 'Zugriffslimit erreicht',
    en: 'Rate limit exceeded'
  }

}

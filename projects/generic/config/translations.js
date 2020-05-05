/**
 * Products
 * @module      :: Controller
 * @description :: List of available preset products
 */

function ThisModule () {
  var self = this
  self.disabled = false // Enable /disable controller
  self.identity = 'generic-translations' // Unique controller id used in routes, policies and followups
  self.version = '1.0' // Version number of service
  self.created = '2015-01-17T11:00:00' // Creation date of controller
  self.modified = '2015-01-17T11:00:00' // Last modified date of controller
  self.group = 'generic' // Group this service to a origin

  self.translations = {
    SessionInvalidGroup: {
      de: 'Der Zugriff auf diesen Service ist auf Grund von Session Restriktionen nicht gestattet',
      en: 'Session is not allowed to access this service due to group permissions'
    },
    NoIPDetermined: {
      de: 'Zugriff verweigert. Ihre IP Adresse kann nicht ermittelt werden',
      en: 'Access blocked. Can not determine your IP address'
    },
    IPNotAllowed: {
      de: 'Zugriff auf diesen Service für diese IP Adresse verweigert',
      en: 'IP address is not allowed to access this service'
    },
    TemporaryDisabled: {
      de: 'Der Zugriff ist für dieses Device vorübergehend deaktiviert. Zugriff verweigert',
      en: 'Your device is temporary disabled and not allowed to use this service'
    },
    SessionTokenEmpty: {
      de: 'Sessiontoken fehlt. Bitte setzen Sie das Feld session im Header mit einem gültigen Sessiontoken',
      en: 'Session token empty. Please submit session token in header field session'
    },
    SessionTokenNotValid: {
      de: 'Sessiontoken ist ungültig. Bitte setzen Sie das Feld session im Header mit einem gültigen Sessiontoken',
      en: 'Your session token is not valid'
    },
    ExternalDataRequestError: {
      de: 'Unerwartetes Datenformat von externer API erhalten',
      en: 'Unexpected data structure received from external API'
    },
    AccessKeyIsEmpty: {
      de: 'Accesskey fehlt. Bitte setzen Sie das Feld key im Header mit einem gültigen Accesskey',
      en: 'Your access key is empty. Please submit a valid access key in header field key'
    },
    DeviceIdInvalid: {
      de: 'Id fehlt oder ist wengiger als 32 Zeichen lang.',
      en: 'Your id is empty or less than 32 characters.'
    },
    AccessKeyInvalid: {
      de: 'Accesskey ist ungültig. Bitte setzen Sie einen gültigen Accesskey im Header im Feld key',
      en: 'Your access key is invalid. Please submit a valid access key in header field key'
    },
    AccessKeyInvalidGroup: {
      de: 'Accesskey ist gültig aber der Zugriff auf diesen Service ist damit nicht erlaubt',
      en: 'Your access key is valid but not allowed for this service'
    },
    SessionMismatch: {
      de: 'Änderungen an den Benutzerdaten sind mit dieser Session-Id nicht erlaubt',
      en: 'You are not allowed to modify this data with the given session id'
    },
    BodyDataIsEmpty: {
      de: 'Es wurden keinen Änderungen vorgenommen, da keine JSON Daten im Body gefunden werden konnten',
      en: 'Missing JSON data in body - nothing to update'
    },
    DeviceIdDoesNotExist: {
      de: 'Device-Id existiert nicht',
      en: 'DeviceId does not exist'
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
    InternalServerError: {
      de: 'Oops - irgendwas ist schief gelaufen',
      en: 'Oops - I\'m sorry but something went wrong'
    },
    UnknownServiceGroupOrVersion: {
      de: 'Serviceverzeichnis kann nicht angezeigt werden',
      en: 'Group or version id not found to create services list'
    },
    DeviceIdInvalidOrDoesNotExists: {
      de: 'Die Device-Id ist nicht gültig oder abgelaufen auf Grund längerer Inaktivität',
      en: 'Given device id is not valid or expired due to long inactivity'
    },
    KeyInvalid: {
      de: 'Key ungültig, Zugriff verweitert',
      en: 'Key invalid, access denied'
    },
    SignatureMethodInvalid: {
      de: 'Signatur Methode ungültig, Zugriff verweitert',
      en: 'Signature method invalid, access denied'
    },
    KeyInvalidForGroup: {
      de: 'Key ist nicht gültig für diesen Service',
      en: 'Key invalid for this service'
    },
    KeyExpired: {
      de: 'Key ist abgelaufen',
      en: 'Key is expired'
    },

    // User
    InvalidCredentials: {
      de: 'Falsches Login oder Kennwort',
      en: 'Invalid user credentials'
    },
    MaxDeviceNumberExceeded: {
      de: 'Maximale Anzahl Geräte überschritten. Bitte loggen Sie sich von einem anderen Gerät aus.',
      en: 'Maximum device number is exceeded. Please log off on one or more devices.'
    },
    LoginInvalid: {
      de: 'Login ungültig.',
      en: 'Login is invalid.'
    },
    NoUserIsLoggedIn: {
      de: 'Sie müssen sich zunächst einloggen.',
      en: 'You should login first.'
    },
    WrongOrMissingRequestParameter: {
      de: 'Request Parameter fehlt oder ist fehlerhaft',
      en: 'Missing request parameter'
    },
    NotModified: {
      de: 'Der Ressourcenzustand hat sich nicht geändert',
      en: 'Not Modified'
    },
    ETagPreconditionFailed: {
      de: 'If-Match header enthält kein gültiges ETag',
      en: 'If-Match header field is empty or contains expired ETag'
    },
    ThirdPartyLoginIsNotAcceptable: {
      de: 'Dieses Dritt-Anbieter Konto kann für das Login nicht verwendet werden',
      en: 'Third party account is not acceptable'
    },
    EmailAddressIsNotValidated: {
      de: 'Die Email adresse ist noch nicht validiert. Eine Validierungsemail wurde Ihnen zugeschickt. Bitte versuchen Sie es noch einmal nachdem die Email Adresse validiert wurde.',
      en: 'Your provided e-mail address is not yet validated. Validation email has been sent to you. Please try again after validating your e-mail.'
    },
    InvalidEmailAddress: {
      de: 'Email adresse ist ungültig',
      en: 'Invalid email address'
    },
    InvalidPasswordResetToken: {
      de: 'Passwort Resettoken ist nicht gültig',
      en: 'Invalid password reset token'
    },
    ServiceIsDeprecated: {
      de: 'Dieser Service is markiert als deprecated und der Service wird eingestellt werden. Bitte verwenden Sie diesen Service nicht mehr.',
      en: 'This service is deprecated and will expire. Please do not use this service for new development'
    },
    RateLimitExceededForKey: {
      de: 'Zugriffslimit erreicht für diesen Key',
      en: 'Rate limit exceeded for this key'
    },
    LoginAlreadyExists: {
      de: 'Benutzer existiert bereits',
      en: 'User already exists'
    }
  }

  return self
}

module.exports = new ThisModule()

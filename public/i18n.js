// Shared dictionary for the browser and for Node (no dependencies).
(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.LumenI18n = api;
})(function () {
  const LANGS = ['de', 'en', 'it', 'fr', 'es'];
  const OUT_DE = { de: 'Deutsch', en: 'Englisch', it: 'Italienisch', fr: 'Französisch', es: 'Spanisch' };
  const OUT_EN = { de: 'German', en: 'English', it: 'Italian', fr: 'French', es: 'Spanish' };
  const LABELS = { de: 'Deutsch', en: 'English', it: 'Italiano', fr: 'Français', es: 'Español' };

  function rows(table) {
    const out = { de: {}, en: {}, it: {}, fr: {}, es: {} };
    for (const key of Object.keys(table)) {
      const vals = table[key];
      if (!vals || vals.length !== 5) throw new Error('i18n row ' + key);
      LANGS.forEach((l, i) => { out[l][key] = vals[i]; });
    }
    return out;
  }

  const STR = rows({
    'mail.subject': ['Dein Anmeldelink für Lumen', 'Your Lumen sign-in link', 'Il tuo link di accesso a Lumen', 'Votre lien de connexion Lumen', 'Tu enlace de acceso a Lumen'],
    'mail.hello': ['Hallo,', 'Hello,', 'Ciao,', 'Bonjour,', 'Hola,'],
    'mail.body': [
      'über diesen Link meldest du dich bei Lumen an. Er ist 15 Minuten gültig und nur einmal nutzbar:',
      'use this link to sign in to Lumen. It is valid for 15 minutes and can be used once:',
      'con questo link accedi a Lumen. È valido 15 minuti e si può usare una sola volta:',
      'ce lien te connecte à Lumen. Il est valable 15 minutes et ne sert qu’une fois :',
      'con este enlace entras en Lumen. Vale 15 minutos y solo se puede usar una vez:',
    ],
    'mail.cta': ['Jetzt anmelden', 'Sign in now', 'Accedi ora', 'Se connecter', 'Entrar ahora'],
    'mail.ignore': [
      'Wenn du das nicht warst, ignoriere diese E-Mail.',
      'If this was not you, ignore this email.',
      'Se non sei stato tu, ignora questa email.',
      'Si ce n’était pas toi, ignore cet e-mail.',
      'Si no has sido tú, ignora este correo.',
    ],
    'err.email': [
      'Bitte eine gültige E-Mail-Adresse eingeben.',
      'Please enter a valid email address.',
      'Inserisci un indirizzo e-mail valido.',
      'Merci de saisir une adresse e-mail valide.',
      'Introduce un correo electrónico válido.',
    ],
    'err.magicIp': [
      'Zu viele Anmeldelinks von dieser Verbindung. Bitte warte einen Moment.',
      'Too many sign-in links from this connection. Please wait a moment.',
      'Troppi link di accesso da questa connessione. Attendi un momento.',
      'Trop de liens de connexion depuis cette connexion. Patiente un instant.',
      'Demasiados enlaces desde esta conexión. Espera un momento.',
    ],
    'err.magicEmail': [
      'Zu viele Anmeldelinks für diese Adresse. Bitte warte 15 Minuten.',
      'Too many sign-in links for this address. Please wait 15 minutes.',
      'Troppi link per questo indirizzo. Attendi 15 minuti.',
      'Trop de liens pour cette adresse. Attends 15 minutes.',
      'Demasiados enlaces para esta dirección. Espera 15 minutos.',
    ],
    'err.magicDown': [
      'Anmeldung per E-Mail ist gerade nicht verfügbar.',
      'Email sign-in is not available right now.',
      'L’accesso via e-mail non è disponibile in questo momento.',
      'La connexion par e-mail n’est pas disponible pour le moment.',
      'El acceso por correo no está disponible ahora mismo.',
    ],
    'err.magicSend': [
      'Die E-Mail konnte nicht gesendet werden. Bitte später erneut versuchen.',
      'The email could not be sent. Please try again later.',
      'Non è stato possibile inviare l’email. Riprova più tardi.',
      'L’e-mail n’a pas pu être envoyé. Réessaie plus tard.',
      'No se pudo enviar el correo. Inténtalo más tarde.',
    ],
    'err.linkTitle': ['Link ungültig', 'Link invalid', 'Link non valido', 'Lien invalide', 'Enlace no válido'],
    'err.linkBody': [
      'Dieser Anmeldelink ist abgelaufen oder ungültig. Bitte fordere einen neuen an. Er gilt 15 Minuten.',
      'This sign-in link has expired or is invalid. Please request a new one. It is valid for 15 minutes.',
      'Questo link è scaduto o non è valido. Richiedine uno nuovo. Vale 15 minuti.',
      'Ce lien a expiré ou n’est pas valable. Demande-en un nouveau. Il vaut 15 minutes.',
      'Este enlace ha caducado o no es válido. Pide uno nuevo. Vale 15 minutos.',
    ],
    'err.linkUsedTitle': ['Link schon verwendet', 'Link already used', 'Link già usato', 'Lien déjà utilisé', 'Enlace ya usado'],
    'err.linkUsedBody': [
      'Dieser Anmeldelink wurde bereits benutzt. Bitte fordere einen neuen an.',
      'This sign-in link was already used. Please request a new one.',
      'Questo link è già stato usato. Richiedine uno nuovo.',
      'Ce lien a déjà été utilisé. Demande-en un nouveau.',
      'Este enlace ya se ha usado. Pide uno nuevo.',
    ],
    'err.backLogin': ['Zur Anmeldung', 'Back to sign-in', 'Torna all’accesso', 'Retour à la connexion', 'Volver al acceso'],
    'err.code': ['Code ungültig', 'Invalid code', 'Codice non valido', 'Code invalide', 'Código no válido'],
    'err.tooMany': [
      'Zu viele Fehlversuche – bitte in 15 Minuten erneut versuchen',
      'Too many attempts — please try again in 15 minutes',
      'Troppi tentativi: riprova tra 15 minuti',
      'Trop de tentatives — réessaie dans 15 minutes',
      'Demasiados intentos: vuelve a probar en 15 minutos',
    ],
    'err.login': ['Bitte anmelden', 'Please sign in', 'Accedi', 'Merci de te connecter', 'Inicia sesión'],
    'err.loginEmail': ['Bitte mit E-Mail anmelden.', 'Please sign in with email.', 'Accedi con l’e-mail.', 'Connecte-toi avec ton e-mail.', 'Entra con tu correo.'],
    'err.consent': [
      'Bitte die AGB akzeptieren und dem sofortigen Beginn zustimmen.',
      'Please accept the terms and agree that the service starts immediately.',
      'Accetta le condizioni e il consenso all’inizio immediato.',
      'Accepte les conditions et l’accord pour un début immédiat.',
      'Acepta las condiciones y el inicio inmediato del servicio.',
    ],
    'err.proSoon': ['Pro bald verfügbar', 'Pro coming soon', 'Pro disponibile a breve', 'Pro bientôt disponible', 'Pro disponible pronto'],
    'err.alreadyPro': [
      'Du hast bereits Pro. Über „Abo verwalten“ kannst du es ändern.',
      'You already have Pro. Change it under Manage subscription.',
      'Hai già Pro. Puoi modificarlo in Gestisci abbonamento.',
      'Tu as déjà Pro. Modifie-le via Gérer l’abonnement.',
      'Ya tienes Pro. Puedes cambiarlo en Gestionar suscripción.',
    ],
    'err.price': ['Dieser Tarif ist nicht verfügbar.', 'This plan is not available.', 'Questo piano non è disponibile.', 'Cette offre n’est pas disponible.', 'Este plan no está disponible.'],
    'err.checkout': [
      'Der Kauf konnte nicht gestartet werden. Bitte später erneut versuchen.',
      'Checkout could not be started. Please try again later.',
      'Non è stato possibile avviare l’acquisto. Riprova più tardi.',
      'L’achat n’a pas pu démarrer. Réessaie plus tard.',
      'No se pudo iniciar la compra. Inténtalo más tarde.',
    ],
    'err.noSub': ['Noch kein Abo vorhanden.', 'No subscription yet.', 'Nessun abbonamento ancora.', 'Pas encore d’abonnement.', 'Aún no hay suscripción.'],
    'err.portalOpen': [
      'Die Abo-Verwaltung konnte nicht geöffnet werden.',
      'Subscription management could not be opened.',
      'Impossibile aprire la gestione dell’abbonamento.',
      'La gestion de l’abonnement n’a pas pu s’ouvrir.',
      'No se pudo abrir la gestión de la suscripción.',
    ],
    'err.noKey': ['OPENROUTER_API_KEY ist auf dem Server nicht gesetzt', 'OPENROUTER_API_KEY is not set on the server', 'OPENROUTER_API_KEY non è impostata sul server', 'OPENROUTER_API_KEY n’est pas définie sur le serveur', 'OPENROUTER_API_KEY no está configurada en el servidor'],
    'err.captions': ['Instagram-Texte sind Teil von Lumen Pro.', 'Instagram captions are part of Lumen Pro.', 'I testi per Instagram fanno parte di Lumen Pro.', 'Les légendes Instagram font partie de Lumen Pro.', 'Los textos de Instagram forman parte de Lumen Pro.'],
    'err.week': [
      'Dein Gratis-Kontingent ist aufgebraucht ({free} Analysen pro Woche). Mit Pro sind es {pro} Analysen pro Tag.',
      'Your free allowance is used up ({free} analyses per week). Pro includes {pro} analyses per day.',
      'Hai esaurito il contingente gratuito ({free} analisi a settimana). Con Pro sono {pro} analisi al giorno.',
      'Ton quota gratuit est épuisé ({free} analyses par semaine). Pro comprend {pro} analyses par jour.',
      'Has agotado el cupo gratuito ({free} análisis por semana). Con Pro son {pro} análisis al día.',
    ],
    'err.dayAnalyse': ['Tageslimit erreicht ({limit} Analysen pro Tag). Morgen geht’s weiter.', 'Daily limit reached ({limit} analyses per day). Continue tomorrow.', 'Limite giornaliero raggiunto ({limit} analisi al giorno). Si riprende domani.', 'Limite quotidien atteint ({limit} analyses par jour). Reprends demain.', 'Límite diario alcanzado ({limit} análisis al día). Sigue mañana.'],
    'err.dayText': ['Tageslimit erreicht ({limit} Texte pro Tag). Morgen geht’s weiter.', 'Daily limit reached ({limit} captions per day). Continue tomorrow.', 'Limite giornaliero raggiunto ({limit} testi al giorno). Si riprende domani.', 'Limite quotidien atteint ({limit} textes par jour). Reprends demain.', 'Límite diario alcanzado ({limit} textos al día). Sigue mañana.'],
    'err.ip': ['Tageslimit für diese Verbindung erreicht.', 'Daily limit for this connection reached.', 'Limite giornaliero per questa connessione raggiunto.', 'Limite quotidien pour cette connexion atteint.', 'Límite diario de esta conexión alcanzado.'],
    'err.budget': ['Das Tagesbudget der Testphase ist aufgebraucht. Bitte morgen erneut versuchen.', 'The daily test budget is used up. Please try again tomorrow.', 'Il budget giornaliero della fase di test è esaurito. Riprova domani.', 'Le budget quotidien de la phase de test est épuisé. Réessaie demain.', 'El presupuesto diario de la fase de prueba se ha agotado. Inténtalo mañana.'],
    'err.image': ['Bild fehlt oder hat ein ungültiges Format', 'Image is missing or has an invalid format', 'Immagine mancante o formato non valido', 'Image manquante ou format invalide', 'Falta la imagen o el formato no es válido'],
    'err.notFound': ['Nicht gefunden', 'Not found', 'Non trovato', 'Introuvable', 'No encontrado'],
    'err.internal': ['Interner Fehler', 'Internal error', 'Errore interno', 'Erreur interne', 'Error interno'],
    'err.badRequest': ['Ungültige Anfrage', 'Invalid request', 'Richiesta non valida', 'Requête invalide', 'Solicitud no válida'],
    'err.tooLarge': ['Anfrage zu groß', 'Request too large', 'Richiesta troppo grande', 'Requête trop volumineuse', 'Solicitud demasiado grande'],
    'err.timeout': ['Zeitüberschreitung', 'Timed out', 'Tempo scaduto', 'Délai dépassé', 'Tiempo agotado'],
    'err.empty': ['Leere Antwort', 'Empty response', 'Risposta vuota', 'Réponse vide', 'Respuesta vacía'],
    'err.json': ['Antwort war kein gültiges JSON', 'Response was not valid JSON', 'La risposta non era un JSON valido', 'La réponse n’était pas un JSON valide', 'La respuesta no era un JSON válido'],
    'err.incomplete': ['Unvollständige Bewertung', 'Incomplete review', 'Valutazione incompleta', 'Évaluation incomplète', 'Valoración incompleta'],
    'err.cut': ['Antwort abgeschnitten (Token-Limit)', 'Response cut off (token limit)', 'Risposta tagliata (limite di token)', 'Réponse coupée (limite de tokens)', 'Respuesta cortada (límite de tokens)'],
    'err.http401': ['API-Schlüssel ungültig oder abgelaufen (HTTP 401)', 'API key invalid or expired (HTTP 401)', 'Chiave API non valida o scaduta (HTTP 401)', 'Clé API invalide ou expirée (HTTP 401)', 'Clave API no válida o caducada (HTTP 401)'],
    'err.http402': ['OpenRouter-Guthaben aufgebraucht (HTTP 402)', 'OpenRouter credit used up (HTTP 402)', 'Credito OpenRouter esaurito (HTTP 402)', 'Crédit OpenRouter épuisé (HTTP 402)', 'Saldo de OpenRouter agotado (HTTP 402)'],
    'err.http429': ['Zu viele Anfragen (HTTP 429), bitte später erneut', 'Too many requests (HTTP 429), please try later', 'Troppe richieste (HTTP 429), riprova più tardi', 'Trop de requêtes (HTTP 429), réessaie plus tard', 'Demasiadas solicitudes (HTTP 429), inténtalo más tarde'],
    'meta.title': ['Lumen – KI-Fotoassistent', 'Lumen – AI photo assistant', 'Lumen – assistente fotografico IA', 'Lumen – assistant photo IA', 'Lumen – asistente de foto con IA'],
    'meta.desc': [
      'Drei KI-Modelle bewerten dein Foto – mit Fotolektionen, Bearbeitung und Social-Media-Texten.',
      'Three AI models review your photo — with lessons, edits and social captions.',
      'Tre modelli di IA valutano la tua foto, con lezioni, ritocco e testi social.',
      'Trois modèles d’IA jugent ta photo — leçons, retouche et légendes.',
      'Tres modelos de IA valoran tu foto, con lecciones, retoque y textos.',
    ],
    'login.badge': ['Anmelden', 'Sign in', 'Accedi', 'Connexion', 'Entrar'],
    'login.kicker': ['Konto ohne Passwort', 'Account without a password', 'Account senza password', 'Compte sans mot de passe', 'Cuenta sin contraseña'],
    'login.h1': ['Willkommen bei Lumen', 'Welcome to Lumen', 'Benvenuto in Lumen', 'Bienvenue sur Lumen', 'Te damos la bienvenida a Lumen'],
    'login.sub': [
      'Trag deine E-Mail ein. Wir schicken einen Anmeldelink, 15 Minuten gültig.',
      'Enter your email. We will send a sign-in link, valid for 15 minutes.',
      'Inserisci l’e-mail. Ti inviamo un link di accesso, valido 15 minuti.',
      'Saisis ton e-mail. Nous envoyons un lien valable 15 minutes.',
      'Escribe tu correo. Enviaremos un enlace válido 15 minutos.',
    ],
    'login.email': ['E-Mail', 'Email', 'E-mail', 'E-mail', 'Correo'],
    'login.ph': ['du@example.com', 'you@example.com', 'tu@example.com', 'toi@example.com', 'tu@example.com'],
    'login.send': ['Link senden', 'Send link', 'Invia link', 'Envoyer le lien', 'Enviar enlace'],
    'login.sending': ['Sende …', 'Sending …', 'Invio …', 'Envoi …', 'Enviando …'],
    'login.or': ['oder mit Einladungscode', 'or with an invite code', 'oppure con un codice invito', 'ou avec un code d’invitation', 'o con un código de invitación'],
    'login.code': ['Einladungscode', 'Invite code', 'Codice invito', 'Code d’invitation', 'Código de invitación'],
    'login.codePh': ['z. B. LUMEN-XXXX', 'e.g. LUMEN-XXXX', 'es. LUMEN-XXXX', 'p. ex. LUMEN-XXXX', 'p. ej. LUMEN-XXXX'],
    'login.redeem': ['Code einlösen', 'Redeem code', 'Riscatta il codice', 'Utiliser le code', 'Canjear código'],
    'login.checking': ['Prüfe …', 'Checking …', 'Verifica …', 'Vérification …', 'Comprobando …'],
    'login.note': [
      'Deine Fotos werden nur zur Analyse an KI-Anbieter übertragen und nicht gespeichert.',
      'Your photos are sent to AI providers only for analysis and are not stored.',
      'Le foto vengono inviate ai fornitori di IA solo per l’analisi e non sono memorizzate.',
      'Tes photos sont transmises aux fournisseurs d’IA seulement pour l’analyse et ne sont pas stockées.',
      'Tus fotos se envían a los proveedores de IA solo para el análisis y no se guardan.',
    ],
    'login.dev': [
      'Testmodus: Der Link steht in der Server-Konsole, es wurde keine E-Mail verschickt.',
      'Test mode: the link is in the server console, no email was sent.',
      'Modalità test: il link è nella console del server, non è stata inviata alcuna email.',
      'Mode test : le lien est dans la console du serveur, aucun e-mail n’a été envoyé.',
      'Modo de prueba: el enlace está en la consola del servidor, no se envió ningún correo.',
    ],
    'login.sent': [
      'Schau in dein Postfach. Der Link gilt 15 Minuten und kann einmal verwendet werden.',
      'Check your inbox. The link is valid for 15 minutes and can be used once.',
      'Controlla la posta. Il link vale 15 minuti e si usa una volta sola.',
      'Regarde ta boîte mail. Le lien vaut 15 minutes et ne sert qu’une fois.',
      'Revisa tu bandeja. El enlace vale 15 minutos y se usa una sola vez.',
    ],
    'legal.privacy': ['Datenschutz', 'Privacy', 'Privacy', 'Confidentialité', 'Privacidad'],
    'legal.imprint': ['Impressum', 'Legal notice', 'Note legali', 'Mentions légales', 'Aviso legal'],
    'legal.terms': ['AGB', 'Terms', 'Condizioni', 'CGU', 'Condiciones'],
    'legal.withdraw': ['Widerruf', 'Withdrawal', 'Recesso', 'Rétractation', 'Desistimiento'],
    'legal.account': ['Konto', 'Account', 'Account', 'Compte', 'Cuenta'],
    'legal.logout': ['Abmelden', 'Sign out', 'Esci', 'Se déconnecter', 'Salir'],
    'start.kicker': ['KI-Fotoassistent', 'AI photo assistant', 'Assistente fotografico IA', 'Assistant photo IA', 'Asistente de foto con IA'],
    'start.h1': ['Bessere Fotos.<br>Verstehen, warum.', 'Better photos.<br>Understand why.', 'Foto migliori.<br>Capire perché.', 'De meilleures photos.<br>Comprendre pourquoi.', 'Mejores fotos.<br>Entender por qué.'],
    'start.sub': [
      'Gratis mit Gemini starten. Pro vergleicht drei KIs – und jede Bewertung wird zur Fotolektion.',
      'Start free with Gemini. Pro compares three AIs — and every score becomes a photo lesson.',
      'Inizia gratis con Gemini. Pro confronta tre IA e ogni voto diventa una lezione.',
      'Commence gratuitement avec Gemini. Pro compare trois IA — chaque note devient une leçon.',
      'Empieza gratis con Gemini. Pro compara tres IA y cada nota se vuelve una lección.',
    ],
    'start.f1': ['Bewertung im Vergleich', 'Scores side by side', 'Valutazione a confronto', 'Notes comparées', 'Valoración comparada'],
    'start.f1s': ['Mit Pro: GPT, Gemini und Claude', 'With Pro: GPT, Gemini and Claude', 'Con Pro: GPT, Gemini e Claude', 'Avec Pro : GPT, Gemini et Claude', 'Con Pro: GPT, Gemini y Claude'],
    'start.f2': ['Lernen am eigenen Bild', 'Learn from your own photo', 'Imparare sulla tua foto', 'Apprendre sur ta photo', 'Aprender con tu foto'],
    'start.f2s': ['Grundlagen, Diagramme, Tipps und Quiz', 'Basics, diagrams, tips and a quiz', 'Basi, schemi, consigli e quiz', 'Bases, schémas, conseils et quiz', 'Bases, diagramas, consejos y un cuestionario'],
    'start.f3': ['Bearbeiten & teilen', 'Edit and share', 'Ritoccare e condividere', 'Retoucher et partager', 'Retocar y compartir'],
    'start.f3s': ['Vorher/Nachher und fertige Texte', 'Before/after and finished captions', 'Prima/dopo e testi pronti', 'Avant/après et légendes prêtes', 'Antes/después y textos listos'],
    'start.go': ['Loslegen', 'Get started', 'Inizia', 'Commencer', 'Empezar'],
    'upload.step': ['Schritt 1 von 3', 'Step 1 of 3', 'Passo 1 di 3', 'Étape 1 sur 3', 'Paso 1 de 3'],
    'upload.h2': ['Foto auswählen', 'Choose a photo', 'Scegli una foto', 'Choisir une photo', 'Elige una foto'],
    'upload.sub': [
      'JPG oder PNG aus deiner Galerie. Ohne Auswahl nutzen wir ein Beispielbild.',
      'JPG or PNG from your gallery. Without a choice we use a sample photo.',
      'JPG o PNG dalla galleria. Senza scelta usiamo una foto di esempio.',
      'JPG ou PNG de ta galerie. Sans choix, nous utilisons une photo d’exemple.',
      'JPG o PNG de tu galería. Si no eliges, usamos una foto de ejemplo.',
    ],
    'upload.drop': ['Tippen, um ein Foto zu wählen', 'Tap to choose a photo', 'Tocca per scegliere una foto', 'Touche pour choisir une photo', 'Toca para elegir una foto'],
    'upload.goal': ['Ziel der Analyse', 'Goal of the analysis', 'Obiettivo dell’analisi', 'But de l’analyse', 'Objetivo del análisis'],
    'goal.instagram': ['Instagram', 'Instagram', 'Instagram', 'Instagram', 'Instagram'],
    'goal.contest': ['Wettbewerb', 'Contest', 'Concorso', 'Concours', 'Concurso'],
    'goal.learn': ['Lernen', 'Learning', 'Imparare', 'Apprendre', 'Aprender'],
    'upload.analyse': ['Analysieren', 'Analyse', 'Analizza', 'Analyser', 'Analizar'],
    'srv.checking': ['Prüfe KI-Verbindung …', 'Checking the AI connection …', 'Controllo la connessione IA …', 'Vérification de la connexion IA …', 'Comprobando la conexión con la IA …'],
    'srv.offline': ['Offline geöffnet – Beispieldaten', 'Opened offline — sample data', 'Aperto offline — dati di esempio', 'Ouvert hors ligne — données d’exemple', 'Abierto sin conexión — datos de ejemplo'],
    'srv.ready': ['Echte KI bereit', 'Real AI ready', 'IA reale pronta', 'Vraie IA prête', 'IA real lista'],
    'srv.nokey': ['Server ohne API-Schlüssel – Beispieldaten', 'Server without an API key — sample data', 'Server senza chiave API — dati di esempio', 'Serveur sans clé API — données d’exemple', 'Servidor sin clave API — datos de ejemplo'],
    'srv.none': ['Kein Server – Beispieldaten', 'No server — sample data', 'Nessun server — dati di esempio', 'Pas de serveur — données d’exemple', 'Sin servidor — datos de ejemplo'],
    'srv.mock': ['TESTMODUS · ', 'TEST MODE · ', 'MODALITÀ TEST · ', 'MODE TEST · ', 'MODO PRUEBA · '],
    'usage.week': ['{used} von {limit} Analysen diese Woche', '{used} of {limit} analyses this week', '{used} di {limit} analisi questa settimana', '{used} sur {limit} analyses cette semaine', '{used} de {limit} análisis esta semana'],
    'usage.day': ['{used} von {limit} Analysen heute', '{used} of {limit} analyses today', '{used} di {limit} analisi oggi', '{used} sur {limit} analyses aujourd’hui', '{used} de {limit} análisis hoy'],
    'plan.free': ['Gratis', 'Free', 'Gratis', 'Gratuit', 'Gratis'],
    'plan.pro': ['Pro', 'Pro', 'Pro', 'Pro', 'Pro'],
    'plan.tester': ['Testzugang', 'Tester access', 'Accesso test', 'Accès test', 'Acceso de prueba'],
    'plan.open': ['Testphase', 'Trial', 'Fase di test', 'Phase de test', 'Fase de prueba'],
    'an.badgeDemo': ['Beispieldaten · keine echte KI', 'Sample data · not real AI', 'Dati di esempio · non è IA reale', 'Données d’exemple · pas une vraie IA', 'Datos de ejemplo · no es IA real'],
    'an.badgeMock': ['Testmodus · keine echte KI', 'Test mode · not real AI', 'Modalità test · non è IA reale', 'Mode test · pas une vraie IA', 'Modo de prueba · no es IA real'],
    'an.running': ['Analyse läuft', 'Analysis running', 'Analisi in corso', 'Analyse en cours', 'Análisis en curso'],
    'an.load3': ['Drei Modelle sehen sich dein Foto an', 'Three models are looking at your photo', 'Tre modelli guardano la tua foto', 'Trois modèles regardent ta photo', 'Tres modelos miran tu foto'],
    'an.load1': ['Gemini sieht sich dein Foto an', 'Gemini is looking at your photo', 'Gemini guarda la tua foto', 'Gemini regarde ta photo', 'Gemini mira tu foto'],
    'an.sub3': ['Das dauert meist 10–30 Sekunden.', 'This usually takes 10–30 seconds.', 'Di solito servono 10–30 secondi.', 'Cela prend en général 10 à 30 secondes.', 'Suele tardar de 10 a 30 segundos.'],
    'an.sub1': ['Das dauert meist ein paar Sekunden.', 'This usually takes a few seconds.', 'Di solito bastano pochi secondi.', 'Cela prend en général quelques secondes.', 'Suele tardar unos segundos.'],
    'an.overall': ['Gesamteindruck', 'Overall', 'Impressione generale', 'Impression générale', 'Impresión general'],
    'an.demoTitle': ['Stimmungsvoll, mit Potenzial', 'Atmospheric, with potential', 'Atmosferico, con potenziale', 'Plein d’ambiance, avec du potentiel', 'Con ambiente y potencial'],
    'an.demoSub': ['Durchschnitt aus 3 Modellen', 'Average of 3 models', 'Media di 3 modelli', 'Moyenne de 3 modèles', 'Media de 3 modelos'],
    'an.cat': ['Kategorie', 'Category', 'Categoria', 'Catégorie', 'Categoría'],
    'an.hint': ['Tippe auf eine Kategorie für die Lektion', 'Tap a category for the lesson', 'Tocca una categoria per la lezione', 'Touche une catégorie pour la leçon', 'Toca una categoría para la lección'],
    'an.upsell': ['GPT und Claude gibt es mit Pro', 'GPT and Claude come with Pro', 'GPT e Claude sono in Pro', 'GPT et Claude sont inclus dans Pro', 'GPT y Claude van con Pro'],
    'an.tips': ['Top-Tipps für dieses Foto', 'Top tips for this photo', 'Consigli principali per questa foto', 'Conseils clés pour cette photo', 'Consejos clave para esta foto'],
    'an.comments': ['Kommentare der Modelle', 'Comments from the models', 'Commenti dei modelli', 'Commentaires des modèles', 'Comentarios de los modelos'],
    'an.apply': ['Vorschläge anwenden', 'Apply suggestions', 'Applica i suggerimenti', 'Appliquer les suggestions', 'Aplicar sugerencias'],
    'an.geminiSub': ['Gemini · Gratis, ein Modell', 'Gemini · Free, one model', 'Gemini · Gratis, un modello', 'Gemini · Gratuit, un modèle', 'Gemini · Gratis, un modelo'],
    'an.avg': ['Durchschnitt aus {ok} von {all} Modellen', 'Average of {ok} of {all} models', 'Media di {ok} su {all} modelli', 'Moyenne de {ok} sur {all} modèles', 'Media de {ok} de {all} modelos'],
    'an.partial': [' · 1 Modell ausgefallen', ' · 1 model failed', ' · 1 modello non disponibile', ' · 1 modèle en échec', ' · 1 modelo falló'],
    'an.failTitle': ['KI-Analyse fehlgeschlagen', 'AI analysis failed', 'Analisi IA non riuscita', 'Analyse IA échouée', 'El análisis de IA ha fallado'],
    'an.failBody': [' – unten siehst du deshalb Beispieldaten, nicht die Bewertung deines Fotos.', ' — below you see sample data, not a review of your photo.', ' — sotto vedi dati di esempio, non la valutazione della tua foto.', ' — en dessous, ce sont des données d’exemple, pas l’avis sur ta photo.', ' — debajo ves datos de ejemplo, no la valoración de tu foto.'],
    'an.working': ['analysiert …', 'is analysing …', 'sta analizzando …', 'analyse …', 'está analizando …'],
    'an.unavailable': ['Nicht verfügbar: ', 'Not available: ', 'Non disponibile: ', 'Indisponible : ', 'No disponible: '],
    'an.doneTitle': ['Analyse fertig', 'Analysis done', 'Analisi pronta', 'Analyse terminée', 'Análisis listo'],
    'edit.step': ['Schritt 2 von 3', 'Step 2 of 3', 'Passo 2 di 3', 'Étape 2 sur 3', 'Paso 2 de 3'],
    'edit.h2': ['Bearbeiten', 'Edit', 'Ritocco', 'Retouche', 'Retoque'],
    'edit.before': ['Vorher', 'Before', 'Prima', 'Avant', 'Antes'],
    'edit.after': ['Nachher', 'After', 'Dopo', 'Après', 'Después'],
    'edit.compare': ['Vergleich', 'Compare', 'Confronto', 'Comparaison', 'Comparación'],
    'edit.cropNone': ['Kein Zuschnitt vorgeschlagen', 'No crop suggested', 'Nessun ritaglio proposto', 'Aucun recadrage proposé', 'Sin recorte sugerido'],
    'edit.crop': ['Zuschnitt (KI-Vorschlag, {w} × {h} %)', 'Crop (AI suggestion, {w} × {h} %)', 'Ritaglio (proposta IA, {w} × {h} %)', 'Recadrage (suggestion IA, {w} × {h} %)', 'Recorte (sugerencia de IA, {w} × {h} %)'],
    'edit.ai': ['KI-Werte', 'AI values', 'Valori IA', 'Valeurs IA', 'Valores de IA'],
    'edit.original': ['Original', 'Original', 'Originale', 'Original', 'Original'],
    'edit.save': ['Bild speichern (JPG)', 'Save image (JPG)', 'Salva immagine (JPG)', 'Enregistrer l’image (JPG)', 'Guardar imagen (JPG)'],
    'edit.next': ['Weiter zu den Texten', 'Continue to captions', 'Continua con i testi', 'Continuer vers les textes', 'Seguir a los textos'],
    'edit.whyDemo': ['Beispielwerte – keine echte KI', 'Sample values — not real AI', 'Valori di esempio — non è IA reale', 'Valeurs d’exemple — pas une vraie IA', 'Valores de ejemplo — no es IA real'],
    'edit.whyAi': ['Warum diese Werte? (Median aus {n} Modellen)', 'Why these values? (median of {n} models)', 'Perché questi valori? (mediana di {n} modelli)', 'Pourquoi ces valeurs ? (médiane de {n} modèles)', '¿Por qué estos valores? (mediana de {n} modelos)'],
    'edit.badgeSample': ['Beispielwerte', 'Sample values', 'Valori di esempio', 'Valeurs d’exemple', 'Valores de ejemplo'],
    'edit.badgeAi': ['KI-Werte · Konsens', 'AI values · consensus', 'Valori IA · consenso', 'Valeurs IA · consensus', 'Valores de IA · consenso'],
    'edit.badgeMock': ['Testmodus', 'Test mode', 'Modalità test', 'Mode test', 'Modo de prueba'],
    'share.label': ['Teilen / In Fotos sichern', 'Share / Save to Photos', 'Condividi / Salva in Foto', 'Partager / Enregistrer dans Photos', 'Compartir / Guardar en Fotos'],
    'share.prep': ['Wird vorbereitet …', 'Preparing …', 'Preparazione …', 'Préparation …', 'Preparando …'],
    'share.hint': ['Auf dem iPhone legt „Bild sichern“ im Teilen-Menü das Foto in der Fotos-App ab.', 'On iPhone, Save Image in the share sheet puts the photo in the Photos app.', 'Su iPhone, «Salva immagine» nel foglio di condivisione mette la foto in Foto.', 'Sur iPhone, « Enregistrer l’image » dans la feuille de partage met la photo dans Photos.', 'En el iPhone, «Guardar imagen» en la hoja de compartir la deja en Fotos.'],
    'share.copy': ['Bildunterschrift kopieren', 'Copy caption', 'Copia la didascalia', 'Copier la légende', 'Copiar el texto'],
    'soc.step': ['Schritt 3 von 3', 'Step 3 of 3', 'Passo 3 di 3', 'Étape 3 sur 3', 'Paso 3 de 3'],
    'soc.h2': ['Texte & Hashtags', 'Captions & hashtags', 'Testi e hashtag', 'Textes et hashtags', 'Textos y hashtags'],
    'soc.sub': ['Passend zur Bildstimmung formuliert.', 'Written to match the mood of the photo.', 'Scritti in base all’atmosfera della foto.', 'Rédigés selon l’ambiance de la photo.', 'Redactados según el ambiente de la foto.'],
    'soc.lockH': ['Instagram-Texte', 'Instagram captions', 'Testi per Instagram', 'Légendes Instagram', 'Textos de Instagram'],
    'soc.lockP': [
      'Bildunterschriften in deiner Sprache sind Teil von Lumen Pro.',
      'Captions in your language are part of Lumen Pro.',
      'Le didascalie nella tua lingua fanno parte di Lumen Pro.',
      'Les légendes dans ta langue font partie de Lumen Pro.',
      'Los textos en tu idioma forman parte de Lumen Pro.',
    ],
    'soc.proBtn': ['Pro ansehen', 'See Pro', 'Vedi Pro', 'Voir Pro', 'Ver Pro'],
    'soc.copy': ['Kopieren', 'Copy', 'Copia', 'Copier', 'Copiar'],
    'soc.saveHist': ['Im Verlauf speichern', 'Save to history', 'Salva nella cronologia', 'Enregistrer dans l’historique', 'Guardar en el historial'],
    'soc.sample': ['Beispieldaten', 'Sample data', 'Dati di esempio', 'Données d’exemple', 'Datos de ejemplo'],
    'learn.kicker': ['Fotokurs', 'Photo course', 'Corso di foto', 'Cours photo', 'Curso de foto'],
    'learn.h2': ['Lernen', 'Learn', 'Imparare', 'Apprendre', 'Aprender'],
    'learn.subAll': [
      'Sechs Lektionen – passend zu den Kategorien deiner Bewertung.',
      'Six lessons — matching the categories of your review.',
      'Sei lezioni, in linea con le categorie della valutazione.',
      'Six leçons — selon les catégories de ton évaluation.',
      'Seis lecciones, según las categorías de tu valoración.',
    ],
    'learn.subFree': [
      'Die ersten zwei Lektionen sind gratis. Der Rest gehört zu Pro.',
      'The first two lessons are free. The rest is part of Pro.',
      'Le prime due lezioni sono gratuite. Il resto è in Pro.',
      'Les deux premières leçons sont gratuites. Le reste fait partie de Pro.',
      'Las dos primeras lecciones son gratis. El resto es de Pro.',
    ],
    'learn.progress': ['Kursfortschritt', 'Course progress', 'Avanzamento del corso', 'Progression du cours', 'Progreso del curso'],
    'learn.of': ['{done} von {total}', '{done} of {total}', '{done} di {total}', '{done} sur {total}', '{done} de {total}'],
    'learn.done': ['Erledigt', 'Done', 'Fatto', 'Fait', 'Hecho'],
    'learn.unlock': ['Mit Pro freischalten', 'Unlock with Pro', 'Sblocca con Pro', 'Débloquer avec Pro', 'Desbloquear con Pro'],
    'learn.more': ['Weitere Lektionen mit Pro', 'More lessons with Pro', 'Altre lezioni con Pro', 'D’autres leçons avec Pro', 'Más lecciones con Pro'],
    'learn.next': ['Nächste Lektion: {name}', 'Next lesson: {name}', 'Lezione successiva: {name}', 'Leçon suivante : {name}', 'Siguiente lección: {name}'],
    'hist.kicker': ['Deine Entwicklung', 'Your progress', 'I tuoi progressi', 'Ton évolution', 'Tu evolución'],
    'hist.h2': ['Verlauf', 'History', 'Cronologia', 'Historique', 'Historial'],
    'hist.avg': ['Ø Bewertung, letzte 4 Wochen', 'Average score, last 4 weeks', 'Voto medio, ultime 4 settimane', 'Note moyenne, 4 dernières semaines', 'Nota media, últimas 4 semanas'],
    'hist.n1': ['Sonnenuntergang Neusiedl', 'Sunset at Neusiedl', 'Tramonto al Neusiedl', 'Coucher de soleil au Neusiedl', 'Atardecer en Neusiedl'],
    'hist.d1': ['12. Okt. 2026', '12 Oct 2026', '12 ott 2026', '12 oct. 2026', '12 oct 2026'],
    'hist.n2': ['Wiener Altstadt bei Nacht', 'Vienna old town at night', 'Centro di Vienna di notte', 'Vieille ville de Vienne la nuit', 'Casco antiguo de Viena de noche'],
    'hist.d2': ['8. Okt. 2026', '8 Oct 2026', '8 ott 2026', '8 oct. 2026', '8 oct 2026'],
    'hist.n3': ['Porträt im Augarten', 'Portrait in the Augarten', 'Ritratto all’Augarten', 'Portrait à l’Augarten', 'Retrato en el Augarten'],
    'hist.d3': ['1. Okt. 2026', '1 Oct 2026', '1 ott 2026', '1er oct. 2026', '1 oct 2026'],
    'hist.new': ['Neues Foto analysieren', 'Analyse a new photo', 'Analizza una nuova foto', 'Analyser une nouvelle photo', 'Analizar una foto nueva'],
    'hist.item': ['Neues Foto', 'New photo', 'Nuova foto', 'Nouvelle photo', 'Foto nueva'],
    'hist.today': ['Heute', 'Today', 'Oggi', 'Aujourd’hui', 'Hoy'],
    'acc.kicker': ['Konto', 'Account', 'Account', 'Compte', 'Cuenta'],
    'acc.h2': ['Dein Konto', 'Your account', 'Il tuo account', 'Ton compte', 'Tu cuenta'],
    'acc.upgrade': ['Pro werden', 'Get Pro', 'Passa a Pro', 'Passer à Pro', 'Hazte Pro'],
    'acc.portal': ['Abo verwalten', 'Manage subscription', 'Gestisci abbonamento', 'Gérer l’abonnement', 'Gestionar suscripción'],
    'acc.logout': ['Abmelden', 'Sign out', 'Esci', 'Se déconnecter', 'Salir'],
    'acc.login': ['Mit E-Mail anmelden', 'Sign in with email', 'Accedi con l’e-mail', 'Se connecter par e-mail', 'Entrar con el correo'],
    'acc.testerPlan': ['Testzugang', 'Tester access', 'Accesso test', 'Accès test', 'Acceso de prueba'],
    'acc.testerEmail': ['Einladungscode', 'Invite code', 'Codice invito', 'Code d’invitation', 'Código de invitación'],
    'acc.testerLead': [
      'Dein Code schaltet die Pro-Funktionen frei: alle Modelle, Texte und den vollen Kurs.',
      'Your code unlocks Pro features: all models, captions and the full course.',
      'Il codice sblocca le funzioni Pro: tutti i modelli, i testi e il corso completo.',
      'Ton code débloque les fonctions Pro : tous les modèles, les textes et le cours complet.',
      'Tu código abre las funciones Pro: todos los modelos, los textos y el curso completo.',
    ],
    'acc.proLead': [
      'Alle drei Modelle, Instagram-Texte und der volle Fotokurs.',
      'All three models, Instagram captions and the full photo course.',
      'Tutti e tre i modelli, i testi Instagram e il corso completo.',
      'Les trois modèles, les légendes Instagram et le cours complet.',
      'Los tres modelos, textos de Instagram y el curso completo.',
    ],
    'acc.freeLead': [
      '3 Analysen pro Woche mit Gemini. Pro schaltet den Rest frei.',
      '3 analyses per week with Gemini. Pro unlocks the rest.',
      '3 analisi a settimana con Gemini. Pro sblocca il resto.',
      '3 analyses par semaine avec Gemini. Pro débloque le reste.',
      '3 análisis por semana con Gemini. Pro desbloquea el resto.',
    ],
    'acc.openPlan': ['Ohne Konto', 'No account', 'Senza account', 'Sans compte', 'Sin cuenta'],
    'acc.openEmail': ['Noch nicht angemeldet', 'Not signed in yet', 'Accesso non effettuato', 'Pas encore connecté', 'Aún sin entrar'],
    'acc.openLead': [
      'Mit einem E-Mail-Konto gibt es den Gratis-Tarif und Lumen Pro.',
      'An email account gives you the free plan and Lumen Pro.',
      'Con un account e-mail hai il piano gratuito e Lumen Pro.',
      'Un compte e-mail donne le tarif gratuit et Lumen Pro.',
      'Con una cuenta de correo tienes el plan gratis y Lumen Pro.',
    ],
    'price.kicker': ['Tarife', 'Plans', 'Piani', 'Offres', 'Planes'],
    'price.h2': ['Gratis oder Pro', 'Free or Pro', 'Gratis o Pro', 'Gratuit ou Pro', 'Gratis o Pro'],
    'price.lead': [
      'Pro schaltet alle Modelle, Texte und den vollen Fotokurs frei.',
      'Pro unlocks all models, captions and the full photo course.',
      'Pro sblocca tutti i modelli, i testi e il corso completo.',
      'Pro débloque tous les modèles, les textes et le cours complet.',
      'Pro desbloquea todos los modelos, los textos y el curso completo.',
    ],
    'price.free': ['Gratis', 'Free', 'Gratis', 'Gratuit', 'Gratis'],
    'price.pro': ['Pro', 'Pro', 'Pro', 'Pro', 'Pro'],
    'price.perMonth': ['/ Monat', '/ month', '/ mese', '/ mois', '/ mes'],
    'price.orYear': ['oder €39 / Jahr', 'or €39 / year', 'oppure 39 € / anno', 'ou 39 € / an', 'o 39 € / año'],
    'price.save': ['spare 35%', 'save 35%', 'risparmi il 35%', 'économisez 35 %', 'ahorra un 35 %'],
    'price.f1': ['3 Analysen pro Woche', '3 analyses per week', '3 analisi a settimana', '3 analyses par semaine', '3 análisis por semana'],
    'price.f2': ['1 Modell (Gemini)', '1 model (Gemini)', '1 modello (Gemini)', '1 modèle (Gemini)', '1 modelo (Gemini)'],
    'price.f3': ['Erste zwei Fotokurs-Lektionen', 'First two photo-course lessons', 'Prime due lezioni del corso', 'Deux premières leçons du cours', 'Primeras dos lecciones del curso'],
    'price.f4': ['Bearbeiten und Teilen', 'Edit and share', 'Ritocco e condivisione', 'Retouche et partage', 'Retoque y compartir'],
    'price.p1': ['15 Analysen pro Tag', '15 analyses per day', '15 analisi al giorno', '15 analyses par jour', '15 análisis al día'],
    'price.p2': ['GPT, Gemini und Claude', 'GPT, Gemini and Claude', 'GPT, Gemini e Claude', 'GPT, Gemini et Claude', 'GPT, Gemini y Claude'],
    'price.p3': ['Instagram-Texte', 'Instagram captions', 'Testi Instagram', 'Légendes Instagram', 'Textos de Instagram'],
    'price.p4': ['Voller Fotokurs', 'Full photo course', 'Corso di foto completo', 'Cours photo complet', 'Curso de foto completo'],
    'price.month': ['Monatlich · €4,99', 'Monthly · €4.99', 'Mensile · 4,99 €', 'Mensuel · 4,99 €', 'Mensual · 4,99 €'],
    'price.year': ['Jährlich · €39 · spare 35%', 'Yearly · €39 · save 35%', 'Annuale · 39 € · risparmi il 35%', 'Annuel · 39 € · économisez 35 %', 'Anual · 39 € · ahorra un 35 %'],
    'price.soon': ['Pro bald verfügbar', 'Pro coming soon', 'Pro disponibile a breve', 'Pro bientôt disponible', 'Pro disponible pronto'],
    'price.consent': [
      'Ich akzeptiere die <a href="/agb" target="_blank" rel="noopener">AGB</a> und stimme ausdrücklich zu, dass Lumen sofort mit der Leistung beginnt. Mir ist bekannt, dass mein Widerrufsrecht damit erlischt (<a href="/widerruf" target="_blank" rel="noopener">Widerrufsbelehrung</a>, FAGG § 18).',
      'I accept the <a href="/en/agb" target="_blank" rel="noopener">terms</a> and expressly agree that Lumen starts the service immediately. I understand that my right of withdrawal then expires (<a href="/en/widerruf" target="_blank" rel="noopener">withdrawal notice</a>, FAGG § 18). The German version of the terms prevails.',
      'Accetto le <a href="/en/agb" target="_blank" rel="noopener">condizioni</a> e acconsento espressamente che Lumen inizi subito il servizio. So che il diritto di recesso si estingue (<a href="/en/widerruf" target="_blank" rel="noopener">informativa sul recesso</a>, FAGG § 18). Fa fede il testo tedesco.',
      'J’accepte les <a href="/en/agb" target="_blank" rel="noopener">conditions</a> et j’accepte expressément que Lumen commence tout de suite. Je sais que mon droit de rétractation s’éteint (<a href="/en/widerruf" target="_blank" rel="noopener">information sur la rétractation</a>, FAGG § 18). La version allemande prévaut.',
      'Acepto las <a href="/en/agb" target="_blank" rel="noopener">condiciones</a> y consiento expresamente que Lumen empiece de inmediato. Sé que el derecho de desistimiento se extingue (<a href="/en/widerruf" target="_blank" rel="noopener">información de desistimiento</a>, FAGG § 18). Prevalece el texto alemán.',
    ],
    'price.testerLead': [
      'Dein Einladungscode enthält bereits die Pro-Funktionen.',
      'Your invite code already includes the Pro features.',
      'Il tuo codice invito include già le funzioni Pro.',
      'Ton code d’invitation inclut déjà les fonctions Pro.',
      'Tu código de invitación ya incluye las funciones Pro.',
    ],
    'price.havePro': ['Du nutzt Lumen Pro.', 'You are using Lumen Pro.', 'Stai usando Lumen Pro.', 'Tu utilises Lumen Pro.', 'Estás usando Lumen Pro.'],
    'price.needLogin': [
      'Melde dich mit deiner E-Mail an, um Gratis zu nutzen oder Pro zu kaufen.',
      'Sign in with your email to use Free or buy Pro.',
      'Accedi con l’e-mail per usare Gratis o acquistare Pro.',
      'Connecte-toi avec ton e-mail pour utiliser Gratuit ou acheter Pro.',
      'Entra con tu correo para usar Gratis o comprar Pro.',
    ],
    'price.notePortal': ['Änderungen am Abo laufen über „Abo verwalten“.', 'Subscription changes go through Manage subscription.', 'Le modifiche all’abbonamento passano da Gestisci abbonamento.', 'Les changements d’abonnement passent par Gérer l’abonnement.', 'Los cambios de suscripción van por Gestionar suscripción.'],
    'price.as': ['Angemeldet als {email}', 'Signed in as {email}', 'Accesso come {email}', 'Connecté en tant que {email}', 'Sesión como {email}'],
    'nav.photo': ['Foto', 'Photo', 'Foto', 'Photo', 'Foto'],
    'nav.analyse': ['Analyse', 'Analysis', 'Analisi', 'Analyse', 'Análisis'],
    'nav.edit': ['Bearbeiten', 'Edit', 'Ritocco', 'Retouche', 'Retoque'],
    'nav.text': ['Texte', 'Captions', 'Testi', 'Textes', 'Textos'],
    'nav.learn': ['Lernen', 'Learn', 'Corso', 'Cours', 'Curso'],
    'nav.history': ['Verlauf', 'History', 'Cronologia', 'Historique', 'Historial'],
    'lang.label': ['Sprache', 'Language', 'Lingua', 'Langue', 'Idioma'],
    'aria.account': ['Konto', 'Account', 'Account', 'Compte', 'Cuenta'],
    'aria.back': ['Zurück', 'Back', 'Indietro', 'Retour', 'Atrás'],
    'aria.intro': ['Zur Einführung', 'To the introduction', 'All’introduzione', 'Vers l’introduction', 'A la introducción'],
    'aria.close': ['Schließen', 'Close', 'Chiudi', 'Fermer', 'Cerrar'],
    'aria.photo': ['Dein Foto', 'Your photo', 'La tua foto', 'Ta photo', 'Tu foto'],
    'toast.login': ['Angemeldet', 'Signed in', 'Accesso effettuato', 'Connecté', 'Sesión iniciada'],
    'toast.paid': ['Zahlung erhalten. Pro erscheint, sobald Stripe es bestätigt.', 'Payment received. Pro appears once Stripe confirms it.', 'Pagamento ricevuto. Pro compare quando Stripe lo conferma.', 'Paiement reçu. Pro apparaît dès que Stripe le confirme.', 'Pago recibido. Pro aparece cuando Stripe lo confirme.'],
    'toast.cancel': ['Kauf abgebrochen', 'Purchase cancelled', 'Acquisto annullato', 'Achat annulé', 'Compra cancelada'],
    'toast.portalBack': ['Willkommen zurück', 'Welcome back', 'Bentornato', 'Bon retour', 'Hola de nuevo'],
    'toast.welcome': ['Willkommen bei Lumen', 'Welcome to Lumen', 'Benvenuto in Lumen', 'Bienvenue sur Lumen', 'Te damos la bienvenida a Lumen'],
    'toast.out': ['Abgemeldet', 'Signed out', 'Disconnesso', 'Déconnecté', 'Sesión cerrada'],
    'toast.consent': ['Bitte AGB und sofortigen Beginn bestätigen', 'Please confirm the terms and the immediate start', 'Conferma le condizioni e l’inizio immediato', 'Confirme les conditions et le début immédiat', 'Confirma las condiciones y el inicio inmediato'],
    'toast.needMail': ['Bitte mit E-Mail anmelden', 'Please sign in with email', 'Accedi con l’e-mail', 'Connecte-toi avec ton e-mail', 'Entra con tu correo'],
    'toast.again': ['Bitte erneut anmelden', 'Please sign in again', 'Accedi di nuovo', 'Reconnecte-toi', 'Vuelve a entrar'],
    'toast.budget': ['Tagesbudget erreicht', 'Daily budget reached', 'Budget giornaliero raggiunto', 'Budget quotidien atteint', 'Presupuesto diario alcanzado'],
    'toast.limit': ['Limit erreicht', 'Limit reached', 'Limite raggiunto', 'Limite atteinte', 'Límite alcanzado'],
    'toast.demoPhoto': ['Tipp: Eigenes Foto wählen für echte KI', 'Tip: choose your own photo for real AI', 'Suggerimento: scegli una tua foto per l’IA reale', 'Astuce : choisis ta photo pour une vraie IA', 'Consejo: elige tu foto para la IA real'],
    'toast.aiDown': ['KI nicht erreichbar – zeige Beispieldaten', 'AI unreachable — showing sample data', 'IA non raggiungibile — mostro dati di esempio', 'IA injoignable — affichage des exemples', 'IA no disponible — mostrando ejemplos'],
    'toast.pro': ['Pro freischalten', 'Unlock Pro', 'Sblocca Pro', 'Débloquer Pro', 'Desbloquear Pro'],
    'toast.copied': ['In Zwischenablage kopiert', 'Copied to the clipboard', 'Copiato negli appunti', 'Copié dans le presse-papiers', 'Copiado al portapapeles'],
    'toast.copyDemo': ['Kopiert (Demo)', 'Copied (demo)', 'Copiato (demo)', 'Copié (démo)', 'Copiado (demo)'],
    'toast.lesson': ['Lektion abgeschlossen', 'Lesson completed', 'Lezione completata', 'Leçon terminée', 'Lección completada'],
    'toast.right': ['Richtig!', 'Correct!', 'Giusto!', 'Juste !', '¡Correcto!'],
    'toast.wrong': ['Nicht ganz.', 'Not quite.', 'Non proprio.', 'Pas tout à fait.', 'No del todo.'],
    'toast.noCrop': ['Kein Zuschnitt vorgeschlagen', 'No crop suggested', 'Nessun ritaglio proposto', 'Aucun recadrage proposé', 'Sin recorte sugerido'],
    'toast.jpg': ['JPG heruntergeladen', 'JPG downloaded', 'JPG scaricato', 'JPG téléchargé', 'JPG descargado'],
    'toast.noSave': ['Speichern nicht möglich', 'Could not save', 'Impossibile salvare', 'Enregistrement impossible', 'No se pudo guardar'],
    'toast.sharePrep': ['Bild wird vorbereitet …', 'Preparing the image …', 'Preparazione dell’immagine …', 'Préparation de l’image …', 'Preparando la imagen …'],
    'toast.shareFail': ['Teilen gerade nicht möglich', 'Sharing is not available right now', 'Condivisione non disponibile ora', 'Partage impossible pour le moment', 'Compartir no está disponible ahora'],
    'toast.capCopied': ['Text kopiert – in Instagram einfügen', 'Caption copied — paste it into Instagram', 'Testo copiato — incollalo in Instagram', 'Texte copié — colle-le dans Instagram', 'Texto copiado — pégalo en Instagram'],
    'toast.noCap': ['Noch kein Text', 'No caption yet', 'Ancora nessun testo', 'Pas encore de texte', 'Aún no hay texto'],
    'toast.noCopy': ['Kopieren nicht möglich', 'Could not copy', 'Impossibile copiare', 'Copie impossible', 'No se pudo copiar'],
    'toast.capDemo': ['Texte nicht verfügbar – Beispiel', 'Captions unavailable — showing a sample', 'Testi non disponibili — esempio', 'Textes indisponibles — exemple', 'Textos no disponibles — ejemplo'],
    'quiz.why': ['Warum diese Punktzahl?', 'Why this score?', 'Perché questo voto?', 'Pourquoi cette note ?', '¿Por qué esta nota?'],
    'quiz.basics': ['Grundlagen', 'Basics', 'Basi', 'Bases', 'Bases'],
    'quiz.how': ['So verbesserst du es', 'How to improve it', 'Come migliorarlo', 'Comment l’améliorer', 'Cómo mejorarlo'],
    'quiz.quiz': ['Kurzes Quiz', 'Short quiz', 'Quiz breve', 'Court quiz', 'Cuestionario breve'],
    'quiz.lesson': ['Lektion {i} von {n}', 'Lesson {i} of {n}', 'Lezione {i} di {n}', 'Leçon {i} sur {n}', 'Lección {i} de {n}'],
    'quiz.sample': ['Beispieldaten', 'Sample data', 'Dati di esempio', 'Données d’exemple', 'Datos de ejemplo'],
    'sl.light': ['Licht', 'Light', 'Luce', 'Lumière', 'Luz'],
    'sl.exposure': ['Belichtung', 'Exposure', 'Esposizione', 'Exposition', 'Exposición'],
    'sl.contrast': ['Kontrast', 'Contrast', 'Contrasto', 'Contraste', 'Contraste'],
    'sl.highlights': ['Lichter', 'Highlights', 'Alte luci', 'Hautes lumières', 'Altas luces'],
    'sl.shadows': ['Tiefen', 'Shadows', 'Ombre', 'Ombres', 'Sombras'],
    'sl.white': ['Weiß', 'Whites', 'Bianchi', 'Blancs', 'Blancos'],
    'sl.black': ['Schwarz', 'Blacks', 'Neri', 'Noirs', 'Negros'],
    'sl.color': ['Farbe', 'Colour', 'Colore', 'Couleur', 'Color'],
    'sl.warmth': ['Wärme', 'Warmth', 'Calore', 'Chaleur', 'Calidez'],
    'sl.sat': ['Sättigung', 'Saturation', 'Saturazione', 'Saturation', 'Saturación'],
    'sl.vib': ['Dynamik', 'Vibrance', 'Vividezza', 'Vibrance', 'Intensidad'],
    'sl.detail': ['Details', 'Detail', 'Dettaglio', 'Détail', 'Detalle'],
    'sl.sharp': ['Schärfe', 'Sharpness', 'Nitidezza', 'Netteté', 'Nitidez'],
    'demo.gpt': ['Ausgewogene Komposition entlang der Drittellinien. Die Lichter rund um die Sonne sind ausgefressen – reduziere sie um etwa −25 und richte den Horizont gerade aus.', 'Balanced composition along the thirds. Highlights around the sun are blown — pull them down by about −25 and straighten the horizon.', 'Composizione equilibrata sulle linee dei terzi. Le luci intorno al sole sono bruciate: abbassale di circa −25 e raddrizza l’orizzonte.', 'Composition équilibrée sur les lignes des tiers. Les hautes lumières autour du soleil sont brûlées — baisse-les d’environ −25 et redresse l’horizon.', 'Composición equilibrada en los tercios. Las luces alrededor del sol están quemadas: bájalas unos −25 y endereza el horizonte.'],
    'demo.gem': ['Die warme Farbstimmung gefällt, ein leichter Magenta-Stich in den Wolken fällt auf. Ein engerer 4:5-Zuschnitt würde für Instagram besser passen.', 'The warm colour mood works; a slight magenta cast in the clouds stands out. A tighter 4:5 crop would suit Instagram better.', 'La tonalità calda funziona; si nota una leggera dominante magenta nelle nuvole. Un ritaglio 4:5 più stretto starebbe meglio su Instagram.', 'L’ambiance chaude fonctionne ; une légère dominante magenta dans les nuages se voit. Un recadrage 4:5 plus serré irait mieux sur Instagram.', 'El ambiente cálido funciona; se nota un ligero tono magenta en las nubes. Un recorte 4:5 más cerrado encajaría mejor en Instagram.'],
    'demo.claude': ['Ruhige, fast meditative Wirkung. Ein Vordergrundelement – Stein, Gras oder eine Person – würde Tiefe und Maßstab geben.', 'Calm, almost meditative mood. A foreground element — stone, grass or a person — would add depth and scale.', 'Atmosfera calma, quasi meditativa. Un elemento in primo piano — pietra, erba o una persona — darebbe profondità e scala.', 'Ambiance calme, presque méditative. Un premier plan — pierre, herbe ou personne — donnerait de la profondeur et une échelle.', 'Ambiente calmado, casi meditativo. Un elemento en primer plano — piedra, hierba o una persona — daría profundidad y escala.'],
    'demo.cap': ['Der Moment, kurz bevor die Sonne hinter den Bergen verschwindet. Warmes Licht, ruhige Linien – und für einen Augenblick steht alles still.', 'That quiet moment just before the sun slips behind the mountains. Warm light, calm lines — and for a second, everything stands still.', 'L’attimo prima che il sole scivoli dietro le montagne. Luce calda, linee calme — e per un secondo tutto si ferma.', 'L’instant juste avant que le soleil ne glisse derrière les montagnes. Lumière chaude, lignes calmes — et pendant une seconde, tout s’arrête.', 'El instante justo antes de que el sol se esconda tras las montañas. Luz cálida, líneas tranquilas — y por un segundo todo se detiene.'],
    'demo.tags': ['#fotografie #goldeneStunde #alpen #landschaft #sonnenuntergang', '#photography #goldenhour #alps #landscape #sunset', '#fotografia #oralegolden #alpi #paesaggio #tramonto', '#photographie #heureDoree #alpes #paysage #coucherdesoleil', '#fotografia #horadorada #alpes #paisaje #atardecer'],
    'demo.short': ['[Testmodus] Synthetisch', '[Test mode] Synthetic', '[Modalità test] Sintetico', '[Mode test] Synthétique', '[Modo prueba] Sintético'],
    'dg.thirds': ['Schnittpunkte = starke Positionen', 'Intersections = strong positions', 'Intersezioni = posizioni forti', 'Intersections = positions fortes', 'Intersecciones = posiciones fuertes'],
    'dg.gold1': ['Gold: Goldener Schnitt (≈ 38 % / 62 %)', 'Gold: golden ratio (≈ 38% / 62%)', 'Oro: sezione aurea (≈ 38% / 62%)', 'Or : nombre d’or (≈ 38 % / 62 %)', 'Oro: proporción áurea (≈ 38 % / 62 %)'],
    'dg.gold2': ['gestrichelt: Drittel (33 % / 67 %)', 'dashed: thirds (33% / 67%)', 'tratteggiato: terzi (33% / 67%)', 'pointillé : tiers (33 % / 67 %)', 'discontinuo: tercios (33 % / 67 %)'],
    'dg.lines': ['Linien führen den Blick zum Hauptmotiv', 'Lines lead the eye to the subject', 'Le linee portano lo sguardo al soggetto', 'Les lignes mènent le regard vers le sujet', 'Las líneas llevan la mirada al motivo'],
    'dg.fg': ['Vordergrund', 'Foreground', 'Primo piano', 'Premier plan', 'Primer plano'],
    'dg.mg': ['Mittelgrund', 'Middle ground', 'Piano medio', 'Plan moyen', 'Plano medio'],
    'dg.bg': ['Hintergrund', 'Background', 'Sfondo', 'Arrière-plan', 'Fondo'],
    'dg.rock': ['Felsen', 'Rock', 'Roccia', 'Rocher', 'Roca'],
    'dg.lake': ['See', 'Lake', 'Lago', 'Lac', 'Lago'],
    'dg.mtn': ['Berge', 'Mountains', 'Montagne', 'Montagnes', 'Montañas'],
    'dg.goldenHour': ['goldene Stunde', 'golden hour', 'ora d’oro', 'heure dorée', 'hora dorada'],
    'dg.noon': ['Mittag: hart, steil', 'Noon: hard, steep', 'Mezzogiorno: duro, alto', 'Midi : dur, vertical', 'Mediodía: duro, alto'],
    'dg.hard': ['hart: kleine Quelle', 'hard: small source', 'dura: fonte piccola', 'dure : petite source', 'dura: fuente pequeña'],
    'dg.soft': ['weich: große Quelle', 'soft: large source', 'morbida: fonte grande', 'douce : grande source', 'suave: fuente grande'],
    'dg.back': ['Gegenlicht: Silhouette + Lichtkante', 'Backlight: silhouette + rim light', 'Controluce: silhouette + bordo luminoso', 'Contre-jour : silhouette + liseré', 'Contraluz: silueta + borde de luz'],
    'dg.shallow': ['wenig Tiefe', 'shallow depth', 'poca profondità', 'peu de profondeur', 'poca profundidad'],
    'dg.deep': ['viel Tiefe', 'deep depth', 'molta profondità', 'beaucoup de profondeur', 'mucha profundidad'],
    'dg.aperture': ['Blende', 'Aperture', 'Diaframma', 'Ouverture', 'Apertura'],
    'dg.shutter': ['Verschlusszeit', 'Shutter speed', 'Tempo di scatto', 'Vitesse', 'Velocidad'],
    'dg.iso': ['ISO', 'ISO', 'ISO', 'ISO', 'ISO'],
    'dg.exposure': ['Belichtung', 'Exposure', 'Esposizione', 'Exposition', 'Exposición'],
    'dg.ev': ['jede Stufe = ×2 Licht', 'each stop = ×2 light', 'ogni stop = ×2 luce', 'chaque IL = ×2 de lumière', 'cada paso = ×2 de luz'],
    'dg.dof': ['Schärfebereich', 'Zone of focus', 'Zona a fuoco', 'Zone de netteté', 'Zona de enfoque'],
    'dg.dofNote': ['Offene Blende → schmaler scharfer Bereich', 'Wide aperture → narrow sharp zone', 'Diaframma aperto → zona nitida stretta', 'Grande ouverture → zone nette étroite', 'Apertura abierta → zona nítida estrecha'],
    'dg.shadows': ['Tiefen', 'Shadows', 'Ombre', 'Ombres', 'Sombras'],
    'dg.mids': ['Mitteltöne', 'Midtones', 'Mezzi toni', 'Tons moyens', 'Medios'],
    'dg.highs': ['Lichter', 'Highlights', 'Luci', 'Hautes lumières', 'Luces'],
    'dg.clip': ['Clipping →', 'Clipping →', 'Clipping →', 'Écrêtage →', 'Recorte →'],
    'dg.comp': ['Komplementär:', 'Complementary:', 'Complementari:', 'Complémentaires :', 'Complementarios:'],
    'dg.comp1': ['gegenüberliegende', 'opposite', 'opposti', 'opposés', 'opuestos'],
    'dg.comp2': ['Farben, z. B. Orange', 'colours, e.g. orange', 'colori, p. es. arancio', 'couleurs, p. ex. orange', 'colores, p. ej. naranja'],
    'dg.comp3': ['und Blau', 'and blue', 'e blu', 'et bleu', 'y azul'],
    'dg.k2700': ['2.700 K Glühlampe', '2,700 K tungsten', '2.700 K lampadina', '2 700 K tungstène', '2.700 K tungsteno'],
    'dg.k5500': ['5.500 K Tageslicht', '5,500 K daylight', '5.500 K luce diurna', '5 500 K lumière du jour', '5.500 K luz de día'],
    'dg.k7500': ['7.500 K Schatten', '7,500 K shade', '7.500 K ombra', '7 500 K ombre', '7.500 K sombra'],
    'dg.lost': ['viel Umfeld, Motiv verloren', 'lots of context, subject lost', 'molto contesto, soggetto perso', 'beaucoup de contexte, sujet perdu', 'mucho contexto, motivo perdido'],
    'dg.clear': ['ein klares Hauptmotiv', 'one clear subject', 'un soggetto chiaro', 'un sujet clair', 'un motivo claro'],
    'an.noPhoto': ['kein eigenes Foto gewählt', 'no photo chosen', 'nessuna foto scelta', 'aucune photo choisie', 'ninguna foto elegida'],
    'an.aiErr': ['KI-Fehler', 'AI error', 'Errore IA', 'Erreur IA', 'Error de IA'],
    'soc.failBadge': ['Beispieldaten · KI-Fehler', 'Sample data · AI error', 'Dati di esempio · errore IA', 'Données d’exemple · erreur IA', 'Datos de ejemplo · error de IA'],
    'demo.editWho': ['Beispiel', 'Sample', 'Esempio', 'Exemple', 'Ejemplo'],
    'demo.editWhy': [
      'Lichter senken, Kontrast und Dynamik leicht erhöhen.',
      'Lower the highlights and raise contrast and vibrance a little.',
      'Abbassa le alte luci e alza un po’ contrasto e vividezza.',
      'Baisse les hautes lumières et augmente un peu le contraste et la vibrance.',
      'Baja las altas luces y sube un poco el contraste y la intensidad.',
    ],
    'toast.loginFail': ['Anmeldung fehlgeschlagen', 'Sign-in failed', 'Accesso non riuscito', 'Connexion échouée', 'El acceso ha fallado'],
    'hist.delta': ['+1,6', '+1.6', '+1,6', '+1,6', '+1,6'],
    'price.amt': ['€4,99', '€4.99', '4,99 €', '4,99 €', '4,99 €'],
  });

  function baseLang(tag) {
    const t = String(tag || '').toLowerCase().trim().split(';')[0].trim();
    if (!t || t === '*') return null;
    const base = t.split('-')[0];
    return LANGS.includes(base) ? base : null;
  }
  function fromAccept(header) {
    const parts = String(header || '').split(',').map((s) => {
      const bits = s.trim().split(';');
      let q = 1;
      for (const r of bits.slice(1)) {
        const m = r.trim().match(/^q=([0-9.]+)$/i);
        if (m) q = parseFloat(m[1]);
      }
      return { tag: bits[0].trim(), q: isFinite(q) ? q : 0 };
    }).filter((x) => x.tag).sort((a, b) => b.q - a.q);
    for (const p of parts) {
      const b = baseLang(p.tag);
      if (b) return b;
    }
    return null;
  }
  function pickLang(opts) {
    opts = opts || {};
    const fromCookie = baseLang(opts.cookie);
    if (fromCookie) return fromCookie;
    if (opts.accept) {
      const a = fromAccept(opts.accept);
      if (a) return a;
    }
    const list = opts.languages || [];
    for (const item of list) {
      const b = baseLang(item);
      if (b) return b;
    }
    return 'en';
  }
  function t(lang, key, vars) {
    const l = LANGS.includes(lang) ? lang : 'en';
    let s = STR[l][key];
    if (s == null) s = STR.en[key];
    if (s == null) return key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? '' : String(vars[k])));
    return s;
  }
  function mailCopy(lang, link) {
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const hello = t(lang, 'mail.hello'), body = t(lang, 'mail.body'), cta = t(lang, 'mail.cta'), ignore = t(lang, 'mail.ignore');
    const safe = esc(link);
    return {
      subject: t(lang, 'mail.subject'),
      text: hello + '\n\n' + body + '\n' + link + '\n\n' + ignore + '\n\nLumen · Picwish-Fotodesign',
      html: '<p>' + esc(hello) + '</p><p>' + esc(body) + '</p><p><a href="' + safe + '">' + esc(cta) + '</a></p><p style="color:#666;font-size:13px">' + esc(ignore) + '</p><p style="color:#666;font-size:13px">Lumen · Picwish-Fotodesign</p>',
    };
  }
  function legalPath(lang, path) {
    const p = String(path || '').replace(/^\/en/, '');
    const clean = p.startsWith('/') ? p : '/' + p;
    return (lang === 'de' ? '' : '/en') + clean;
  }
  function dictionaryKeys() { return Object.keys(STR.en); }
  function mockCaption(lang) {
    const pack = {
      de: { text: '[TESTMODUS] Beispieltext ohne echte KI.', hashtags: ['testmodus', 'lumen'] },
      en: { text: '[TEST MODE] Sample caption, no real AI.', hashtags: ['testmode', 'lumen'] },
      it: { text: '[MODALITÀ TEST] Didascalia di esempio, senza IA vera.', hashtags: ['test', 'lumen'] },
      fr: { text: '[MODE TEST] Légende d’exemple, sans vraie IA.', hashtags: ['test', 'lumen'] },
      es: { text: '[MODO PRUEBA] Texto de ejemplo, sin IA real.', hashtags: ['prueba', 'lumen'] },
    };
    return pack[lang] || pack.en;
  }
  let COURSE = null;
  function course(lang) {
    if (!COURSE) {
      if (typeof window !== 'undefined' && window.LUMEN_COURSE) COURSE = window.LUMEN_COURSE;
      else COURSE = require('./course.js');
    }
    return COURSE[LANGS.includes(lang) ? lang : 'en'] || COURSE.en;
  }
  return {
    LANGS, STR, baseLang, pickLang, t, mailCopy, legalPath, dictionaryKeys, mockCaption, course,
    outputName: (lang) => OUT_DE[lang] || 'Englisch',
    outputNameEn: (lang) => OUT_EN[lang] || 'English',
    langLabel: (lang) => LABELS[lang] || LABELS.en,
  };
});

// Photo-course copy in de, en, it, fr, es. Loaded by i18n.js.
(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  if (typeof window !== 'undefined') window.LUMEN_COURSE = data;
})(this, function () {
  const L = (id, n, why, concepts, tips, q, options, a, explain) => ({
    id, n, why, concepts, tips, quiz: { q, options, a, explain },
  });
  const c = (title, diagram, body) => ({ title, diagram, body });
  const de = [
    L('aufbau', 'Bildaufbau', 'Die Bergkante verläuft fast genau auf der unteren Drittellinie und die Sonne sitzt nahe eines Drittel-Schnittpunkts – das wirkt ausgewogen. Punktabzug gibt es für den leicht schiefen Horizont (ca. 2°) und den leeren Vordergrund, der dem Bild Tiefe nimmt.', [
      c('Drittelregel', 'thirds', 'Teile das Bild mit je zwei Linien horizontal und vertikal in neun Felder. Wichtige Motive auf den Linien oder Schnittpunkten wirken meist spannender als in der Mitte. Den Horizont legst du ins obere oder untere Drittel – je nachdem, ob Himmel oder Landschaft wichtiger ist.'),
      c('Goldener Schnitt', 'golden', 'Teilungsverhältnis von etwa 1 : 1,618. Die Linien liegen bei rund 38 % und 62 % und damit etwas näher an der Mitte als die Drittel. Die Drittelregel ist eine vereinfachte Annäherung daran.'),
      c('Führende Linien', 'lines', 'Wege, Flüsse, Zäune oder Ufer leiten den Blick durch das Bild – idealerweise hin zum Hauptmotiv.'),
      c('Vorder-, Mittel- & Hintergrund', 'depth', 'Ein Element im Vordergrund (Stein, Blume, Ast) erzeugt räumliche Tiefe. Symmetrie dagegen – z. B. Spiegelungen im See – darf bewusst mittig komponiert werden.'),
    ], ['Gitterlinien in der Kamera-App aktivieren.', 'Horizont beim Fotografieren oder im Zuschnitt gerade ausrichten.', 'Für mehr Tiefe tiefer in die Knie gehen und einen Vordergrund einbeziehen.'],
    'Der Himmel ist dein spannendstes Motiv. Wo platzierst du den Horizont?', ['Im oberen Drittel', 'Genau in der Mitte', 'Im unteren Drittel'], 2, 'Ins untere Drittel – so bekommt der Himmel zwei Drittel der Bildfläche.'),
    L('licht', 'Licht', 'Das Foto entstand bei tief stehender Sonne: Das warme, flach einfallende Licht erzeugt eine schöne Stimmung. Weil du direkt in die Sonne fotografierst (Gegenlicht), liegt der Vordergrund aber im Schatten und zeigt kaum Zeichnung.', [
      c('Goldene Stunde', 'sunpath', 'Kurz nach Sonnenaufgang und vor Sonnenuntergang steht die Sonne tief. Das Licht ist wärmer und weicher, Schatten werden lang. Zur Mittagszeit fällt das Licht steil ein und wirkt hart.'),
      c('Hartes vs. weiches Licht', 'hardsoft', 'Entscheidend ist die Größe der Lichtquelle im Verhältnis zum Motiv: Eine kleine, direkte Quelle (pralle Sonne) erzeugt harte, scharf begrenzte Schatten. Eine große, diffuse Quelle (Wolkendecke, Softbox, Fenster) erzeugt weiche Übergänge.'),
      c('Gegenlicht', 'backlight', 'Die Lichtquelle liegt hinter dem Motiv. Das ergibt Silhouetten, leuchtende Haare oder Lichtkanten – aber auch hohe Kontraste und mögliche Blendenflecken.'),
    ], ['Das Motiv mit Gegenlicht bewusst als Silhouette inszenieren – oder den Vordergrund aufhellen.', 'Zur goldenen Stunde fotografieren: Zeiten liefert jede Sonnenstand-App.', 'Bei hohem Kontrast eine Belichtungsreihe (HDR) machen.'],
    'Welche Lichtquelle erzeugt das weichste Licht auf einem Porträt?', ['Pralle Mittagssonne', 'Ein großes Fenster mit bedecktem Himmel', 'Ein kleiner Aufsteckblitz direkt auf der Kamera'], 1, 'Je größer die Lichtquelle relativ zum Motiv, desto weicher das Licht.'),
    L('fokus', 'Fokus & Schärfe', 'Die Bergsilhouette ist scharf, die Schärfentiefe passt gut zur Landschaft. Am Bildrand ist leichte Unschärfe erkennbar – typisch für eine weit offene Blende oder ein Smartphone-Weitwinkel.', [
      c('Blende', 'aperture', 'Die Blendenzahl (f/1.8, f/8 …) beschreibt die Öffnung des Objektivs. Kleine Zahl = große Öffnung = mehr Licht und wenig Schärfentiefe. Große Zahl = kleine Öffnung = mehr Bereich scharf.'),
      c('Schärfentiefe', 'dof', 'Der Bereich vor und hinter dem Fokuspunkt, der noch scharf wirkt. Er hängt von Blende, Brennweite, Abstand zum Motiv und Sensorgröße ab. Landschaft: eher f/8–f/11. Porträt mit unscharfem Hintergrund: f/1.8–f/2.8.'),
      c('Verschlusszeit & ISO', 'triangle', 'Lange Verschlusszeiten verwackeln aus der Hand. Faustregel (Vollformat): mindestens 1/Brennweite, also bei 50 mm ca. 1/50 s. Höhere ISO macht die Kamera lichtempfindlicher, erzeugt aber mehr Bildrauschen.'),
    ], ['Für Landschaften f/8 nutzen und auf etwa ein Drittel der Bildtiefe fokussieren.', 'Am Handy aufs Motiv tippen, um den Fokus zu setzen.', 'Bei wenig Licht abstützen oder ein Stativ nutzen statt die ISO stark zu erhöhen.'],
    'Du willst ein Porträt mit stark unscharfem Hintergrund. Welche Blende wählst du?', ['f/1.8', 'f/8', 'f/16'], 0, 'Eine offene Blende (kleine Blendenzahl) ergibt geringe Schärfentiefe.'),
    L('belichtung', 'Belichtung', 'Die Lichter rund um die Sonne sind ausgefressen: Dort sind keine Details mehr vorhanden (rechter Rand des Histogramms). Gleichzeitig sind die Schatten im Vordergrund sehr dunkel. Der Dynamikumfang der Szene war größer als der des Sensors.', [
      c('Belichtungsdreieck', 'triangle', 'Blende, Verschlusszeit und ISO bestimmen gemeinsam die Helligkeit. Eine volle Stufe (1 EV) verdoppelt oder halbiert die Lichtmenge – z. B. von 1/250 s auf 1/125 s.'),
      c('Histogramm & Clipping', 'histo', 'Das Histogramm zeigt die Helligkeitsverteilung von Tiefen (links) bis Lichtern (rechts). Ein Berg, der rechts am Rand anstößt, bedeutet ausgefressene Lichter – diese Details sind verloren.'),
    ], ['Belichtungskorrektur auf −0,3 bis −0,7 EV stellen, wenn die Sonne im Bild ist.', 'Am Handy nach dem Fokussieren den Sonnen-Regler nach unten ziehen.', 'Im RAW-Format fotografieren: mehr Reserven in Lichtern und Tiefen.'],
    'Was bedeutet eine Belichtungskorrektur von +1 EV?', ['Doppelt so viel Licht', 'Halb so viel Licht', '10 % mehr Licht'], 0, '+1 EV verdoppelt die Lichtmenge, −1 EV halbiert sie.'),
    L('farbe', 'Farbe', 'Warme Orange- und Goldtöne im Himmel bilden einen harmonischen Kontrast zum kühlen Blau der Schatten. Ein Modell bemängelt einen leichten Magenta-Stich in den Wolken – ein Fall für den Weißabgleich (Tönung).', [
      c('Farbtemperatur & Weißabgleich', 'kelvin', 'Licht hat eine Farbtemperatur in Kelvin: Glühlampen um 2.700 K (warm), Tageslicht um 5.500 K, Schatten um 7.000 K und mehr (kühl). Der Weißabgleich gleicht das aus – oder verstärkt bewusst eine Stimmung.'),
      c('Farbharmonie', 'wheel', 'Komplementärfarben liegen sich im Farbkreis gegenüber (Orange–Blau, Rot–Grün) und erzeugen starke Kontraste. Benachbarte Farben (analog) wirken ruhig und harmonisch.'),
    ], ['Den Regler „Dynamik“ statt „Sättigung“ nutzen – er schont Hauttöne.', 'Farbstiche mit dem Tönungs-Regler (Grün–Magenta) korrigieren.', 'Wenige, bewusst gewählte Farben wirken edler als viele bunte.'],
    'Ein Foto im Schatten wirkt bläulich. Wie korrigierst du das im Weißabgleich?', ['Regler Richtung Blau (kühler)', 'Regler Richtung Gelb/Orange (wärmer)', 'Sättigung erhöhen'], 1, 'Ein wärmerer Weißabgleich gleicht den Blaustich des Schattenlichts aus.'),
    L('wirkung', 'Bildwirkung', 'Das Bild transportiert eine ruhige, fast meditative Stimmung. Was ihm fehlt, ist ein klarer Ankerpunkt: Neben der Sonne gibt es kein eindeutiges Hauptmotiv, das eine Geschichte erzählt – etwa eine Person, ein Baum oder eine Hütte.', [
      c('Klares Hauptmotiv', 'focal', 'Starke Fotos beantworten die Frage „Was ist das Motiv?“ sofort. Alles, was davon ablenkt, darf weg – durch Näher-Herangehen, Zuschnitt oder eine andere Perspektive.'),
      c('Geschichte & Emotion', 'backlight', 'Menschen, Bewegung oder Wetter (Nebel, Regen, Sturm) verleihen Bildern Spannung. Frag dich: Welches Gefühl soll das Bild auslösen – und unterstützt jedes Element dieses Gefühl?'),
    ], ['Ein menschliches Element einbauen – es gibt außerdem einen Größenvergleich.', 'Vor dem Auslösen den Bildrand auf störende Objekte prüfen.', 'Dasselbe Motiv bei anderem Wetter oder zu einer anderen Tageszeit erneut fotografieren.'],
    'Was stärkt die Wirkung eines Bildes meistens am meisten?', ['Möglichst viele Elemente zeigen', 'Ein klares Hauptmotiv ohne Ablenkungen', 'Einen starken Filter verwenden'], 1, 'Reduktion auf ein klares Motiv macht Bilder lesbarer und kraftvoller.'),
  ];
  const en = [
    L('aufbau', 'Composition', 'The ridge sits almost exactly on the lower third and the sun is near an intersection — that feels balanced. Points come off for the slightly tilted horizon (about 2°) and the empty foreground, which takes depth away.', [
      c('Rule of thirds', 'thirds', 'Divide the frame with two horizontal and two vertical lines into nine fields. Important subjects on the lines or intersections usually feel stronger than in the centre. Place the horizon in the upper or lower third, depending on whether sky or land matters more.'),
      c('Golden ratio', 'golden', 'A split of about 1 : 1.618. The lines sit near 38% and 62%, a little closer to the centre than the thirds. The rule of thirds is a simplified version of it.'),
      c('Leading lines', 'lines', 'Paths, rivers, fences or shores lead the eye through the frame — ideally toward the main subject.'),
      c('Fore-, middle and background', 'depth', 'Something in the foreground (a stone, flower, branch) creates depth. Symmetry — reflections in a lake, for example — may be centred on purpose.'),
    ], ['Turn on the grid in the camera app.', 'Straighten the horizon when you shoot or when you crop.', 'For more depth, get lower and include a foreground.'],
    'The sky is your most interesting subject. Where do you place the horizon?', ['In the upper third', 'Exactly in the middle', 'In the lower third'], 2, 'In the lower third — the sky then gets two thirds of the frame.'),
    L('licht', 'Light', 'The photo was made with the sun low: warm, grazing light creates a strong mood. Because you shoot straight into the sun (backlight), the foreground falls into shadow and shows little detail.', [
      c('Golden hour', 'sunpath', 'Just after sunrise and before sunset the sun is low. Light is warmer and softer, shadows grow long. At noon the light falls steeply and looks hard.'),
      c('Hard vs soft light', 'hardsoft', 'What matters is the size of the light source relative to the subject. A small, direct source (bare sun) makes hard, sharp shadows. A large, diffuse source (cloud, softbox, window) makes soft transitions.'),
      c('Backlight', 'backlight', 'The light sits behind the subject. That gives silhouettes, glowing hair or rim light — and also high contrast and possible flare.'),
    ], ['Use backlight on purpose as a silhouette — or lift the foreground.', 'Shoot in the golden hour: any sun-position app gives the times.', 'With high contrast, shoot a bracket (HDR).'],
    'Which light source makes the softest light on a portrait?', ['Harsh midday sun', 'A large window under an overcast sky', 'A small flash aimed straight from the camera'], 1, 'The larger the light source relative to the subject, the softer the light.'),
    L('fokus', 'Focus & sharpness', 'The mountain silhouette is sharp and the depth of field suits a landscape. The edges are slightly soft — typical of a wide-open aperture or a phone wide-angle.', [
      c('Aperture', 'aperture', 'The f-number (f/1.8, f/8 …) describes how open the lens is. A small number means a wide opening: more light and less depth of field. A large number means a small opening: more of the scene sharp.'),
      c('Depth of field', 'dof', 'The zone in front of and behind the focus point that still looks sharp. It depends on aperture, focal length, distance and sensor size. Landscape: around f/8–f/11. Portrait with a blurred background: f/1.8–f/2.8.'),
      c('Shutter speed & ISO', 'triangle', 'Long shutter speeds blur when you shoot handheld. A rule of thumb (full frame): at least 1/focal length, so about 1/50 s at 50 mm. Higher ISO makes the camera more sensitive but adds noise.'),
    ], ['For landscapes use f/8 and focus about one third into the scene.', 'On a phone, tap the subject to set focus.', 'In low light, brace yourself or use a tripod instead of pushing ISO hard.'],
    'You want a portrait with a strongly blurred background. Which aperture do you choose?', ['f/1.8', 'f/8', 'f/16'], 0, 'A wide aperture (small f-number) gives shallow depth of field.'),
    L('belichtung', 'Exposure', 'Highlights around the sun are blown: no detail is left there (the right edge of the histogram). At the same time the foreground shadows are very dark. The scene had more dynamic range than the sensor.', [
      c('Exposure triangle', 'triangle', 'Aperture, shutter speed and ISO together set the brightness. One full stop (1 EV) doubles or halves the light — for example from 1/250 s to 1/125 s.'),
      c('Histogram & clipping', 'histo', 'The histogram shows brightness from shadows (left) to highlights (right). A peak that hits the right edge means blown highlights — that detail is gone.'),
    ], ['Set exposure compensation to −0.3 to −0.7 EV when the sun is in the frame.', 'On a phone, after focusing, drag the sun slider down.', 'Shoot RAW: more reserve in highlights and shadows.'],
    'What does an exposure compensation of +1 EV mean?', ['Twice as much light', 'Half as much light', '10% more light'], 0, '+1 EV doubles the light, −1 EV halves it.'),
    L('farbe', 'Colour', 'Warm orange and gold in the sky contrast harmoniously with the cool blue of the shadows. One model notes a slight magenta cast in the clouds — a job for white balance (tint).', [
      c('Colour temperature & white balance', 'kelvin', 'Light has a colour temperature in kelvin: tungsten around 2,700 K (warm), daylight around 5,500 K, shade around 7,000 K and up (cool). White balance corrects that — or strengthens a mood on purpose.'),
      c('Colour harmony', 'wheel', 'Complementary colours sit opposite each other on the wheel (orange–blue, red–green) and make strong contrast. Neighbouring colours (analogous) feel calm and harmonious.'),
    ], ['Use Vibrance rather than Saturation — it is gentler on skin tones.', 'Correct colour casts with the tint slider (green–magenta).', 'A few chosen colours look richer than many bright ones.'],
    'A photo in the shade looks blue. How do you correct that with white balance?', ['Slider toward blue (cooler)', 'Slider toward yellow/orange (warmer)', 'Increase saturation'], 1, 'A warmer white balance offsets the blue cast of shade.'),
    L('wirkung', 'Impact', 'The picture carries a quiet, almost meditative mood. What it lacks is a clear anchor: besides the sun there is no obvious subject that tells a story — a person, a tree or a hut.', [
      c('A clear subject', 'focal', 'Strong photos answer “what is this about?” at once. Anything that distracts can go — by moving closer, cropping or changing the viewpoint.'),
      c('Story & emotion', 'backlight', 'People, movement or weather (fog, rain, storm) add tension. Ask which feeling the picture should create — and whether every element supports it.'),
    ], ['Add a human element — it also gives a sense of scale.', 'Before you shoot, check the edges for distractions.', 'Photograph the same subject in different weather or at another time of day.'],
    'What usually strengthens a picture the most?', ['Showing as many elements as possible', 'One clear subject without distractions', 'Using a strong filter'], 1, 'Reducing a picture to one clear subject makes it easier to read and stronger.'),
  ];
  const it = [
    L('aufbau', 'Composizione', 'Il crinale cade quasi sulla terza linea inferiore e il sole è vicino a un incrocio dei terzi: l’insieme è equilibrato. Tolgono punti l’orizzonte un po’ storto (circa 2°) e il primo piano vuoto, che toglie profondità.', [
      c('Regola dei terzi', 'thirds', 'Dividi l’inquadratura con due linee orizzontali e due verticali in nove campi. I soggetti importanti sulle linee o sugli incroci di solito funzionano meglio che al centro. L’orizzonte va nel terzo alto o basso, a seconda che conti di più il cielo o il paesaggio.'),
      c('Sezione aurea', 'golden', 'Rapporto di circa 1 : 1,618. Le linee stanno intorno al 38% e al 62%, un po’ più vicine al centro dei terzi. La regola dei terzi ne è una versione semplificata.'),
      c('Linee guida', 'lines', 'Sentieri, fiumi, staccionate o rive conducono lo sguardo nell’immagine, idealmente verso il soggetto principale.'),
      c('Primo piano, piano medio e sfondo', 'depth', 'Un elemento in primo piano (pietra, fiore, ramo) crea profondità. La simmetria, per esempio un riflesso nel lago, può invece essere centrata di proposito.'),
    ], ['Attiva la griglia nell’app della fotocamera.', 'Raddrizza l’orizzonte allo scatto o nel ritaglio.', 'Per più profondità abbassati e includi un primo piano.'],
    'Il cielo è il soggetto più interessante. Dove metti l’orizzonte?', ['Nel terzo superiore', 'Esattamente al centro', 'Nel terzo inferiore'], 2, 'Nel terzo inferiore: il cielo occupa così due terzi dell’inquadratura.'),
    L('licht', 'Luce', 'La foto è nata con il sole basso: la luce calda e radente crea atmosfera. Perché scatti dritto verso il sole (controluce), il primo piano resta in ombra e ha pochi dettagli.', [
      c('Ora d’oro', 'sunpath', 'Subito dopo l’alba e prima del tramonto il sole è basso. La luce è più calda e morbida, le ombre si allungano. A mezzogiorno la luce cade ripida e risulta dura.'),
      c('Luce dura e luce morbida', 'hardsoft', 'Conta la dimensione della sorgente rispetto al soggetto. Una sorgente piccola e diretta (sole pieno) fa ombre dure e nette. Una sorgente grande e diffusa (nuvole, softbox, finestra) fa passaggi morbidi.'),
      c('Controluce', 'backlight', 'La luce sta dietro al soggetto. Nascono silhouette, capelli luminosi o un bordo di luce, ma anche contrasto alto e possibili flare.'),
    ], ['Usa il controluce di proposito come silhouette, oppure schiarisci il primo piano.', 'Scatta nell’ora d’oro: gli orari li dà qualsiasi app del sole.', 'Con molto contrasto fai una serie di esposizioni (HDR).'],
    'Quale sorgente dà la luce più morbida su un ritratto?', ['Sole pieno di mezzogiorno', 'Una grande finestra con cielo coperto', 'Un piccolo flash puntato dalla fotocamera'], 1, 'Più la sorgente è grande rispetto al soggetto, più la luce è morbida.'),
    L('fokus', 'Fuoco e nitidezza', 'La silhouette della montagna è nitida e la profondità di campo va bene per un paesaggio. Ai bordi c’è una leggera sfocatura, tipica di un diaframma molto aperto o di un grandangolo da telefono.', [
      c('Diaframma', 'aperture', 'Il numero f (f/1.8, f/8 …) descrive l’apertura dell’obiettivo. Numero piccolo = apertura grande = più luce e poca profondità di campo. Numero grande = apertura piccola = più scena a fuoco.'),
      c('Profondità di campo', 'dof', 'La zona davanti e dietro al punto di fuoco che resta nitida. Dipende da diaframma, focale, distanza e dimensione del sensore. Paesaggio: circa f/8–f/11. Ritratto con sfondo sfocato: f/1.8–f/2.8.'),
      c('Tempo e ISO', 'triangle', 'Tempi lunghi mosso a mano libera. Regola pratica (pieno formato): almeno 1/focale, quindi circa 1/50 s a 50 mm. ISO alti rendono la fotocamera più sensibile ma aggiungono rumore.'),
    ], ['Per i paesaggi usa f/8 e metti a fuoco circa a un terzo della profondità.', 'Sul telefono tocca il soggetto per mettere a fuoco.', 'Con poca luce appoggiati o usa un treppiede invece di alzare molto gli ISO.'],
    'Vuoi un ritratto con lo sfondo molto sfocato. Quale diaframma scegli?', ['f/1.8', 'f/8', 'f/16'], 0, 'Un diaframma aperto (numero f piccolo) dà poca profondità di campo.'),
    L('belichtung', 'Esposizione', 'Le luci intorno al sole sono bruciate: lì non restano dettagli (bordo destro dell’istogramma). Allo stesso tempo le ombre in primo piano sono molto scure. La scena aveva più gamma dinamica del sensore.', [
      c('Triangolo dell’esposizione', 'triangle', 'Diaframma, tempo e ISO decidono insieme la luminosità. Uno stop intero (1 EV) raddoppia o dimezza la luce, per esempio da 1/250 s a 1/125 s.'),
      c('Istogramma e clipping', 'histo', 'L’istogramma mostra la luminosità dalle ombre (a sinistra) alle luci (a destra). Un picco che tocca il bordo destro significa luci bruciate: quel dettaglio è perso.'),
    ], ['Metti la compensazione tra −0,3 e −0,7 EV se il sole è nell’inquadratura.', 'Sul telefono, dopo il fuoco, abbassa il cursore del sole.', 'Scatta in RAW: più riserva nelle luci e nelle ombre.'],
    'Cosa significa una compensazione di +1 EV?', ['Il doppio della luce', 'Metà luce', 'Il 10% di luce in più'], 0, '+1 EV raddoppia la luce, −1 EV la dimezza.'),
    L('farbe', 'Colore', 'Arancio e oro caldi nel cielo contrastano in modo armonico con il blu freddo delle ombre. Un modello nota una leggera dominante magenta nelle nuvole: è un caso per il bilanciamento del bianco (tinta).', [
      c('Temperatura colore e bilanciamento', 'kelvin', 'La luce ha una temperatura in kelvin: lampadine intorno a 2.700 K (caldo), luce diurna intorno a 5.500 K, ombra da 7.000 K in su (freddo). Il bilanciamento corregge, oppure rafforza di proposito un’atmosfera.'),
      c('Armonia dei colori', 'wheel', 'I complementari stanno uno di fronte all’altro (arancio–blu, rosso–verde) e creano contrasti forti. I colori vicini (analoghi) risultano calmi e armoniosi.'),
    ], ['Usa Vividezza invece di Saturazione: rispetta di più gli incarnati.', 'Correggi le dominanti con il cursore tinta (verde–magenta).', 'Pochi colori scelti risultano più eleganti di tanti colori accesi.'],
    'Una foto in ombra è bluastra. Come la correggi nel bilanciamento?', ['Cursore verso il blu (più freddo)', 'Cursore verso giallo/arancio (più caldo)', 'Aumentare la saturazione'], 1, 'Un bilanciamento più caldo compensa il blu della luce in ombra.'),
    L('wirkung', 'Impatto', 'L’immagine ha un’atmosfera quieta, quasi meditativa. Manca un ancoraggio chiaro: oltre al sole non c’è un soggetto evidente che racconti una storia, per esempio una persona, un albero o una baita.', [
      c('Un soggetto chiaro', 'focal', 'Le foto forti rispondono subito a «qual è il soggetto?». Tutto ciò che distrae può sparire: avvicinandoti, ritagliando o cambiando punto di vista.'),
      c('Storia ed emozione', 'backlight', 'Persone, movimento o meteo (nebbia, pioggia, temporale) danno tensione. Chiediti quale sentimento deve nascere e se ogni elemento lo sostiene.'),
    ], ['Inserisci un elemento umano: dà anche una scala.', 'Prima dello scatto controlla i bordi in cerca di distrazioni.', 'Rifotografa lo stesso soggetto con un altro tempo o a un’altra ora.'],
    'Cosa rafforza di solito di più un’immagine?', ['Mostrare più elementi possibile', 'Un soggetto chiaro senza distrazioni', 'Usare un filtro forte'], 1, 'Ridurre a un soggetto chiaro rende le foto più leggibili e più forti.'),
  ];
  const fr = [
    L('aufbau', 'Composition', 'La crête tombe presque sur le tiers inférieur et le soleil est près d’une intersection — l’ensemble est équilibré. Des points partent pour l’horizon un peu penché (environ 2°) et le premier plan vide, qui enlève de la profondeur.', [
      c('Règle des tiers', 'thirds', 'Divise l’image avec deux lignes horizontales et deux verticales en neuf cases. Les sujets importants sur les lignes ou les intersections sont en général plus forts qu’au centre. Place l’horizon dans le tiers haut ou bas, selon que le ciel ou le paysage compte le plus.'),
      c('Nombre d’or', 'golden', 'Un rapport d’environ 1 : 1,618. Les lignes sont vers 38 % et 62 %, un peu plus près du centre que les tiers. La règle des tiers en est une version simplifiée.'),
      c('Lignes directrices', 'lines', 'Chemins, rivières, clôtures ou rives conduisent le regard dans l’image — idéalement vers le sujet principal.'),
      c('Avant-plan, plan moyen et arrière-plan', 'depth', 'Un élément au premier plan (pierre, fleur, branche) crée de la profondeur. La symétrie — un reflet dans un lac, par exemple — peut être centrée exprès.'),
    ], ['Active la grille dans l’appli photo.', 'Redresse l’horizon à la prise de vue ou au recadrage.', 'Pour plus de profondeur, baisse-toi et inclus un premier plan.'],
    'Le ciel est ton sujet le plus intéressant. Où places-tu l’horizon ?', ['Dans le tiers supérieur', 'Exactement au milieu', 'Dans le tiers inférieur'], 2, 'Dans le tiers inférieur — le ciel occupe alors deux tiers du cadre.'),
    L('licht', 'Lumière', 'La photo a été faite soleil bas : la lumière chaude et rasante crée une belle ambiance. Comme tu photographies face au soleil (contre-jour), le premier plan tombe dans l’ombre et montre peu de détail.', [
      c('Heure dorée', 'sunpath', 'Juste après le lever et avant le coucher, le soleil est bas. La lumière est plus chaude et plus douce, les ombres s’allongent. À midi elle tombe à pic et paraît dure.'),
      c('Lumière dure et douce', 'hardsoft', 'Ce qui compte, c’est la taille de la source par rapport au sujet. Une petite source directe (soleil franc) fait des ombres dures et nettes. Une grande source diffuse (nuages, softbox, fenêtre) fait des transitions douces.'),
      c('Contre-jour', 'backlight', 'La lumière est derrière le sujet. Cela donne des silhouettes, des cheveux lumineux ou un liseré — et aussi un fort contraste et parfois du flare.'),
    ], ['Assume le contre-jour comme silhouette — ou débouche le premier plan.', 'Photographie à l’heure dorée : une appli de position du soleil donne les heures.', 'Avec un fort contraste, fais une fourchette (HDR).'],
    'Quelle source donne la lumière la plus douce sur un portrait ?', ['Plein soleil de midi', 'Une grande fenêtre sous un ciel couvert', 'Un petit flash dirigé depuis l’appareil'], 1, 'Plus la source est grande par rapport au sujet, plus la lumière est douce.'),
    L('fokus', 'Mise au point et netteté', 'La silhouette de la montagne est nette et la profondeur de champ convient à un paysage. Les bords sont un peu mous — typique d’une grande ouverture ou d’un grand-angle de téléphone.', [
      c('Ouverture', 'aperture', 'Le nombre f (f/1,8, f/8 …) décrit l’ouverture de l’objectif. Petit nombre = grande ouverture = plus de lumière et peu de profondeur de champ. Grand nombre = petite ouverture = plus de netteté dans la scène.'),
      c('Profondeur de champ', 'dof', 'La zone devant et derrière le point de mise au point qui reste nette. Elle dépend de l’ouverture, de la focale, de la distance et de la taille du capteur. Paysage : plutôt f/8–f/11. Portrait à fond flou : f/1,8–f/2,8.'),
      c('Vitesse et ISO', 'triangle', 'Les vitesses lentes bougent à main levée. Règle simple (plein format) : au moins 1/focale, donc environ 1/50 s à 50 mm. Un ISO plus haut rend l’appareil plus sensible mais ajoute du bruit.'),
    ], ['Pour les paysages, utilise f/8 et fais le point vers un tiers de la profondeur.', 'Sur le téléphone, touche le sujet pour faire le point.', 'Par faible lumière, cale-toi ou utilise un trépied plutôt que de monter fort les ISO.'],
    'Tu veux un portrait au fond très flou. Quelle ouverture choisis-tu ?', ['f/1,8', 'f/8', 'f/16'], 0, 'Une grande ouverture (petit nombre f) donne une faible profondeur de champ.'),
    L('belichtung', 'Exposition', 'Les hautes lumières autour du soleil sont brûlées : plus de détail à cet endroit (bord droit de l’histogramme). En même temps les ombres du premier plan sont très sombres. La scène avait plus de dynamique que le capteur.', [
      c('Triangle d’exposition', 'triangle', 'Ouverture, vitesse et ISO règlent ensemble la luminosité. Un IL entier (1 EV) double ou divise par deux la lumière — par exemple de 1/250 s à 1/125 s.'),
      c('Histogramme et écrêtage', 'histo', 'L’histogramme montre la luminosité des ombres (à gauche) aux hautes lumières (à droite). Un pic qui touche le bord droit signifie des hautes lumières brûlées : ce détail est perdu.'),
    ], ['Mets la correction d’exposition entre −0,3 et −0,7 IL quand le soleil est dans le cadre.', 'Sur le téléphone, après la mise au point, baisse le curseur soleil.', 'Photographie en RAW : plus de réserve dans les lumières et les ombres.'],
    'Que signifie une correction d’exposition de +1 IL ?', ['Deux fois plus de lumière', 'Deux fois moins de lumière', '10 % de lumière en plus'], 0, '+1 IL double la lumière, −1 IL la divise par deux.'),
    L('farbe', 'Couleur', 'Les oranges et ors chauds du ciel contrastent de façon harmonieuse avec le bleu froid des ombres. Un modèle note une légère dominante magenta dans les nuages — un cas pour la balance des blancs (teinte).', [
      c('Température de couleur et balance', 'kelvin', 'La lumière a une température en kelvins : tungstène vers 2 700 K (chaud), lumière du jour vers 5 500 K, ombre vers 7 000 K et plus (froid). La balance corrige cela — ou renforce une ambiance exprès.'),
      c('Harmonie des couleurs', 'wheel', 'Les complémentaires se font face (orange–bleu, rouge–vert) et créent de forts contrastes. Les couleurs voisines (analogues) paraissent calmes et harmonieuses.'),
    ], ['Utilise Vibrance plutôt que Saturation — c’est plus doux pour les peaux.', 'Corrige les dominantes avec le curseur de teinte (vert–magenta).', 'Quelques couleurs choisies valent mieux que beaucoup de couleurs vives.'],
    'Une photo à l’ombre tire vers le bleu. Comment corriges-tu cela à la balance des blancs ?', ['Curseur vers le bleu (plus froid)', 'Curseur vers le jaune/orange (plus chaud)', 'Augmenter la saturation'], 1, 'Une balance plus chaude compense le bleu de la lumière d’ombre.'),
    L('wirkung', 'Impact', 'L’image porte une ambiance calme, presque méditative. Il lui manque un ancrage clair : à part le soleil, pas de sujet évident qui raconte une histoire — une personne, un arbre ou une cabane.', [
      c('Un sujet clair', 'focal', 'Les photos fortes répondent tout de suite à « quel est le sujet ? ». Tout ce qui distrait peut partir — en se rapprochant, en recadrant ou en changeant de point de vue.'),
      c('Histoire et émotion', 'backlight', 'Les gens, le mouvement ou la météo (brouillard, pluie, orage) ajoutent de la tension. Demande-toi quel sentiment l’image doit créer — et si chaque élément le sert.'),
    ], ['Ajoute un élément humain — cela donne aussi une échelle.', 'Avant de déclencher, vérifie les bords pour les éléments gênants.', 'Rephotographie le même sujet par un autre temps ou à une autre heure.'],
    'Qu’est-ce qui renforce le plus souvent une image ?', ['Montrer le plus d’éléments possible', 'Un sujet clair sans distractions', 'Utiliser un filtre fort'], 1, 'Réduire à un sujet clair rend les images plus lisibles et plus fortes.'),
  ];
  const es = [
    L('aufbau', 'Composición', 'La cresta cae casi en el tercio inferior y el sol está cerca de un cruce: el conjunto se siente equilibrado. Restan puntos el horizonte algo torcido (unos 2°) y el primer plano vacío, que quita profundidad.', [
      c('Regla de los tercios', 'thirds', 'Divide el encuadre con dos líneas horizontales y dos verticales en nueve campos. Los motivos importantes en las líneas o los cruces suelen funcionar mejor que en el centro. El horizonte va en el tercio alto o bajo, según importe más el cielo o el paisaje.'),
      c('Proporción áurea', 'golden', 'Una división de unos 1 : 1,618. Las líneas quedan cerca del 38 % y el 62 %, un poco más cerca del centro que los tercios. La regla de los tercios es una versión simplificada.'),
      c('Líneas de dirección', 'lines', 'Caminos, ríos, vallas u orillas conducen la mirada por la imagen, idealmente hacia el motivo principal.'),
      c('Primer plano, plano medio y fondo', 'depth', 'Un elemento en primer plano (piedra, flor, rama) crea profundidad. La simetría, por ejemplo un reflejo en el lago, puede centrarse a propósito.'),
    ], ['Activa la cuadrícula en la app de la cámara.', 'Endereza el horizonte al disparar o al recortar.', 'Para más profundidad, agáchate e incluye un primer plano.'],
    'El cielo es tu motivo más interesante. ¿Dónde colocas el horizonte?', ['En el tercio superior', 'Justo en el centro', 'En el tercio inferior'], 2, 'En el tercio inferior: el cielo ocupa así dos tercios del encuadre.'),
    L('licht', 'Luz', 'La foto se hizo con el sol bajo: la luz cálida y rasante crea ambiente. Como disparas de frente al sol (contraluz), el primer plano cae en sombra y muestra poco detalle.', [
      c('Hora dorada', 'sunpath', 'Justo después del amanecer y antes del atardecer el sol está bajo. La luz es más cálida y suave, las sombras se alargan. Al mediodía cae en picado y se ve dura.'),
      c('Luz dura y luz suave', 'hardsoft', 'Importa el tamaño de la fuente respecto al motivo. Una fuente pequeña y directa (sol pleno) hace sombras duras y nítidas. Una fuente grande y difusa (nubes, softbox, ventana) hace transiciones suaves.'),
      c('Contraluz', 'backlight', 'La luz está detrás del motivo. Da siluetas, pelo luminoso o un borde de luz, y también mucho contraste y posibles destellos.'),
    ], ['Usa el contraluz a propósito como silueta, o aclara el primer plano.', 'Dispara en la hora dorada: cualquier app del sol da las horas.', 'Con mucho contraste, haz una horquilla (HDR).'],
    '¿Qué fuente da la luz más suave en un retrato?', ['Sol pleno del mediodía', 'Una ventana grande con cielo cubierto', 'Un flash pequeño apuntando desde la cámara'], 1, 'Cuanto más grande es la fuente respecto al motivo, más suave es la luz.'),
    L('fokus', 'Enfoque y nitidez', 'La silueta de la montaña está nítida y la profundidad de campo encaja con un paisaje. En los bordes hay un ligero desenfoque, típico de una apertura muy abierta o de un gran angular de móvil.', [
      c('Apertura', 'aperture', 'El número f (f/1,8, f/8 …) describe la abertura del objetivo. Número pequeño = abertura grande = más luz y poca profundidad de campo. Número grande = abertura pequeña = más escena nítida.'),
      c('Profundidad de campo', 'dof', 'La zona delante y detrás del punto de enfoque que sigue viéndose nítida. Depende de la apertura, la focal, la distancia y el tamaño del sensor. Paisaje: alrededor de f/8–f/11. Retrato con fondo desenfocado: f/1,8–f/2,8.'),
      c('Velocidad e ISO', 'triangle', 'Las velocidades largas se mueven a pulso. Regla práctica (formato completo): al menos 1/focal, así unos 1/50 s a 50 mm. Un ISO alto hace la cámara más sensible pero añade ruido.'),
    ], ['Para paisajes usa f/8 y enfoca hacia un tercio de la profundidad.', 'En el móvil, toca el motivo para enfocar.', 'Con poca luz, apóyate o usa un trípode en lugar de subir mucho el ISO.'],
    'Quieres un retrato con el fondo muy desenfocado. ¿Qué apertura eliges?', ['f/1,8', 'f/8', 'f/16'], 0, 'Una apertura amplia (número f pequeño) da poca profundidad de campo.'),
    L('belichtung', 'Exposición', 'Las luces alrededor del sol están quemadas: ahí no queda detalle (borde derecho del histograma). A la vez las sombras del primer plano están muy oscuras. La escena tenía más rango dinámico que el sensor.', [
      c('Triángulo de exposición', 'triangle', 'Apertura, velocidad e ISO deciden juntos el brillo. Un paso entero (1 EV) duplica o reduce a la mitad la luz, por ejemplo de 1/250 s a 1/125 s.'),
      c('Histograma y recorte', 'histo', 'El histograma muestra el brillo de las sombras (izquierda) a las luces (derecha). Un pico que toca el borde derecho significa luces quemadas: ese detalle se ha perdido.'),
    ], ['Pon la compensación entre −0,3 y −0,7 EV si el sol está en el encuadre.', 'En el móvil, tras enfocar, baja el control del sol.', 'Dispara en RAW: más reserva en luces y sombras.'],
    '¿Qué significa una compensación de +1 EV?', ['El doble de luz', 'La mitad de luz', 'Un 10 % más de luz'], 0, '+1 EV duplica la luz, −1 EV la reduce a la mitad.'),
    L('farbe', 'Color', 'Los naranjas y oros cálidos del cielo contrastan de forma armónica con el azul frío de las sombras. Un modelo nota un ligero tono magenta en las nubes: es un caso para el balance de blancos (matiz).', [
      c('Temperatura de color y balance', 'kelvin', 'La luz tiene una temperatura en kelvin: tungsteno unos 2.700 K (cálido), luz de día unos 5.500 K, sombra desde 7.000 K (frío). El balance lo corrige, o refuerza un ambiente a propósito.'),
      c('Armonía de color', 'wheel', 'Los complementarios están enfrentados (naranja–azul, rojo–verde) y crean contrastes fuertes. Los colores vecinos (análogos) se ven calmados y armónicos.'),
    ], ['Usa Intensidad en lugar de Saturación: respeta mejor los tonos de piel.', 'Corrige las dominantes con el control de matiz (verde–magenta).', 'Unos pocos colores elegidos lucen más que muchos colores vivos.'],
    'Una foto a la sombra se ve azulada. ¿Cómo lo corriges en el balance de blancos?', ['Control hacia el azul (más frío)', 'Control hacia el amarillo/naranja (más cálido)', 'Subir la saturación'], 1, 'Un balance más cálido compensa el azul de la luz de sombra.'),
    L('wirkung', 'Impacto', 'La imagen transmite un ambiente quieto, casi meditativo. Le falta un ancla clara: aparte del sol no hay un motivo evidente que cuente una historia, por ejemplo una persona, un árbol o una cabaña.', [
      c('Un motivo claro', 'focal', 'Las fotos fuertes responden enseguida a «¿cuál es el motivo?». Todo lo que distrae puede irse: acercándote, recortando o cambiando el punto de vista.'),
      c('Historia y emoción', 'backlight', 'Personas, movimiento o tiempo (niebla, lluvia, tormenta) dan tensión. Pregúntate qué sentimiento debe provocar la imagen y si cada elemento lo apoya.'),
    ], ['Añade un elemento humano: también da escala.', 'Antes de disparar, revisa los bordes en busca de distracciones.', 'Vuelve a fotografiar el mismo motivo con otro tiempo o a otra hora.'],
    '¿Qué suele fortalecer más una imagen?', ['Mostrar el mayor número de elementos', 'Un motivo claro sin distracciones', 'Usar un filtro fuerte'], 1, 'Reducir a un motivo claro hace las fotos más legibles y más fuertes.'),
  ];
  return { de, en, it, fr, es };
});

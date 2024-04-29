 (ns hudon.litcal.transform
   (:require
     [cheshire.core :as json]
     [clj-http.client :as client])
   (:import (java.time Instant LocalDate ZoneId)
            (org.jsoup Jsoup)
            (org.jsoup.nodes Element)))

(defn- transform-with
  "Applies the given function to the map, processing all events, and returning a new {:events events :messages messages} map.
  The function is called with the accumulator, the event key and the event map."
  [f json]
  (reduce #(f %1 (first %2) (second %2)) json (seq (:events json))))

(defn- local-date-from-event
  [event]
  (.toLocalDate (.atZone (Instant/ofEpochSecond (event :date)) (ZoneId/of "UTC"))))

(defn compute-easter-gregorian
  "Returns the date of easter for a given year.
  The algorithm is based on the following website:
  https://en.wikipedia.org/wiki/Date_of_Easter#Anonymous_Gregorian_algorithm
  using the New Scientist correction.
  Also reference https://www.codeproject.com/Articles/10860/Calculating-Christian-Holidays when calculating holidays"
  [year]
  (let [a (mod year 19)
        b (quot year 100)
        c (mod year 100)
        d (quot b 4)
        e (mod b 4)
        g (quot (+ (* 8 b) 13) 25)
        h (mod (+ (- (+ (* 19 a) b) d g) 15) 30)
        i (quot c 4)
        k (mod c 4)
        l (mod (- (+ 32 (* 2 e) (* 2 i)) h k) 7)
        m (quot (+ a (* 11 h) (* 19 l)) 433)
        month (quot (+ (- (+ h l) (* 7 m)) 90) 25)
        day (mod (+ (- (+ h l) (* 7 m)) (* 33 month) 19) 32)]
    {:month month :day day}))

(defn- compute-easter-date
  "returns the date of Easter as a LocalDate"
  [year]
  (let [computed-easter (compute-easter-gregorian year)]
    (LocalDate/of ^int year ^int (computed-easter :month) ^int (computed-easter :day))))

(defn add-seasons-top-level
  "NOTE that this will overwrite existing seasons/years. This is necessary given the other transformations that depend on
 these values being LocalDate's, not strings."
  [json next-year-baptism-date]
  (let [baptism-date (-> json
                         :events
                         :BaptismLord
                         ((fn [ev]
                            (if ev
                              (local-date-from-event ev)
                              (throw (Exception. "No BaptismLord event found"))))))

        int-to-key #(keyword (str %))

        compute-advent-start
        (fn [secular-year]
          (let [nativity-date (LocalDate/of ^int secular-year 12 25)
                sunday-before-nat (.minusDays nativity-date (.getValue (.getDayOfWeek nativity-date)))]
            (.minusWeeks sunday-before-nat 3)))

        ; NOTE: we're assuming the given file is all for the same secular year,
        ; so checking any event's year will do.
        secular-year
        (.getYear (local-date-from-event (second (first (:events json)))))

        compute-lit-year
        (fn [year]
          (let [start-date (compute-advent-start (- year 1))
                end-date (.minusDays (compute-advent-start year) 1)]
            {:startDate start-date :endDate end-date :secular year}))

        lit-years
        (let [next-year (+ 1 secular-year)]
          {(int-to-key secular-year) (compute-lit-year secular-year)
           (int-to-key next-year)    (compute-lit-year next-year)})

        lit-seasons
        (let [christmas-start (LocalDate/of ^int (- secular-year 1) 12 25)
              easter-date (compute-easter-date secular-year)
              next-secular-year (+ 1 secular-year)
              next-advent-start (compute-advent-start secular-year)
              next-christmas-start (LocalDate/of ^int secular-year 12 25)
              vec-to-seasons #(map (fn [[n c sd ed]] {:name n :color c :startDate sd :endDate ed}) %)]
          {(int-to-key secular-year)
           (vec-to-seasons
            [["Christmas" "white" christmas-start baptism-date]
             ["Ordinary Time" "green" (.plusDays baptism-date 1) (.minusDays easter-date 47)]
             ["Lent" "violet" (.minusDays easter-date 46) (.minusDays easter-date 4)]
             ["Paschal Triduum" "red" (.minusDays easter-date 3) (.minusDays easter-date 1)]
             ["Easter" "white" easter-date (.plusDays easter-date 49)]
             ["Ordinary Time" "green" (.plusDays easter-date 50) (.minusDays next-advent-start 1)]])
           (int-to-key next-secular-year)
           (vec-to-seasons
            [["Advent" "violet" next-advent-start (.minusDays next-christmas-start 1)]
             ["Christmas" "white" next-christmas-start next-year-baptism-date]])})]
    (if baptism-date
      (-> json
          (assoc :litYears lit-years)
          (assoc :litSeasons lit-seasons))
      (update json :messages conj "ERROR: No baptism date found, cannot compute seasons."))))

(defn add-urls
  "Takes in the events object of the LCAPI and returns a map of { events: {<event id>: <event map>}, messages: [] }
   Do not overwrite readingUrl if it already exists (may have been manually added)"
  [json]
  (let [base-url "http://bible.usccb.org/bible/readings/"
        to-key #(str (format "%02d" %))]
    (transform-with (fn [acc key event]
                      (let [utcLocalDate (local-date-from-event event)
                            url (str base-url
                                     (to-key (.getValue (.getMonth utcLocalDate)))
                                     (to-key (.getDayOfMonth utcLocalDate))
                                     (subs (str (.getYear utcLocalDate)) 2)
                                     ".cfm")]
                            (if (contains? event :readingsUrl)
                              acc
                              (update acc :events assoc key (assoc event :readingsUrl url))))) json)))


(defn parse-gospel
  "takes the body of a USCCB Daily Readings page and returns a map:
    {:gospel-ref <gospel reference> :gospel-txt <gospel text>} OR {:error <error message>}"
  [html]
  (let [hrs (.select html "h3.name")]
    (if (empty? hrs)
      {:error "Error: No Headers found."}
      (let [gospel-hr (first (filter #(= "gospel" (clojure.string/lower-case
                                                    (clojure.string/trim (.text ^Element %)))) hrs))]
        (if (not gospel-hr)
          {:error "Error: No Gospel Header found."}
          (let [reading-ref-el (.select (.nextElementSibling gospel-hr) "a")]
            (if (empty? reading-ref-el)
              {:error "Error: No Gospel Reference Element found."}
              (let [reading-ref (-> reading-ref-el
                                    (first)
                                    (.text)
                                    ; Some references end with a dot
                                    (clojure.string/replace #"\." "")
                                    (.trim)
                                    ; Ensure the book shorthand is always uppercased (MT, LK, etc.)
                                    (clojure.string/replace #"(^\w{2})" #(clojure.string/upper-case (first %))))]
                                    
                (if (empty? reading-ref)
                  {:error (str "Error: No Gospel Reference found.")}
                  (let [gospel-text (-> gospel-hr
                                        (.parent)
                                        (.nextElementSibling)
                                        (.text)
                                        ; some strings end with a non-breaking-space (char 160), hence the need for the `\h` class
                                        (clojure.string/replace #"(\h|\s)+" " ")
                                        (clojure.string/trim))]
                    (if (empty? gospel-text)
                      {:error (str "Error: No Gospel Text found.")}
                      {:gospelRef reading-ref :gospelText gospel-text})))))))))))


(defn fetch-gospel!
  "Returns the gospel text found at the provided URL
    or an error message if no gospel was found.
    {:gospel-ref gospel-ref :gospel-txt gospel-text} or {:error error-message}"
  [url]
  (let [response (try
                   (client/get url)
                   (catch Exception e {:error (str "HTTPError: " (.getMessage e) " URL: " url " FIX: Fix the URL in the input file and try again.")}))
        parsed (if (not (nil? (:body response)))
                 (parse-gospel (Jsoup/parse (:body response)))
                 {:error "Error: No response body found."})]
    (if (contains? parsed :error)
      {:error (str (parsed :error) " URL: " url)}
      parsed)))


(defn add-gospels
  "This will not overwrite the gospelText if it exists already, to support manual edits.
   Returns:
    {:events events-with-gospels :messages error-messages}"
  [json]
  (transform-with (fn [acc key event]
                    (if (contains? event :gospelRef)
                      acc
                      (let [gospel (fetch-gospel! (event :readingsUrl))]
                        (if (contains? gospel :error)
                          (update acc :messages conj (str (gospel :error) " . Key: " key))
                          (update acc :events assoc key (merge event gospel))))))
                  json))


(defn warn-if-many-refs
  "Goes through the gospelRef and gospelText values and returns warning messages if there are hidden references
  in the text or there are multiple gospel passages."
  [json]
  (let [many-ref-res [{:key :gospelRef :re #"^[a-zA-Z]..*[^\d][a-zA-Z]"
                       :msg "Found many refs in gospelRef."}
                      {:key :gospelText :re #"[^a-zA-Z]O[rR][^a-zA-Z]"
                       :msg "Found many gospels in gospelText."}
                      {:key :gospelText :re #" [Oo]r$"
                       :msg "Found many gospels in gospelText."}
                      {:key :gospelText :re #"\d:"
                       :msg "Found hidden ref in gospel."}]]
    (transform-with
      (fn [acc key event]
        (reduce (fn [acc2 ref-re]
                  ; we stringify the value in case it's missing, so that re-seq gets "" instead of nil
                  (let [matches (re-seq (ref-re :re) (str (get event (ref-re :key))))
                        matches-str (clojure.string/join ", " matches)]
                    (if (seq matches)
                      (update acc2 :messages conj (str "WARNING: " (ref-re :msg) " Event: " key " Matches: '" matches-str "'"))
                      acc2)))
                acc
                many-ref-res))
      json)))

(defn find-missing-events
  "Find dates that only have an optional memorial (we need a fallback event for these and it's missing)"
  [json]
  (let [date-event-counts (reduce (fn [acc event-entry]
                                    (let [event (second event-entry)]
                                      (if (or (#{1 2} (event :grade)) (:isVigilMass event))
                                        (update acc (event :date) (fnil identity 0))
                                        (update acc (event :date) (fnil inc 1)))))
                                  {}
                                  (seq (:events json)))
        dates-with-missing (keys (filter #(= 0 (second %)) date-event-counts))]
    (reduce (fn [acc date] (update acc :messages conj (str "ERROR: Missing fallback ferial celebration for date " date)))
            json
            dates-with-missing)))

(defn find-missing-dates
  "Find dates that are missing from the events. All of a year's dates should be present"
  [json start-str end-str]
  (let [start (java.time.LocalDate/parse start-str)
        end (java.time.LocalDate/parse end-str)
        timestamp->datestr (fn [ts]
                             (-> ts
                                 java.time.Instant/ofEpochSecond
                                 (.atZone (java.time.ZoneId/of "UTC"))
                                 .toLocalDate
                                 .toString))
        dates (set (map #(timestamp->datestr (:date (second %))) (:events json)))
        missing-dates (loop [curr start acc []]
                        (if (.isAfter curr end)
                          acc
                          (let [next (.plusDays curr 1)
                                curr-str (.toString curr)
                                next-acc (if (dates curr-str) acc (conj acc curr-str))]
                            (recur next next-acc))))]
              (reduce (fn [acc date] (update
                                      acc :messages
                                      conj (str "ERROR: Missing date " date)))
                      json
                      missing-dates)))

(defn guess-lit-titles
  "Add litTitle and litSubtitle, remove [ USA ] prefix. In some cases, skip litSubtitle guessing (but guess litTitle anyway) and log a warning."
  [json]
  (let [cannot-guess-res [{:re #"^[^S].*(?i:mary|our lady)" :msg "Found an event for Our Lady."} ; excludes when name starts with Saturday
                          {:re #",.*," :msg "Found an event with many commas."}
                          {:re #"^Saints.*[^a-zA-Z]and[^a-zA-Z]" :msg "Found an event with \"Saints...and\"."}]
        guess-lit-title (fn [acc key event]
                          (if (contains? event :litTitle)
                            acc                             ; skip if we've already guessed the title for this event
                            (let [name (event :name)
                                  lit-name (if (re-find #"^\[" name)
                                             (subs name (+ 2 (.indexOf name "]")))
                                             name)
                                  event-with-lit-name (assoc event :litName lit-name)]
                              ; process the regex' that will skip guessing litSubtitle if there is a match
                              (loop [acc2 acc
                                     res-left cannot-guess-res]
                                (if (not (empty? res-left))
                                  (let [cannot-guess-re (first res-left)]
                                    (if (re-find (cannot-guess-re :re) lit-name)
                                      (-> acc2
                                          (update :messages conj
                                                  (str "WARNING: " (cannot-guess-re :msg) " Skipping subtitle guessing. Event: " key))
                                          (update :events assoc key
                                                  (assoc event-with-lit-name :litTitle lit-name)))
                                      (recur acc2 (rest res-left))))
                                  ; There is no match, we try to guess a subtitle if we find a comma
                                  (let [pos (.indexOf lit-name ",")]
                                    (if (not= -1 pos)
                                      (update acc2 :events assoc key
                                              (assoc event-with-lit-name
                                                :litTitle (subs lit-name 0 pos)
                                                :litSubtitle (subs lit-name (+ 2 pos))))
                                      (update acc2 :events assoc key
                                              (assoc event-with-lit-name :litTitle lit-name)))))))))]
    (transform-with guess-lit-title json)))

(defn make-lit-fields
  "Transform grade, date, color for Litcal consumption.
   NOTE: this does overwrite existing values for litDate, litRank and litColor."
  [json]
  (let [f
        (fn [event]
          (let
            [local-date (local-date-from-event event)
             event-with-lit-date (assoc event :litDate (.toString local-date))
             add-lit-rank
             (fn [event]
               (let
                 [year (.getYear local-date)
                  easter-date (compute-easter-date year)
                  grade (event :grade)
                  ev-name (event :name)
                  lit-rank
                  (cond
                    (= 7 grade)
                    (if (and (.isBefore local-date (.plusDays easter-date 1))
                             (.isBefore (.minusDays easter-date 3) local-date))
                      1                                     ; is Easter Triduum
                      2)
                    (= 6 grade) (if (re-find #"^\[" ev-name)
                                  4
                                  3)
                    (= 5 grade) (if (re-find #"Sunday" ev-name)
                                  6
                                  5)
                    (= 4 grade) (cond
                                  ; NOTE: unclear if the feasts of the Dedication of the
                                  ; Basilicas of Sts Peter and Paul or the Lateran Basilica
                                  ; should be of rank 8 or 7
                                  (re-find #"^\[" ev-name) 8
                                  (re-find #"Week of" ev-name) 9
                                  (re-find #"Octave of" ev-name) 9
                                  :else 7)
                    (= 3 grade) (if (re-find #"^\[" ev-name)
                                  11
                                  10)
                    (#{1 2} grade) 12
                    :else 13)]
                 (assoc event :litRank lit-rank)))
             add-lit-color (fn [event]
                             (let [color (event :color)
                                   parse-default-color (fn [lit-colors]
                                                         (if (some #(= "red" %) lit-colors)
                                                           "red"
                                                           (first lit-colors)))
                                   lit-color
                                   (parse-default-color (if (vector? color) color (clojure.string/split color #",")))] 
                               (if (= lit-color "purple")
                                 (assoc event :litColor "violet")
                                 (if (= lit-color "pink")
                                   (assoc event :litColor "rose")
                                   (assoc event :litColor lit-color)))))]
            (-> event-with-lit-date
                add-lit-rank
                add-lit-color)))]
    (transform-with
      (fn [acc key event]
        (update acc :events assoc key (f event)))
      json)))

(defn add-seasons-to-events
  "add litSeasons and litYears to the events"
  [json]
  (let
    ; There is an assumption that our events will only contain one BaptismLord event
    [
     ; returns true if event is between the start and end dates (inclusive)
     is-between
     (fn [ev-date start-date end-date]
       (and
         (.isAfter ev-date (.minusDays start-date 1))
         (.isBefore ev-date (.plusDays end-date 1))))

     find-lit-year
     (fn [ev-date]
       (let [lit-years (map second (:litYears json))]
         (first (filter
                  #(is-between ev-date (:startDate %) (:endDate %))
                  lit-years))))

     find-lit-season
     (fn [ev-date]
       (let [lit-seasons (flatten (map second (:litSeasons json)))]
         (first (filter #(is-between ev-date (:startDate %) (:endDate %)) lit-seasons))))

     add-year-season-to-event
     (fn [acc key event]
       (let [ev-date (local-date-from-event event)
             lit-year (find-lit-year ev-date)
             lit-season (find-lit-season ev-date)]
         (update acc :events assoc key
                 (assoc event
                   :litYearSecular (:secular lit-year)
                   :litSeasonName (:name lit-season)))))]
    (transform-with add-year-season-to-event json)))

(defn serialize-lit-years-seasons
  [json]
  (let [update-lit-entities
        (fn [update-fn]
          (fn [lit-entities]
            (into {}
                  (map (fn [[k v]]
                         [k (update-fn v)])
                       lit-entities))))

        serialize-dates
        (fn [obj]
          (-> obj
              (update :startDate str)
              (update :endDate str)))]
    (-> json
        (update :litYears (update-lit-entities serialize-dates))
        (update :litSeasons (update-lit-entities #(map serialize-dates %))))))

(defn litcal-or-events
  "returns json with the \"LitCal\" key turned to 'events' if it exists, otherwise returns the json as-is"
  [json]
  (let [evs (if (contains? json :LitCal)
              (:LitCal (dissoc json :Settings :Metadata :Messages))
              (get json :events []))
        msgs (get json :messages [])]
    {:events evs :messages msgs}))

(defn keep-one-event-per-date
  "returns json with only one event per date"
  [json]
  (let [should-ignore #(or (:isVigilMass %) (#{1 2} (:grade %)))
        events (filter #(not (should-ignore (second %))) (get json :events []))
        events-by-date (group-by #(local-date-from-event (second %)) events)
        dates-with-multiples (filter #(> (count (second %)) 1) events-by-date)
        keep-one (fn [events] (first (sort-by #(:litRank %) events)))
        events-with-one-per-date (into {} (map #(keep-one (second %)) events-by-date))]
    (-> json
        (assoc :events events-with-one-per-date)
        (assoc :messages (concat
                          (get json :messages [])
                          (map #(str "WARNING: Multiple events for date " (first %))
                               dates-with-multiples))))))

(comment
  (def events {:events
               {:ev1 {:date 100000 :name "a"}
                :ev2 {:date 1 :name "b" :litRank 1}
                :ev3 {:date 1 :name "c" :litRank 2}}})
  (group-by #(local-date-from-event (second %)) (:events events))
  (map second (:events events))
  (keep-one-event-per-date events)
  (map second {:d1 {:a 1} :d2 {:b 2}})
  (def json (json/parse-string (slurp "data/LCAPI-USA-2024.json") true))
  (def json (json/parse-string (slurp "data/LCAPI-USA-2024.transformed.json") true))
  (def json (json/parse-string (slurp "data/LCAPI-USA-2024.transformed-with-many-evs-per-date.json") true))
  (count (vals (json :LitCal)))
  (count (filter #(not (:isVigilMass %)) (vals (json :events))))
  (count (vals (json :events))) ; 366! it's a leap year
  (count (vals (json :events)))
  )

; TODO add litKey to events?
; TODO: how do these transformations deal with the case where the json has already been transformed?
; old Python code would skip the transformation if the key already existed
; NOTE: we can assume no minifaction. In the old job, the json was minified for
;; production's sake. Now, the JSON is used as an intermediate step to loading the
;; data into a database, so it can be kept fully-hydrated
(defn transform [json next-year-baptism-date]
(let [year (- (.getYear next-year-baptism-date) 1)
      start-str (.toString (LocalDate/of year 1 1))
      end-str (.toString (LocalDate/of year 12 31))]
  (-> json
      ;; Because some transforms depend on data from previous ones, order generally matters
      litcal-or-events
      (add-seasons-top-level next-year-baptism-date)
      add-urls
      add-gospels
      warn-if-many-refs
      find-missing-events
      guess-lit-titles
      make-lit-fields
      add-seasons-to-events
      keep-one-event-per-date
      (find-missing-dates start-str end-str)
      serialize-lit-years-seasons)))
      
; "2025-01-12" is "next year baptism date" for 2024
(defn -main [& args]
  (let [filename (nth args 0)
        next-year-baptism-str (nth args 1)]
    (println (str "Reading file " filename))
    (let [json (json/parse-string (slurp filename) true)
          next-year-baptism-date (LocalDate/parse next-year-baptism-str)]
      (spit
        (str filename ".transformed.json")
        (json/generate-string (transform json next-year-baptism-date) {:pretty true})))))

(comment
  (-main "data/LCAPI-USA-2024.json.transformed-pp-fixed.json" "2025-01-12")
  (-main "data/LCAPI-USA-2024.transformed.json" "2025-01-12")
  (-main "data/LCAPI-USA-2024.transformed-with-many-evs-per-date.json" "2025-01-12")
  )
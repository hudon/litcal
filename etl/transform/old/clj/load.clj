(ns hudon.litcal.load
  (:require
   [cheshire.core :as json] [next.jdbc :as jdbc]))

;; TODO: pull more out of the Rich comment and clean up functions


;; https://github.com/seancorfield/next-jdbc/blob/develop/doc/getting-started.md

(def ds (let [db {:dbtype "sqlite" :dbname "litcal.db"}
              ds (jdbc/get-datasource db)]
          (jdbc/execute! ds ["pragma foreign_keys = on"])
          ds))

(defn exe-sql! [sql]
  (jdbc/execute! ds [sql]))

(defn datestr->timestamp [s]
  (let [date (java.time.LocalDate/parse s)]
    (-> date
        (.atStartOfDay (java.time.ZoneId/of "UTC"))
        .toInstant
        .getEpochSecond)))

  (def j (json/parse-string
          (slurp "data/LCAPI-USA-2024.transformed.json") true))

  (defn get-season-id! [timestamp]
    (let [rs (jdbc/execute-one! ds ["select id from lit_season s where s.start_date_s <= ? and ? <= s.end_date_s"
                                    timestamp
                                    timestamp])]
      (rs :lit_season/id)))

  (defn get-year-id! [year]
    (let [rs (jdbc/execute-one! ds ["select id from lit_year y where y.secular = ?" year])]
      (rs :lit_year/id)))

  (defn get-color-id! [name]
    (let [rs (jdbc/execute-one! ds ["select id from lit_color c where c.name = ?" name])]
      (rs :lit_color/id)))

  (defn insert-event! [e]
    (let [litday-rs (jdbc/execute-one! ds ["
                      insert into lit_day (secular_date_s, lit_season_id) values (?,?)
                      returning id
                      "
                                           (:date e)
                                           (get-season-id! (:date e))]
                                       {:return-keys true})
          litday-id (:lit_day/id litday-rs)
          color-id (get-color-id! (:litColor e))]
      (jdbc/execute! ds ["
  insert into lit_celebration (lit_day_id, lit_color_id, rank, title, subtitle, gospel, gospel_ref, readings_url)
  values (?,?,?,?,?,?,?,?)
                      "
                         litday-id
                         color-id
                         (:litRank e)
                         (:litTitle e)
                         (:litSubtitle e)
                         (:gospelText e)
                         (:gospelRef e)
                         (:readingsUrl e)])))

(defn insert-events! [json]
;; TODO guard against duplicate events
  (doseq [e (:events json)]
    (try (insert-event! e)
         (catch Exception ex
           (println "error" ex)
           (println "event" e)
           (throw e))))
  )

(comment
  (:messages j)
  (def row (jdbc/execute-one! ds ["select * from litcal where name = 'USA'"]))
  (:litcal/name row)
  (:litcal/id row)
  (:litYears j)
  (datestr->timestamp "2024-01-01")
  (jdbc/execute! ds ["select * from lit_year"])
  (jdbc/execute! ds ["delete from lit_year where lit_calendar_id = ?" (:litcal/id row)])
  (doseq [[_ y] (:litYears j)]
    (jdbc/execute! ds ["
                        insert into lit_year (start_date_s, end_date_s, secular, lit_calendar_id) values (?, ?, ?, ?)
                        "
                       (datestr->timestamp (:startDate y))
                       (datestr->timestamp (:endDate y))
                       (:secular y)
                       (:litcal/id row)]))

  (:litColors j)
  (first (:events j))

  (def colors (distinct (map #(:litColor (second %)) (:events j))))
  (doseq [color colors]
    (jdbc/execute! ds ["insert into lit_color (name) values (?)" color]))
  (def color-ids-rs (jdbc/execute! ds ["select * from lit_color"]))
  (def color-ids (into {} (map (fn [r] [(:lit_color/name r) (:lit_color/id r)]) color-ids-rs)))

  (def years-rs (jdbc/execute! ds ["select * from lit_year"]))
  (def year-ids (into {} (map (fn [r] [(:lit_year/secular r) (:lit_year/id r)]) years-rs)))
  year-ids
  (color-ids "white")
  (defn keyw->int [k] (Integer/parseInt (name k)))
  (year-ids 2025)

  (:litSeasons j)
  (def s (second (first (:litSeasons j))))
  s
  (datestr->timestamp (:startDate (second (first (:litSeasons j)))))
  (doseq [[year seasons] (:litSeasons j)]
    (doseq [s seasons]
      (jdbc/execute! ds ["
                        insert into lit_season (name, start_date_s, end_date_s, lit_color_id, lit_year_id) values (?, ?, ?, ?, ?)
                        "
                         (:name s)
                         (datestr->timestamp (:startDate s))
                         (datestr->timestamp (:endDate s))
                         (color-ids (:color s))
                         (year-ids (keyw->int year))])))
  (jdbc/execute! ds ["select * from lit_season"])
  (jdbc/execute! ds ["select lit_season.name, c.name from lit_season join lit_color c on c.id = lit_season.lit_color_id"])


  (j :events)
  (count (j :events))
  (get-season-id! (:date (first events)))
  (get-year-id! (:litYearSecular (first events)))
  (get-color-id! (:litColor (first events)))
  (def events (->> (j :events)
                   (map second)
                   (filter #(not (:isVigilMass %)))))
  (count events)
  (first events)
  (:litSubtitle (first events))
  (jdbc/execute! ds ["delete from lit_celebration"])
  (jdbc/execute! ds ["delete from lit_day"])
  (jdbc/execute! ds ["select * from lit_celebration"])
  (jdbc/execute! ds ["select * from lit_day"])

  (type events)
  (jdbc/execute! ds ["select count(*) from lit_celebration"])
  (jdbc/execute! ds ["select count(*) from lit_day"])
  (defn plus-day [timestamp days]
    (let [date (java.time.Instant/ofEpochSecond timestamp)
          new-date (.plus date (java.time.Duration/ofDays days))]
      (.getEpochSecond new-date)))
  (def dates (map #(plus-day (datestr->timestamp "2024-01-01")  %) (range 50) ))
  (doseq [date dates]
  (let [rs
        (jdbc/execute-one! ds ["select * from lit_day where secular_date_s = ?" date])]
        (when (not rs) (println "no lit day for " date))))
  )

(comment
  ;; make litcal db

  (jdbc/execute! ds ["drop table if exists lit_calendar"])
  (jdbc/execute! ds ["create table lit_calendar (id integer primary key, name text)"])
  (jdbc/execute! ds ["insert into lit_calendar (name) values (?)" "USA"])
  (jdbc/execute! ds ["select * from lit_calendar"])

 ;; lit color
  (exe-sql! "drop table if exists lit_color")
  (exe-sql! "create table lit_color (id integer primary key, name text)")

  ;; lit season
  (exe-sql! "drop table if exists lit_season")
  (exe-sql! "
             create table lit_season (
             id integer primary key,
             name text, 
             start_date_s integer,
             end_date_s integer,
             lit_color_id integer, 
             lit_year_id integer,
             foreign key (lit_color_id) references lit_color(id),
              foreign key (lit_year_id) references lit_year(id)
             )")


  ;; lit day
  (exe-sql! "drop table if exists lit_day")
  (exe-sql! "
             create table lit_day (
             id integer primary key,
             secular_date_s integer,
             lit_season_id integer, 
             foreign key (lit_season_id) references lit_season(id),
             unique (secular_date_s)
             )")


  ;; lit year
  (exe-sql! "drop table if exists lit_year")
  (exe-sql! "
             create table lit_year (
             id integer primary key,
             start_date_s integer, end_date_s integer,
             secular integer,
             lit_calendar_id integer,
              foreign key (lit_calendar_id) references lit_calendar(id)
             )")


  ;; lit celebration
  ;; for now lit_day_id is unique because we only support 1 celebration per day
  (exe-sql! "drop table if exists lit_celebration")
  (exe-sql! "
             create table lit_celebration (
             id integer primary key,
             lit_day_id integer,
             lit_color_id integer,
             rank integer,
             title text,
             subtitle text,
             gospel text,
             gospel_ref text,
             readings_url text,
             foreign key (lit_day_id) references lit_day(id),
             foreign key (lit_color_id) references lit_color(id),
              unique (lit_day_id)
             )")
  )
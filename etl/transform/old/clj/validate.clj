(ns hudon.litcal.validate
  (:require [cheshire.core :as json]))


(defn- cmp-ev [ev py-ev]
  (let [keys (disj (set (keys py-ev)) :litKey)
        keymap #(if (= :gospel %) :gospelText %)]
    (reduce (fn [acc k]
              (let [v1 (ev (keymap k))
                    v2 (py-ev k)]
                (if (= v1 v2)
                  acc
                  (conj acc (str k ": " v1 " != " v2)))))
            []
            keys)))

(defn validate-events [clj-json py-json]
  (reduce (fn [acc [ev-key py-ev]]
            (let [errors (cmp-ev (get-in clj-json [:events ev-key]) py-ev)]
              (if (empty? errors)
                acc
                (conj acc (str ev-key ": " errors)))))
          []
          (:litEvents py-json)))

; TODO validate against old Python agent output
(defn -main [& args]
  (let [clj-filename (nth args 0)
        py-filename (nth args 1)]
    (let [clj-json (json/parse-string (slurp clj-filename) true)
          py-json (json/parse-string (slurp py-filename) true)
          errors (validate-events clj-json py-json)]
      (if (empty? errors)
        (println "No errors")
        (do
          (println (count errors) "errors:")
          (doseq [error errors]
            (println error)))))))

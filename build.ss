#!/usr/bin/env gxi
;;; -*- Gerbil -*-
(import :std/build-script)

(setenv "GERBIL_PATH" "/srv/ecm/app/.gerbil")

(defbuild-script
  '("www/conf"
	"www/db"
	"www/user"
	"www/req"
	"www/firebase"))

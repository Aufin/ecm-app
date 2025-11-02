#!/usr/bin/env gxi
;; -*- Gerbil -*-

  (import :std/build-script)

  (defbuild-script
    '("login/conf"
      "login/database"
      "login/types"
      "login/api"
      "login/handler"
      "login/reset-password"
       (exe: "login")
      "user/database/interface"
      "user/database/pool"
      "user/database"
      "user/entity"
))

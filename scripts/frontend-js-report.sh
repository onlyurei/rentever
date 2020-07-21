#!/bin/sh
plato -r -d ./workspace/js-report/frontend -x "lib/|api-|common|build|nls|routes" ../assets/js
open ./workspace/js-report/frontend/index.html

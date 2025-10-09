#!/usr/bin/env bash

set -euo pipefail

pandoc --from=markdown --to=html --template=index.html.template --output=index.html doc.md  --metadata title="Interval Calculator"
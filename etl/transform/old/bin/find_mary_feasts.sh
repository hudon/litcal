#!/bin/bash

# Get all feasts mentioning Mary, excluding Saturdays
grep -i -B2 -e '"name": "[^S].*mary' data/LCAPI-USA-2022-final.json
# Filter for just the event key
grep -i -B2 -e '"name": "[^S].*mary' data/LCAPI-USA-2022-final.json | awk '(NR+3)%4==0'

# Include Saturdays and get the "after" context
grep -i -A11 -e '"name": ".*mary' data/LCAPI-USA-2022-final.json

# Find "Our Lady" feasts as well
grep -i -B3 -e '"name": ".*our lady' data/LCAPI-USA-2022-final.json

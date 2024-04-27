#!/bin/bash

grep -R --exclude-dir dist-newstyle --exclude-dir __pycache__ --exclude-dir node_modules 'TODO' *

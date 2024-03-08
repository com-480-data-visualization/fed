#!/bin/bash

for i in {0..23}; do
   echo "Running for $i"
   python3 most_polluters.py $i
done

echo "Running players.py"
python players.py

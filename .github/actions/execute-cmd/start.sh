#!/bin/sh
set -e

INPUT_CMD=${INPUT_CMD_TO_EXECUTE}

[ -z "${INPUT_CMD}" ] && {
    echo 'Missing input "cmd_to_execute: ${{ secrets.GITHUB_TOKEN }}".';
    exit 1;
};

echo "Executing cmd $INPUT_CMD";

bash -c $INPUT_CMD;

#!/usr/bin/env bash

. $( dirname $0 )/common.sh

CMD="npm run start"

stty -echo
read -p "Password please: " -s wallet__password
stty echo

export wallet__password

${CMD} ${ARGS[@]} $@

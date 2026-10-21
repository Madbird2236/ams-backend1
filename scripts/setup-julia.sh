#!/usr/bin/env bash
# Idempotent Julia install via conda-forge (works when julialang.org is blocked but conda.anaconda.org is allowed).
set -euo pipefail
PREFIX=${JULIA_ENV:-/opt/julia-env}
if [ -x "$PREFIX/bin/julia" ]; then "$PREFIX/bin/julia" --version; exit 0; fi
MM=/opt/mm/bin/micromamba
if [ ! -x "$MM" ]; then
  mkdir -p /opt/mm && curl -fsSL https://conda.anaconda.org/conda-forge/linux-64/micromamba-2.9.0-0.tar.bz2 | tar -xj -C /opt/mm bin/micromamba
fi
"$MM" create -y -q -p "$PREFIX" -c conda-forge julia
ln -sf "$PREFIX/bin/julia" /usr/local/bin/julia
julia --version

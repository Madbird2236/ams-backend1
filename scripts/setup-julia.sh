#!/usr/bin/env bash
# Idempotent Julia setup for cloud sessions.
# - Julia binary from conda-forge (julialang.org downloads are blocked by the network policy).
# - Packages via GitHub (pkg.julialang.org is blocked): no package server, registry cloned with git.
set -euo pipefail
PREFIX=${JULIA_ENV:-/opt/julia-env}
if [ ! -x "$PREFIX/bin/julia" ]; then
  MM=/opt/mm/bin/micromamba
  if [ ! -x "$MM" ]; then
    mkdir -p /opt/mm && curl -fsSL https://conda.anaconda.org/conda-forge/linux-64/micromamba-2.9.0-0.tar.bz2 | tar -xj -C /opt/mm bin/micromamba
  fi
  "$MM" create -y -q -p "$PREFIX" -c conda-forge julia
fi
ln -sf "$PREFIX/bin/julia" /usr/local/bin/julia

# Make every shell use GitHub for packages.
cat > /etc/profile.d/julia-pkg.sh <<'ENV'
export JULIA_PKG_SERVER=""
export JULIA_PKG_USE_CLI_GIT=true
ENV
grep -q julia-pkg.sh ~/.bashrc 2>/dev/null || echo '. /etc/profile.d/julia-pkg.sh' >> ~/.bashrc
export JULIA_PKG_SERVER="" JULIA_PKG_USE_CLI_GIT=true

julia -e 'using Pkg; isempty(Pkg.Registry.reachable_registries()) && Pkg.Registry.add(url="https://github.com/JuliaRegistries/General.git"); println("Julia ", VERSION, " ready")'

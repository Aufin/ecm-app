podman := podman
local_tag := ecm:latest
run_tag := $(local_tag)


build:
	$(podman) build -t $(local_tag) .

run:
	$(podman) run -ti --add-host=db-ecm:host-gateway -p "0.0.0.0:8443:443" $(run_tag)

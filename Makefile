foo:
	echo "OK"

deploy:
	git pull
	docker-compose build
	docker-compose stop
	docker-compose up -d
